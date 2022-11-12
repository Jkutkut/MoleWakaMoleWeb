var CMDS;

window.addEventListener('load', async () => {
    let response = await fetch('/json/mole.json');
    CMDS = await response.json().then(data => {
        for (let cmd of data.cmds) {
            if (cmd['value'] !== null && cmd['value']['type'] === 'stringElement' &&
                typeof cmd['value']['elements'] === 'string') {
                cmd['value']['elements'] = data['lib'][cmd['value']['elements']];
            }
    
            for (let flag of cmd['flags']) {
                if (flag['value'] !== null && flag['value']['type'] === 'stringElement' &&
                    typeof flag['value']['elements'] === 'string') {
                    flag['value']['elements'] = data['lib'][flag['value']['elements']];
                }
            }
        }
        return data;
    });
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
    let response = `<string>help</string>\n  Available commands:\n`;
    
    for (let c of CMDS.cmds) {
        response += `    <cmd>${c['cmd']}</cmd>\n`
    }
    response += `  Use the <cmd>man</cmd> command for more information:\n`;
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
    let cmdNoCase = cmd.toLowerCase();
    for (let i = 0, alias; i < CMDS.cmds.length; i++) {
        for (alias of CMDS.cmds[i]['alias']) {
            if (alias.toLowerCase() === cmdNoCase)
                return CMDS.cmds[i];
        }
    }
    return null;
}

function isValidCmd(cmdArr, cmd) {
    let idxEnd = cmdArr.length - 1;
    if (cmd['value'] !== null)
        idxEnd--;
    // ? Check cmd is valid alias?
    // Check flags
    let idx = 1;
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

    // Check for duplicated flag where repeatable is false.
    let nonRepeatableFlags = cmd['flags'].filter(f => !f['repeatable']).map(f => f['flag']);
    let flagNoCase, sum, c;
    for (flag of nonRepeatableFlags) {
        sum = 0;
        flagNoCase = flag.toLowerCase();
        for (c of cmdArr)
            if (c == flagNoCase && ++sum > 1)
                return false; // If cmdArr has more than one match of the flag.
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
        case 'stringElement':
            for (let s of speckedValue['elements'])
                if (value == s)
                    return true;
            return false;
        case 'boolean':
            return value == 'true' || value == 'false';
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
        usage += `\n  Description:\n    ${cmd['desc']}\n`;
        if (cmd['alias'].length > 1)
            usage += `  Aliases: ${cmd['alias'].join(', ')}\n`;
        if (cmd['flags'].length > 0) {
            usage += `\n  Flags:\n`;
            for (let flag of cmd['flags']) {
                usage += `    ${flagFormat(flag, optionalFormat = false)}\n`;
                usage += `      ${flag['desc']}\n`;
                if (flag['repeatable'])
                    usage += `      This flag can be used more than once\n`;
                if (flag['value']) {
                    usage += `      Value ${valueFormat(flag['value'], optionalFormat = false)}: `;
                    switch(flag['value']['type']) {
                        case 'stringElement':
                            usage += `<string>${flag['value']['elements'].join('</string>, <string>')}</string>`;
                            break;
                        default:
                            usage += `<${flag['value']['type']}>${flag['value']['type']}</${flag['value']['type']}>`;
                    }
                    usage += `\n`;
                }
                usage += `\n`;
            }
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

function valueFormat(value, optionalFormat = true) {
    let type;
    switch (value['type']) {
        case 'string':
            type = 'string';
            break;
        case 'number':
            type = 'number';
            break;
        case 'stringElement':
            type = null;
            value = {name: `<string>${value['name']}</string>`};
            break;
        case 'boolean':
            type = 'boolean';
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
    let result = `${flagStart}${value['name']}${flagEnd}`;
    if (optionalFormat)
        result = `&#60;${result}&#62;`;
    return result;
}