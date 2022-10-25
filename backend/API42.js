const https = require('https');
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

class API42 {
    URL = "https://api.intra.42.fr/";
    MAX_PAGE_SIZE = 100;
    static UID;
    static SECRET;

    static getAuthUrl() {
        return API42.URL + "oauth/authorize?client_id=" + API42.UID + "&redirect_uri=http%3A%2F%2F127.0.0.1%2Fapp&response_type=code"
    }


    async getToken(clientToken) {
        /*const formData = new FormData();

        formData.append("grant_type", "authorization_code");
        formData.append("client_id",  API42.UID);
        formData.append("client_secret", API42.SECRET);
        formData.append("code", clientToken);
        formData.append("redirect_uri", "http://127.0.0.1/app");*/

        const request = new XMLHttpRequest();
        request.open("POST", API42.URL + "oauth/token");
        request.send(`grant_type=authorization_code&client_id=${API42.UID}&client_secret=${API42.SECRET}&code=${clientToken}&redirect_uri=http%3A%2F%2F127.0.0.1%2callback`);

        request.addEventListener("readystatechange", (event) => {
            console.log(request);
        })
        
        // return this.post(
        //     "oauth/token",
        //     {
        //         grant_type: "authorization_code",
        //         client_id: API42.UID,
        //         client_secret: API42.SECRET,
        //         code: clientToken,
        //         redirect_uri: "http://127.0.0.1/app",
        //         // state: "random_state"
        //     }
        //     // `grant_type=authorization_code&client_id=${API42.UID}&client_secret=${API42.SECRET}&code=${clientToken}&redirect_uri=http%3A%2F%2F127.0.0.1%2callback`
        // );
    }

    constructor() {

    }
    // constructor(token) {
    //     // this._token = token;
    // }

    get basicHeader() {
        return {
            'Authorization': 'Bearer ' + this._token,
            'Content-Type': 'application/json'
        };
    }

    formatUrl(url, filters = []) {
        let filtersString = filters.join('&');
        if (filtersString.length > 0)
            filtersString = '?' + filtersString;
        return this.URL + url + filtersString;
    }

    get(url, filters = [], header = null, multiRequest = false, page_size = this.MAX_PAGE_SIZE) {
        if (!header)
            header = this.basicHeader;
        // if (!filters.find(filter => filter.key.includes('page[size]')))
        //     filters.push(`page[size]=${page_size}`); // TODO check this makes sense
        if (!multiRequest)
            return this._get(this.formatUrl(url, filters), header);
    }

    async _get(url, header = {}) {
        console.log(url);
        console.log(header);
        const response = await fetch(url, {
            method: 'GET',
            headers: header,
            mode: 'no-cors',
        });
        return response;
    }

    post(url, data={}, headers = {}) {
        return this._post(
            this.formatUrl(url),
            data,
            headers
        );
    }

    async _post(fullURL, data, headers = {}) {
        console.log("***************************");
        console.log("full url:", fullURL);
        console.log("data:", data);
        console.log("headers:", headers);
        console.log("***************************");
        
        return fetch(fullURL,
            {
                method: "POST",
                // headers: headers,
                // data: JSON.stringify(data),
                data: data,
                // headers: {
                //     'Content-Type': 'application/json'
                // }
            }
        ).then(response => {
            console.log("response:", response);
        }).catch(error => {
            console.log("error:", error);
        });

    }
}

module.exports = API42;