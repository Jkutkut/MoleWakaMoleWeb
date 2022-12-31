const API42 = require('./api42');

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

    whitenova(req, res) {
        let options = req.body.options;
        console.log(options);

        // TODO get data from API

        let jsonResponse = {
            xdata: [
                '16-12', '17-12', '18-12', '19-12', '20-12', '21-12', '22-12', '23-12',
                '24-12', '25-12', '26-12', '27-12', '28-12', '29-12', '30-12'
            ],
            fts: [
                {
                    name: 'Hours of activity',
                    data: [7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 11, 0],
                    // color: termColors.blue // TODO
                    color: "#18b6ff"
                },
                {
                    name: 'Corrections',
                    data: [0, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 2, 0, 0],
                    // color: termColors.orange
                    color: "#ff9528"
                },
                {
                    name: 'Events',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
                    // color: termColors.green
                    color: '#1beb9e'
                }
            ]
        };

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(jsonResponse));
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
    'host': (host, campusId) => {
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

module.exports = Molewakamole;