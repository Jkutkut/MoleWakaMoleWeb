async function handleCmdAPI(cmdArr, cmd) {
    if (!apiCmdsHandler.hasOwnProperty(cmd['cmd']))
        return "<error>Error</error>: API method not implemented";
    const request = apiCmdsHandler[cmd['cmd']](cmdArr, cmd);
    const responseHandler = apiResponseHandler[cmd['cmd']] || apiResponseHandler['def'];

    const response = await makeRequestAPI(request);
    if (response.status != 200)
        return `<error>Error</error>: ${response.status} ${response.statusText}`;
    return responseHandler(cmdArr, cmd, response);
}

async function makeRequestAPI(request) {
    return await fetch(
        '/api/request',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        }
    );
}

const apiResponseHandler = {
    def: (cmdArr, cmd, response) => response.text(),
    whitenova: async (cmdArr, cmd, response) => {
        const blocks = [];
        for (let block of await response.json()) {
            if (typeof block == 'string')
                blocks.push(block);
            else if (typeof block == 'object')
                blocks.push(createChart(block['xdata'], block['fts']));
        }
        return blocks;
    }
};

const apiCmdsHandler = {
    location: (cmdArr, cmd) => {
        let login = cmdArr[cmdArr.length - 1];
        return {
            cmd: cmd['cmd'],
            endpoint: `/v2/users/${login}/locations`,
            filters: [],
            multiRequest: false,
            pageSize: 1
        }
    },
    loginHistory: (cmdArr, cmd) => {
        let login = cmdArr[cmdArr.length - 1];
        let amount = cmd['default']['amount'];

        let idx = 1;
        while (idx < cmdArr.length - 1) {
            if (cmdArr[idx++] == '-n')
                amount = cmdArr[idx++];
        }

        return {
            cmd: cmd['cmd'],
            endpoint: `/v2/users/${login}/locations`,
            filters: [],
            multiRequest: false,
            pageSize: amount
        };
    },
    search: (cmdArr, cmd) => {
        let search;
        let filters = [];
        const value = cmdArr[cmdArr.length - 1];
        let campus_id = CMDS['lib']['DEF_CAMPUS_ID'];

        let idx = 1;
        while (idx < cmdArr.length - 1) {
            if (cmdArr[idx] == '-t')
                search = `filter[${cmdArr[++idx]}]=${value}`;
            else if (cmdArr[idx] == '-c') {
                let campus_id = CMDS['lib']['42CAMPUSES_ID'][
                    CMDS['lib']['42CAMPUSES'].indexOf(cmdArr[++idx])
                ];
                filters.push(`filter[campus_id]=${campus_id}`);
            }
            else if (cmdArr[idx] == '--pool_month')
                filters.push(`filter[pool_month]=${cmdArr[++idx]}`);
            else if (cmdArr[idx] == '--pool_year')
                filters.push(`filter[pool_year]=${cmdArr[++idx]}`);
            idx++;
        }

        filters.push(search);
        return {
            cmd: cmd['cmd'],
            endpoint: `/v2/campus/${campus_id}/users`,
            filters: filters
        };
    },
    mget: (cmdArr, cmd) => {
        let filters = [], multiRequest, pageSize;
        let idx = 1;
        while (idx < cmdArr.length - 1) {
            console.log(cmdArr[idx])
            if (cmdArr[idx] == '--multi_request')
                multiRequest = cmdArr[++idx] == 'true';
            else if (cmdArr[idx] == '--page_size')
                pageSize = parseInt(cmdArr[++idx]);
            else if (cmdArr[idx] == '-f')
                filters.push(cmdArr[++idx]);
            idx++;
        }
        return {
            cmd: cmd['cmd'],
            endpoint: cmdArr[cmdArr.length - 1],
            filters: filters,
            multiRequest: multiRequest,
            pageSize: pageSize
        }
    },
    whitenova: (cmdArr, cmd) => {
        let period = 0;
        let full = false;
        let idx = 1;
        while (idx < cmdArr.length - 1) {
            if (cmdArr[idx] == '-p')
                period = parseInt(cmdArr[++idx]);
            else if (cmdArr[idx] == '--full')
                full = true;
            idx++;
        }
        return {
            cmd: cmd['cmd'],
            options: {
                login: cmdArr[cmdArr.length - 1],
                period: period,
                full: full
            }
        }
    }
};