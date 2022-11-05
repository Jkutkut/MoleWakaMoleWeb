var CMDS = null;

window.addEventListener('load', async () => {
    let response = await fetch('/json/mole.json');
    CMDS = await response.json();

    // TODO debug
    executeCommand('help');
    executeCommand('clear');
    executeCommand('location');
});

// ********** handle cmd **********

function handleCmd(command) {
    command = command.trim();
    if (command === "")
        return "";

    let cmd_arr = command.split(" ");
    let cmd = getCmd(cmd_arr[0]);
    if (!cmd)
        return `<error>Error</error>: Command '${cmd_arr[0]}' not found`;
    if (!validCmd(cmd_arr, cmd))
        return descriptionCmd(cmd);
    if (!cmd['api']) {
        if (cmd['cmd'] == 'help')
            return handleHelp(cmd_arr, cmd);
        else
            return handleClear(cmd_arr, cmd)
    }
    return 'api';
}

// ********** cmds **********


function handleClear(cmd_arr, cmd) {
    resultTerm.innerHTML = "";
    return "";
}

function handleHelp(cmd_arr, cmd) {
    CMDS.cmds.forEach(cmd => console.log(cmd));
    return "<error>Error</error>: TODO"; // TODO
}

// ********** cmd tools **********

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
    // if (cmd['value'] )
    // TODO
    // return true;
    return false;
}

// ********** cmd format **********

function descriptionCmd(cmd, fullUsage = false) {
    let usage = `<string>${cmd['cmd']}</string>\n`;
    usage += `  <cmd>$></cmd> ${usageCmd(cmd)}\n`;
    if (fullUsage) {
        usage += `  Description:\n    ${cmd['desc']}\n`;

        if (cmd['flags'].length > 0) {
            usage += `  Flags:\n`;
            for (let flag of cmd['flags']) {
                usage += `    ${flagFormat(flag, optionalFormat = false)}\n`;
                usage += `      ${flag['desc']}\n`;
            }
        }
        if (cmd['alias'].length > 1) {
            usage += `  Aliases: ${cmd['alias'].join(', ')}\n`;
        }
    }
    return usage;
}

function usageCmd(cmd) {
    let usage = `${cmd['alias'][0]}`;

    if (cmd['flags'].length > 0) {
        for (let flag of cmd['flags'])
            usage += ` ${flagFormat(flag)}`;
    }

    if (cmd['value'] !== null) {
        usage += ` ${valueFormat(cmd['value'])}`;
    }
    return usage;
}

function flagFormat(flag, optionalFormat = true) {
    let optionalStart = '', optionalEnd = '';
    if (optionalFormat) {
        optionalStart = (flag['optional']) ? '[' : '&#60;';
        optionalEnd = (flag['optional']) ? ']' : '&#62;';
    }

    let usage = `${optionalStart}${flag['flag']}`;
    if (flag['value'] !== null)
        usage += ` ${valueFormat(flag['value'])}`;
    usage += `${optionalEnd}`;
    return usage;
}

function valueFormat(value) {
    let type;
    switch (value['type']) {
        case 'string':
            type = 'string';
            break;
        case 'number':
            type = 'number';
            break;
        default:
            type = null;
    }
    let flagStart = "";
    let flagEnd = "";
    if (type !== null) {
        flagStart = `<${type}>`;
        flagEnd = `</${type}>`;
    }
    return `&#60;${flagStart}${value['name']}${flagEnd}&#62;`;
}