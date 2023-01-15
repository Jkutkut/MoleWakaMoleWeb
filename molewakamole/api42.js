class API42 {
    URL = "https://api.intra.42.fr";
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
        this._token = await this.post(
            '/oauth/token',
            {
                grant_type: 'client_credentials',
                client_id: this._client_id,
                client_secret: this._secret
            }
        );
    }

    get token() {
        return this._token;
    }

    get basicHeader() {
        return {
            'Authorization': 'Bearer ' + this.token['access_token'],
            'Content-Type': 'application/json'
        };
    }

    formatUrl(url, filters = []) {
        let filtersString = filters.join('&');
        if (filtersString.length > 0)
            filtersString = '?' + filtersString;
        return this.URL + url + filtersString;
    }

    async get(url, filters = [], multiRequest = false, amount = this.MAX_PAGE_SIZE) {
        return await this.updateToken().then(async () => {
            let data;
            let header = this.basicHeader;

            if (!multiRequest) {
                if (amount <= this.MAX_PAGE_SIZE) {
                    filters.push(`page[size]=${amount}`);
                    data = await this._get(this.formatUrl(url, filters), header);
                }
                else {
                    let page = 1;
                    data = [];
                    let fs, response;
                    while (amount > 0) {
                        fs = [
                            ...filters,
                            `page[size]=${Math.min(amount, this.MAX_PAGE_SIZE)}`,
                            `page[number]=${page}`
                        ];
                        response = await this._get(this.formatUrl(url, fs), header);
                        data.push(...response);
                        if (response.length < Math.min(amount, this.MAX_PAGE_SIZE))
                            break;
                        amount -= this.MAX_PAGE_SIZE;
                        page++;
                    }
                }
            }
            else {
                let page = 1;
                data = [];
                let fs, response;
                while (true) {
                    fs = [
                        ...filters,
                        `page[size]=${Math.min(amount, this.MAX_PAGE_SIZE)}`,
                        `page[number]=${page}`
                    ];
                    response = await this._get(this.formatUrl(url, fs), header);
                    data.push(...response);
                    if (response.length < Math.min(amount, this.MAX_PAGE_SIZE))
                        break;
                    amount -= this.MAX_PAGE_SIZE;
                    page++;
                }
            }
            return data;
        });
    }

    async _get(url, header = {}) {
        console.log(url); // TODO remove
        const response = await fetch(url, {
            method: 'GET',
            headers: header,
            mode: 'no-cors',
        });
        return await response.json();
    }

    async post(url, body, header = null) {
        if (header == null)
            header = {'Content-Type': 'application/json'};
        return (await this._post(this.formatUrl(url), body, header)).json();
    }

    async _post(url, body, header = {}) {
        let response = await fetch(url, {
            method: 'POST',
            headers: header,
            body: JSON.stringify(body),
        });
        // TODO check if response is ok
        return response;
    }

}

module.exports = API42;