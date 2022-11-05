var CMDS = null;

window.addEventListener('load', async () => {
    let response = await fetch('/json/mole.json');
    CMDS = await response.json();
});

function handleCmd(command) {
    command = command.trim();
    if (command === "")
        return "";

    let cmd_arr = command.split(" ");
    let cmd = getCmd(cmd_arr[0]);
    if (!cmd)
        return `<error>Error</error>: Command '${cmd_arr[0]}' not found`;
    if (!validCmd(cmd_arr, cmd))
        return 'TODO usage'
        // return usage(cmd);
    if (!cmd['api']) {
        if (cmd['cmd'] == 'help')
            return handleHelp(cmd_arr, cmd);
        else
            return handleClear(cmd_arr, cmd)
    }
    return 'api';
}

function handleClear(cmd_arr, cmd) {
    resultTerm.innerHTML = "";
    return "";
}

function handleHelp(cmd_arr, cmd) {
    CMDS.cmds.forEach(cmd => console.log(cmd));
    return "<error>Error</error>: TODO";
}

// TOOLS
function getCmd(cmd) {
    for (let i = 0, alias; i < CMDS.cmds.length; i++) {
        for (alias of CMDS.cmds[i]['alias']) {
            if (alias === cmd)
                return CMDS.cmds[i];
        }
    }
    return null;
}

function validCmd(cmd_arr, cmd) {
    // Check cmd is valid alias?
    if (cmd['value'] )
    return true;
}