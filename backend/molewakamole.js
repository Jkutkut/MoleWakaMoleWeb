const http = require('http');
const path = require('path');
const fs = require('fs');

const root = path.dirname(require.main.filename);

const API42 = require('./API42.js');

const handleRequest = (req, res) => {
    let attributes = req.url.split('?');
    let url = attributes[0];
    console.log("Incoming request: '" + url + "'");

    if (url === "/") {
        res.writeHead(302, {
            'Location': 'login',
            'Content-Type': 'text/html'
        });
        res.end();
    }
    else if (url === "/login") {
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        // res.write(loginHtml);
        res.write('<!DOCTYPE html> \
        <html lang="en"> \
        <head> \
            <meta charset="UTF-8"> \
            <title>molewakamole</title> \
            <script src="res/js/molewakamole.js"></script> \
            <script src="res/js/API42.js"></script> \
        </head> \
        <body> \
            <script> \
                window.location = "');
        res.write(API42.getAuthUrl());
        res.write('"; \
            </script> \
        </body> \
        </html>');
        res.end();
    }
    else if (url === "/app") {
        // TODO token not generated yet
        let params = attributes[1].split("&");
        let code = params[0].split("=");
        let clientToken = code[1];
        console.log("clientToken:", clientToken);
        // let token = API42.getToken(clientToken);
        let api = new API42();
        let token = api.getToken(clientToken);
        console.log("token:", token);
        res.writeHead(200, {
            'Content-Type': 'text/html'
        });
        res.write("<h1>App</h1>");
        res.end();
    }
    else { // Default response
        res.writeHead(200, {'Content-Type': 'text/plain'});
        res.end('Not implemented yet\n');
    }
}

fs.readFile(root + "/.secrets", (err, data) => {
    if (err) throw err;
    data = data.toString();
    let keys = data.split("\n");
    for (let i = 0, key; i < keys.length; i++) {
        key = keys[i].split('=');
        API42[key[0]] = key[1];
    }
});

const server = http.createServer(handleRequest);
server.listen(80);