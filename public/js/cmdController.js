var CMDS = null;

window.addEventListener('load', async () => {
    let response = await fetch('/json/mole.json');
    CMDS = await response.json();

    // TODO debug
    // executeCommand('help');
    executeCommand('loc jkutkut');
});

// ********** handle cmd **********

async function handleCmd(command) {
    command = command.trim();
    if (command === "")
        return "";

    let cmdArr = command.split(" ");
    let cmd = getCmd(cmdArr[0]);
    if (!cmd)
        return `<error>Error</error>: Command '${cmdArr[0]}' not found`;
    if (!isValidCmd(cmdArr, cmd))
        return descriptionCmd(cmd);
    if (!cmd['api']) {
        if (cmd['cmd'] == 'help')
            return handleHelp(cmdArr, cmd);
        else if (cmd['cmd'] == 'man')
            return handleMan(cmdArr, cmd);
        else
            return handleClear(cmdArr, cmd)
    }
    return await handleCmdAPI(cmdArr, cmd);
}

// ********** cmds **********


function handleClear(cmdArr, cmd) {
    resultTerm.innerHTML = "";
    return "";
}

function handleHelp(cmdArr, cmd) {
    let response = `<string>help</string>\n`
    
    for (let c of CMDS.cmds) {
        response += `  ${c['cmd']}\n`
    }
    response += `\n  Use the <cmd>man</cmd> command for more information:\n`;
    response += descriptionCmd(getCmd('man'));
    return response;
}

function handleMan(cmdArr, cmd) {
    let c = getCmd(cmdArr[1]);
    if (!c)
        return `<error>Error</error>: No entry for '${cmdArr[1]}'`;
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

function isValidCmd(cmdArr, cmd) {
    let idxEnd = cmdArr.length - 1;
    if (cmd['value'] !== null)
        idxEnd--;
    // Check cmd is valid alias?
    let idx = 1;
    // Check flags
    let flag;
    while (idx <= idxEnd) {
        flag = getFlag(cmdArr[idx], cmd['flags']);
        if (!flag)
            return false;
        if (flag['value'] !== null) {
            if (idx + 1 > idxEnd)
                return false;
            if (!isValidValue(cmdArr[++idx], flag['value']))
                return false;
        }
        idx++;
    }
    for (flag of cmd['flags']) {
        if (!flag['optional'] && !cmdArr.includes(flag['flag']))
            return false;
    }
    // Check value
    if (cmd['value'] !== null) {
        if (cmdArr.length <= idx)
            return false;
        if (getFlag(cmdArr[idx], cmd['flags']))
            return false;
        return isValidValue(cmdArr[idx], cmd['value']);
    }
    else
        return cmdArr.length === idx;
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