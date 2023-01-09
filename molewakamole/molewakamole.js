const API42 = require('./api42');
const DateUtils = require('./dateutils');
const hb = require('express-handlebars').create();

class Molewakamole {
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
        console.log(options);

        const period = DateUtils.whitenovaPeriod(options.period);
        const periodStr = {
            start: DateUtils.format(period.start),
            end: DateUtils.format(period.end)
        };
        const timeRange = {
            start: `range[begin_at]=${periodStr.start},${periodStr.end}`,
            end: `range[end_at]=${periodStr.start},${periodStr.end}`,
        }
        const sort = "sort=begin_at";

        const locations = jsonJoinNoDuplicates(
            await this.api.get(
                `/v2/users/${options.login}/locations`,
                [timeRange.end, sort],
                true
            ),
            await this.api.get(
                `/v2/users/${options.login}/locations`,
                [timeRange.start, sort],
                true
            ),
            (l1, l2) => l1.id == l2.id
        );

        if (locations.length > 0) {
            const begin_date = DateUtils.fromUTC(locations[0].begin_at);
            if (begin_date < period.start) // If logged in before period
                locations[0].begin_at = periodStr.start;
            
            let lastEnd;
            if (locations[locations.length - 1].end_at == null) // If still logged in
                lastEnd = DateUtils.now();
            else
                lastEnd = DateUtils.fromUTC(locations[locations.length - 1].end_at);
            if (lastEnd > period.end) // If logged out after period
                locations[locations.length - 1].end_at = periodStr.end;
        }

        // TODO get data from API
        //   - Get corrections
        //   - Get events
        // TODO format data
        // TODO use CSS colors
        // TODO show if whitenova reached
        // TODO implement true whitenova

        // TODO refactor to parser
        const periodHours = [];
        for (let i = 0; i < period.days.length; i++)
            periodHours[i] = 0;
        const log = [];
        let l, totalTime = 0;
        for (let i = 0; i < locations.length; i++) {
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

            // console.log("------------------")
            // console.log(DateUtils.formatLocal(l.start, 'dd-MM-yyyy hh:mm:ss'))
            // console.log(DateUtils.formatLocal(l.end, 'dd-MM-yyyy hh:mm:ss'))
            // console.log("------------------")

            if (l.start_day == l.end_day) {
                periodHours[l.start_day - period.start.getDate()] += l.duration;
                totalTime += l.end - l.start;
            }
            else {
                // TODO
                totalTime += 0;
            }
            // TODO full report
        }
        // TODO
        // TODO refactor to parser

        let jsonResponse = {
            xdata: period.days,
            fts: [
                {
                    name: 'Hours of activity',
                    data: periodHours,
                    color: "#18b6ff"
                },
                {
                    name: 'Hours of activity (test)',
                    data: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 11, 0],
                    color: "#ff9528"
                },
                // {
                //     name: 'Corrections',
                //     data: [0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
                //     // color: termColors.orange
                //     color: "#ff9528"
                // },
                // {
                //     name: 'Events',
                //     data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                //     // color: termColors.green
                //     color: '#1beb9e'
                // }
            ]
        };

        hb.render(
            "./views/api/whitenovaLocation.hbs",
            {
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
        ).then(html => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify([html, jsonResponse]));
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
    'search': (data) => data
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