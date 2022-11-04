class API42 {
    URL = "https://api.intra.42.fr/";
    MAX_PAGE_SIZE = 100;

    constructor(client_id, secret) {
        this._token = null;
        this._client_id = client_id;
        this._secret = secret;

        console.log("API42 initialized");
    }

    async updateToken() {
        if (this._token != null) {
            let expirationDate = (this._token['created_at'] + this._token['expires_in']) * 1000;
            if (expirationDate > Date.now())
                return this._token;
            else {
                console.log("token expired");
                console.log("expiration date: " + expirationDate);
                console.log("current date   : " + Date.now());
            }
        }
        let response = await fetch(
            this.URL + 'oauth/token',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grant_type: 'client_credentials',
                    client_id: this._client_id,
                    client_secret: this._secret,
                })
            }
        );
        let r = await response.json();
        this._token = r;
    }

    get token() {
        return this._token;
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
}

module.exports = API42;