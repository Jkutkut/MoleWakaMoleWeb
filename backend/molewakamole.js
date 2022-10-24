const http = require('http');
const path = require('path');
const fs = require('fs');

const root = path.dirname(require.main.filename);
console.log(root);

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

class API42 {

    static CLIENT_ID;

    static getAuthUrl() {
        return "https://api.intra.42.fr/oauth/authorize?client_id=" + this.CLIENT_ID + "&redirect_uri=http%3A%2F%2F127.0.0.1%2Fapp&response_type=code"
    }
}

fs.readFile(root + "/.secretClientId", (err, data) => {
    if (err) throw err;
    API42.CLIENT_ID = data;
});

const server = http.createServer(handleRequest);
server.listen(80);