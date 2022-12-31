var resultTerm;
var inputTerm;

window.onload = () =>  {
    resultTerm = document.getElementById('resultTerm');
    inputTerm = document.getElementById('inputTerm');

    // When enter is pressed, the command is executed
    inputTerm.addEventListener('keyup', (e) => {
        if (e.key === "Enter") {
            executeCommand(inputTerm.value);
            inputTerm.value = "";
        }
    });

    // When window is focused, the inputTerm is focused
    window.addEventListener('focus', () => {
        inputTerm.focus();
    });

    inputTerm.addEventListener('keydown', (e) => {
        if (e.key == "Tab")
            handleTab(e);
        else
            removeHints();

        if (e.key === "ArrowUp" || e.key === "ArrowDown")
            handleHistory(e);

        // TODO
        if (e.key === "ArrowLeft") {
            
        }
        else if (e.key === "ArrowRight") {
            
        }
    });

    inputTerm.focus();
};

function executeCommand(command) {
    // Normalize command
    command = command.replaceAll(/\n/g, '');
    command = command.replaceAll(/[ \t]+/g, ' ').trim();

    addCmd2History(command);
    addCmd2Term(command);
    handleCmd(command).then((result) => {
        if (typeof result === 'string') {
            if (result.length > 0)
                addResult2Term(result);
        }
        else
            addChart2term(result);
    });
    removeHints();
}

function addCmd2Term(command) {
    const container = add2Term(`<cmd>$></cmd> ${command}`);
}

function addResult2Term(result) {
    const btn = document.createElement('term_btn'); // TODO: only add it if result should be collapsable
    add2Term(btn);
    const res = add2Term(result);
    btn.innerHTML = 'Collapse / Expand';
    btn.addEventListener("click", () => {
        res.classList.toggle("collapsable");
    });
    return res;
}

function addChart2term(data) {
    const canvas = document.createElement('canvas');
    const pre = addResult2Term(canvas);
    pre.classList.add('chart');
    const saveBtn = document.createElement('term_btn');
    saveBtn.innerHTML = 'Save as image';
    pre.appendChild(saveBtn);
    const ctx = canvas.getContext('2d');
    const chart = new Chart(ctx, data);

    saveBtn.addEventListener('click', () => {
        let img = chart.toBase64Image('image/jpeg', 1);
        let a = document.createElement('a');
        a.href = img;
        a.download = 'chart.jpg';
        a.click();
    });
}

function add2Term(result) {
    let res = document.createElement('pre');
    if (typeof result === 'string')
        res.innerHTML = result;
    else
        res.appendChild(result);
    resultTerm.appendChild(res);
    window.scrollTo(0, document.body.scrollHeight);
    return res;
}

// History
const cmdHistory = [];
var historyIdx = 0;
function handleHistory(e) {
    e.preventDefault();
    if (e.key === "ArrowUp") {
        if (historyIdx < cmdHistory.length) {
            historyIdx++;
            updateWithHistory();
        }
    }
    else if (e.key === "ArrowDown") {
        if (historyIdx > 0) {
            historyIdx--;
            updateWithHistory();
        }
    }
    removeHints();
}

function updateWithHistory() {
    if (historyIdx == 0)
        inputTerm.value = "";
    else
        inputTerm.value = cmdHistory[cmdHistory.length - historyIdx];

    // Move textArea cursor to the end
    const len = inputTerm.value.length;
    inputTerm.setSelectionRange(len, len);
}

function addCmd2History(command) {
    cmdHistory.push(command);
    historyIdx = 0;
}

// Auto completion
// TODO search -t does not show login or any completion option
function handleTab(e) {
    if (e.key !== "Tab")
        return;
    e.preventDefault();

    let position = inputTerm.selectionStart;
    // Check no in the middle of a cmd or flag
    if (position < inputTerm.value.length && inputTerm.value[position] != ' ')
        return removeHints();
    // Autocompletion
    let cmd = inputTerm.value.split(' ');
    let i = 0, cmdIdx = 0;
    while (i <= position)
        if (inputTerm.value[i++] == ' ')
            cmdIdx++;
    let available = [];
    if (cmdIdx == 0) { // Autocomplete cmd
        let cmdNoCase = cmd[0].toLowerCase();
        for (let command of CMDS['cmds']) {
            for (let alias of command['alias']) {
                if (alias.toLowerCase().startsWith(cmdNoCase))
                    available.push(alias);
            }
        }
    }
    else { // Autocomplete flag
        let c = getCmd(cmd[0]);
        if (c == null)
            return removeHints();

        let completeFlags = true;
        let flagNoCase = cmd[cmdIdx].toLowerCase();
        if (cmdIdx >= 2) { // Check if previous flag is missing a value
            let prevFlag = getFlag(cmd[cmdIdx - 1], c['flags']);
            if (prevFlag != null && prevFlag['value'] != null) { // If value is required
                completeFlags = false;
                if (prevFlag['value']['type'] == 'stringElement')
                    for (let v of prevFlag['value']['elements'])
                        if (v.toLowerCase().startsWith(flagNoCase))
                            available.push(v);
                else if (prevFlag['value']['type'] == 'boolean')
                    available.push('true', 'false');
                else if (prevFlag['value']['type'] == 'number')
                    return setHints(['&lt;number&gt;']);
                else if (prevFlag['value']['type'] == 'string')
                    return setHints(['&lt;string&gt;']);
                else
                    return removeHints();
            } // else, autocomplete flags
        }
        if (completeFlags) {
            let usedFlags = cmd.filter(c => c.startsWith('-'));
            for (let flag of c['flags']) {
                if (cmd[cmdIdx] == '' || flag['flag'].toLowerCase().startsWith(flagNoCase))
                    if (!usedFlags.includes(flag['flag']) || flag['repeatable'])
                        available.push(flag['flag']);
            }
        }
    }

    // ? Hits for value?

    switch (available.length) {
        case 0:
            return removeHints();
        case 1:
            cmd[cmdIdx] = available[0];
            inputTerm.value = cmd.join(' ');
            removeHints();
            break;
        default:
            setHints(available);
            // * Note: all available elements are longer than cmd[cmd_index]
            let i = cmd[cmdIdx].length;
            let running = true;
            while (running) {
                for (let e of available) {
                    if (i >= e.length || i >= available[0].length ||
                        available[0][i].toLowerCase() != e[i].toLowerCase()) {
                        running = false;
                        break;
                    }
                }
                if (running)
                    i++;
            }
            cmd[cmdIdx] = available[0].substring(0, i);
            inputTerm.value = cmd.join(' ');
    }
}

function setHints(hints) {
    document.getElementById('inputHints').innerHTML = hints.join(' ');
}

function removeHints() {
    setHints([]);
}