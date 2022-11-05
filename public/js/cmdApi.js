async function handleCmdAPI(cmdArr, cmd) {
    let request;
    switch(cmd['cmd']) {
        case 'location':
            request = handleLocation(cmdArr, cmd);
            break;
        default:
            return "<error>Error</error>: API method not implemented";
    }
    return await makeRequestAPI(request);
}

function handleLocation(cmdArr, cmd) {
    let login = cmdArr[cmdArr.length - 1];
    return {
        cmd: cmd['cmd'],
        endpoint: `/v2/users/${login}/locations`,
        filters: ["page[size]=1"]
    };
}

async function makeRequestAPI(request) {
    let response = await fetch(
        '/api/request',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
        }
    );
    if (response.status != 200)
        return `<error>Error</error>: ${response.status} ${response.statusText}`;
    return response.text();
}