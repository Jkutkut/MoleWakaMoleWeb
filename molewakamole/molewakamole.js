const API42 = require('./api42');
const DateUtils = require('./dateutils');
const hb = require('express-handlebars').create();
const {
    parseFileSync
} = require('css-variables-parser');

class Molewakamole {

    static CSS = parseFileSync('./public/css/term.css');

    constructor(client, secret) {
        this.api = new API42(client, secret);
    }

    get(req, res) {
        if (this.specialRequest(req)) {
            this[req.body.cmd](req, res);
            return;
        }
        this.api.get(
            req.body.endpoint,
            req.body.filters,
            req.body.multiRequest,
            req.body.pageSize
        ).then(result => {
            if (result.length == 0 || result[0] == {} || result[0] == [] || result[0] == null) {
                res.sendStatus(404);
                return;
            }
            let data = this.formatData(req.body, result);

            if (req.body.cmd == 'json')
                res.send(this.stringify(data));
            else 
                res.render('api/' + req.body.cmd, {data: data});
        }).catch(err => {
            console.log(err);
            res.sendStatus(503);
        });
    }

    // Special requests
    specialRequest(req) {
        const cmd = req.body.cmd;
        const special = ['whitenova'];
        return special.includes(cmd);
    }

    async whitenova(req, res) {
        let options = req.body.options;

        const period = DateUtils.whitenovaPeriod(options.period);
        const apiOptions = {
            beginRange: `range[begin_at]=${period.startStr},${period.endStr}`,
            endRange: `range[end_at]=${period.startStr},${period.endStr}`,
            sortFilter: "sort=begin_at",
        };

        const locations = jsonJoinNoDuplicates(
            await this.api.get(
                `/v2/users/${options.login}/locations`,
                [apiOptions.endRange, apiOptions.sortFilter],
                true
            ),
            await this.api.get(
                `/v2/users/${options.login}/locations`,
                [apiOptions.beginRange, apiOptions.sortFilter],
                true
            ),
            (l1, l2) => l1.id == l2.id
        );

        // TODO get data from API
        //   - Get corrections
        //   - Get events
        const corrections = [];
        const events = [];

        const {
            whitenovaLocationData,
            graph
        } = parser.whitenova(options, period, locations, corrections, events);

        hb.render(
            "./views/api/whitenovaLocation.hbs",
            whitenovaLocationData
        ).then(html => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([html, graph]));
        });
    }

    formatData(request, data) {
        if (parser[request.cmd])
            return parser[request.cmd](data);
        else {
            request.cmd = 'json';
            return data;
        }
    }

    // Stringify data

    stringify(data, depth = 0) {
        let s;
        if (Array.isArray(data)) {
            if (data.length == 0)
                return `[]`;
            s = `[\n`;
            for (let i = 0; i < data.length; i++) {
                s += `${this.indent(depth + 1)}${this.stringify(data[i], depth + 1)},\n`;
            }
            s = s.slice(0, -2) + `\n${this.indent(depth)}]`;
        }
        else if (typeof data == 'object') {
            if (data == {})
                return `{}`;
            else if (data == null)
                return '<obj>null</obj>';
            s = `{\n`;
            for (let key in data) {
                s += this.indent(depth + 1);
                s += `${key}: ${this.stringify(data[key], depth + 1)},\n`;
            }
            s = s.slice(0, -2) + `\n${this.indent(depth)}}`;
        }
        else {
            if (typeof data == 'string')
                s = `<string>${data}</string>`;
            else if (typeof data == 'number')
                s = `<number>${data}</number>`;
            else if (typeof data == 'boolean')
                s = `<boolean>${data}</boolean>`;
            else
                s = data;
        }
        return s;
    }

    indent(depth) {
        if (this.indentArr == undefined)
            this.indentArr = [];
        if (this.indentArr[depth] == undefined)
            this.indentArr[depth] = "  ".repeat(depth);
        return this.indentArr[depth];
    }
}

const parser = {
    // Normal parsers
    'dateTime': (d) => {
        if (d == null)
            return "Now";

        let date = new Date(d);
        // TODO change to locale
        // hh:mm:ss dd/mm/yyyy
        let result = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        return result;
    },
    // API parsers
    'campusID2name': (c) => {
        let result = {
            22: "MADRID",
            14: "CODAM",
            37: "MALAGA",
            40: "URDULIZ",
            46: "BARCELONA",
            44: "WOLFSBURG"
        }[c];
        return (result == undefined) ? "UNKNOWN" : result;
    },
    'host': (host, campusId=22) => {
        if (campusId == 22) {
            let clusterName = {
                'c1': 'Enterprise',
                'c2': 'Millennium Falcon',
                'c3': 'Endurance'
            }[host.substring(0, 2)];
            if (clusterName)
                return `${clusterName} - ${host}`;
        }
        return host;
    },
    // general parsers
    'locationParser': (data) => {
        data.host = parser.host(data.host, data.campus_id);
        data.begin_at = parser.dateTime(data.begin_at);
        data.end_at = parser.dateTime(data.end_at);
        if (data.end_at == "Now") {
            data.end_at = "";
            data.not_ended = "Not ended";
        }
        data.campusName = parser.campusID2name(data.campus_id);
        return data;
    },
    // cmd parsers
    'location': (data) => {
        return parser.locationParser(data[0]);
    },
    'loginHistory': (data) => {
        for (let i = 0; i < data.length; i++)
            data[i] = parser.locationParser(data[i]);
        return data;
    },
    'search': (data) => data,
    // WHITENOVA

    'whitenova-locations': (options, period, locations) => {
        const periodHours = new Array(DateUtils.daysInBetween(period.start, period.end)).fill(0);
        const log = [];
        let l, totalTime = 0;
        for (let i = 0; i < locations.length; i++) {
            if (locations[i].end_at == null)
                continue; // If still logged in, skip this location
            l = {
                start: DateUtils.fromUTC(locations[i].begin_at),
                end: DateUtils.fromUTC(locations[i].end_at)
            };
            l.start_day = l.start.getDate();
            l.end_day = l.end.getDate();
            l.duration = (l.end - l.start) / 3600000;

            log.push({
                begin_at: DateUtils.formatLocal(l.start, 'hh:mm:ss dd-MM-yyyy'),
                end_at: DateUtils.formatLocal(l.end, 'hh:mm:ss dd-MM-yyyy'),
                duration: DateUtils.formatMillis(l.end - l.start),
                host_name: parser.host(locations[i].host)
            });

            totalTime += l.end - l.start;

            if (l.start_day == l.end_day) {
                periodHours[l.start_day - period.start.getDate()] += l.duration;
            }
            else { // ! Untested
                periodHours[l.start_day - period.start.getDate()] += (24 - l.start.getHours()) + l.start.getMinutes() / 60;
                for (let j = l.start_day + 1; j < l.end_day; j++)
                    periodHours[j - period.start.getDate()] += 24;
                periodHours[l.end_day - period.start.getDate()] += l.end.getHours() + l.end.getMinutes() / 60;
            }
        }
        return {periodHours, log, totalTime};
    },
    'whitenova': (options, period, locations = [], corrections = [], events = []) => {
        // TODO implement corrections
        // TODO implement events
        // TODO format data
        // TODO show if whitenova reached

        const {periodHours: realHours} = parser['whitenova-locations'](options, period, locations);

        if (locations.length > 0) { // Special locations cases
            const begin_date = DateUtils.fromUTC(locations[0].begin_at);
            if (begin_date < period.start) // If logged in before period
                locations[0].begin_at = period.startStr;
            let lastEnd;
            if (locations[locations.length - 1].end_at == null) { // If still logged in
                lastEnd = DateUtils.now();
            }
            else // If logged out
                lastEnd = DateUtils.fromUTC(locations[locations.length - 1].end_at);
            if (lastEnd > period.end) // If end is after period
                locations[locations.length - 1].end_at = period.endStr;
            else
                locations[locations.length - 1].end_at = DateUtils.format(lastEnd);
        }

        const {periodHours, log, totalTime} = parser['whitenova-locations'](options, period, locations);

        return {
            graph: {
                xdata: period.days,
                fts: [
                    {
                        name: 'Hours of activity',
                        data: periodHours,
                        color: Molewakamole.CSS['c-blue']
                    },
                    {
                        name: '"Official" whitenova',
                        data: realHours,
                        color: Molewakamole.CSS['c-green']
                    },
                    // {
                    //     name: 'Corrections',
                    //     data: [0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
                    //     color: Molewakamole.CSS['c-orange']
                    // },
                    // {
                    //     name: 'Events',
                    //     data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                    //     color: Molewakamole.CSS['c-green']
                    // }
                ]
            },
            whitenovaLocationData: {
                info: {
                    login: options.login,
                    timezone: "Madrid",
                    start_at: DateUtils.formatLocal(period.start, 'hh:mm dd-MM-yyyy'),
                    end_at: DateUtils.formatLocal(period.end, 'hh:mm dd-MM-yyyy')
                },
                locations: log,
                analysis: {
                    totalTime: DateUtils.formatMillis(totalTime),
                    whitenovaTime: (totalTime >= 43200000) ? "Whitenova reached!" : "" // 12 * 60 * 60 * 1000
                }
            }
        };
    }
}

function jsonJoinNoDuplicates(arr1, arr2, eqFt) {
    const arr = [...arr1];
    for (let i = 0; i < arr2.length; i++) {
        let found = false;
        for (let j = 0; j < arr.length; j++) {
            if (eqFt(arr[j], arr2[i])) {
                found = true;
                break;
            }
        }
        if (!found)
            arr.push(arr2[i]);
    }
    return arr;
}

module.exports = Molewakamole;