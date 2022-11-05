var CMDS = null;

window.addEventListener('load', async () => {
    let response = await fetch('/json/mole.json');
    CMDS = await response.json();

    // TODO debug
    // executeCommand('help');
    // executeCommand('clear hello');
    executeCommand('location');
    executeCommand('location -n');
    executeCommand('location -n login');
    executeCommand('location -n 2 login');
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
    if (!isValidCmd(cmd_arr, cmd))
        return descriptionCmd(cmd);
    if (!cmd['api']) {
        if (cmd['cmd'] == 'help')
            return handleHelp(cmd_arr, cmd);
        else if (cmd['cmd'] == 'man')
            return handleMan(cmd_arr, cmd);
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

function handleMan(cmd_arr, cmd) {
    let c = getCmd(cmd_arr[1]);
    if (!c)
        return `<error>Error</error>: No entry for '${cmd_arr[1]}'`;
    return descriptionCmd(c, fullUsage = true);
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

function isValidCmd(cmd_arr, cmd) {
    // console.log(cmd_arr);
    let idxEnd = cmd_arr.length - 1;
    if (cmd['value'] !== null)
        idxEnd--;

    // Check cmd is valid alias?
    let idx = 1;

    // Check flags
    let flag;
    while (idx <= idxEnd) {
        flag = getFlag(cmd_arr[idx], cmd['flags']);
        if (!flag)
            return false;
        if (flag['value'] !== null) {
            if (idx + 1 > idxEnd)
                return false;
            if (!isValidValue(cmd_arr[++idx], flag['value']))
                return false;
        }
        idx++;
    }

    for (flag of cmd['flags']) {
        if (!flag['optional'] && !cmd_arr.includes(flag['flag']))
            return false;
    }

    // Check value
    if (cmd['value'] !== null) {
        if (cmd_arr.length <= idx)
            return false;
        if (getFlag(cmd_arr[idx], cmd['flags']))
            return false;
        return isValidValue(cmd_arr[idx], cmd['value']);
    }
    else
        return cmd_arr.length === idx;
}

function isValidValue(value, speckedValue) {
    switch(speckedValue['type']) {
        case 'string':
            return true;
        case 'number':
            return !isNaN(value);
        default:
            return false;
    }
}

function getFlag(flag, flags) {
    for (let f of flags) {
        if (flag == f['flag'])
            return f;
    }
    return null;
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