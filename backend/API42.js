class API42 {
    URL = "https://api.intra.42.fr/";
    MAX_PAGE_SIZE = 100;
    static UID;
    static SECRET;

    static getAuthUrl() {
        return "https://api.intra.42.fr/oauth/authorize?client_id=" + this.UID + "&redirect_uri=http%3A%2F%2F127.0.0.1%2Fapp&response_type=code"
    }


    static getToken(clientToken) {
        return this._post(
            "/oauth/token",
            `grant_type=authorization_code&client_id=${this.UID}&client_secret=${this.SECRET}&code=${clientToken}`
        );
    }

    constructor(token) {
        this._token = token;
    }

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

    post(url, data, headers = {}) {
        // TODO
    }

    static async _post(url, data, headers = {}) {
        const response = await fetch(url,
            {
                method: "POST",
                headers: headers,
                data: data,
                mode: "no-cors"
            }
        ).then(response => response.json());
        return response;
    }
}

module.exports = API42;