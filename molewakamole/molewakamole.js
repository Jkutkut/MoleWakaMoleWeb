const { request } = require('../app');
const API42 = require('./api42');

class Molewakamole {
    constructor(client, secret) {
        this.api = new API42(client, secret);
    }

    get(req, res) {
        this.api.get(req.body.endpoint, req.body.filters).then(result => {
            if (result.length == 0 || result[0] == {} || result[0] == [] || result[0] == null) {
                res.sendStatus(404);
                return;
            }
            let data = this.formatData(req.body, result);

            if (true || req.body.cmd == 'json') {
                res.send(this.stringify(data));
            }
            else 
                res.render('api/' + req.body.cmd, {data: data});
        }).catch(err => {
            res.status(503).send(JSON.stringify(err));
        });
    }

    formatData(request, data) {
        switch (request.cmd) {
            case 'location':
                return data[0];
            default:
                request.cmd = 'json';
                return data;
        }
    }

    stringify(data, depth = 0) {
        let s;
        if (Array.isArray(data)) {
            s = `${this.indent(depth)}[\n`;
            for (let i = 0; i < data.length; i++) {
                s += `${this.stringify(data[i], depth + 1)},\n`;
            }
            s += "]";
        }
        else if (typeof data == 'object') {
            s = `${this.indent(depth)}{\n`;
            for (let key in data) {
                s += `${this.indent(depth + 1)}${key}: ${this.stringify(data[key], depth + 1)},\n`;
            }
            s += `${this.indent(depth)}}`;
        }
        else {
            if (typeof data == 'string')
                s = `<string>${data}</string>`;
            else if (typeof data == 'number')
                s = `<number>${data}</number>`;
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

module.exports = Molewakamole;