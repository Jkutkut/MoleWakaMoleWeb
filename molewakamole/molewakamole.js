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

            if (req.body.cmd == 'json')
                res.send(this.stringify(data));
            else 
                res.render('api/' + req.body.cmd, {data: data});
        }).catch(err => {
            console.log(err);
            res.sendStatus(503);
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
    'dateTime': (d) => {
        if (d == null)
            return "Now";

        let date = new Date(d);
        // TODO change to locale
        // hh:mm:ss dd/mm/yyyy
        let result = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    },
    // cmds
    'location': (data) => {
        data = data[0];
        data.begin_at = parser.dateTime(data.begin_at);
        data.end_at = parser.dateTime(data.end_at);
        return data;
    }
}

module.exports = Molewakamole;