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

    // When window is clicked, the inputTerm is focused
    // document.getElementsByTagName('terminal')[0]
    //         .addEventListener('click', () => {
    //     inputTerm.focus();
    // });

    window.addEventListener('click', () => {
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
    addCmd2History(command);
    addCmd2Term(command);
    handleCmd(command).then((result) => {
        if (result.length > 0)
            addResult2Term(result);
    });
    removeHints();
}

function addCmd2Term(command) {
    addResult2Term(`<cmd>$></cmd> ${command}`);
}

function addResult2Term(result) {
    let res = document.createElement('pre');
    res.innerHTML = result;
    resultTerm.appendChild(res);
    window.scrollTo(0, document.body.scrollHeight);
}

// History
const cmdHistory = [];
var historyIdx = 0;
function handleHistory(e) {
    let position = inputTerm.selectionStart;
    if (e.key === "ArrowUp" && position == 0) {
        if (historyIdx < cmdHistory.length) {
            historyIdx++;
            updateWithHistory();
        }
    }
    else if (e.key === "ArrowDown" && position == inputTerm.value.length) {
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
}

function addCmd2History(command) {
    cmdHistory.push(command);
    historyIdx = 0;
}

// Auto completion

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
    let avaliable = [];
    if (cmdIdx == 0) { // Autocomplete cmd
        for (let command of CMDS['cmds']) {
            for (let alias of command['alias']) {
                if (alias.startsWith(cmd[0]))
                    avaliable.push(alias);
            }
        }
    }
    else { // Autocomplete flag
        let c = getCmd(cmd[0]);
        if (c == null)
            return removeHints();
        for (let flag of c['flags']) {
            if (cmd[cmdIdx] == '' || flag['flag'].startsWith(cmd[cmdIdx])) // Flag
                avaliable.push(flag['flag']);
            if (c['elements']) { // Value
                for (let falias of flag['elements']) {
                    if (cmd[cmdIdx] == '' || falias.startsWith(cmd[cmdIdx]))
                        avaliable.push(falias);
                }
            }
        }
    }

    switch (avaliable.length) {
        case 0:
            return removeHints();
        case 1:
            cmd[cmdIdx] = avaliable[0];
            inputTerm.value = cmd.join(' ');
            removeHints();
            break;
        default:
            setHints(avaliable);
            // * Note: all available elements are longer than cmd[cmd_index]
            let i = cmd[cmdIdx].length;
            let running = true;
            while (running) {
                for (let e of avaliable) {
                    if (i >= e.length || i >= avaliable[0].length || avaliable[0][i] != e[i]) {
                        running = false;
                        break;
                    }
                }
                if (running)
                    i++;
            }
            cmd[cmdIdx] = avaliable[0].substring(0, i);
            inputTerm.value = cmd.join(' ');
    }
}

function setHints(hints) {
    document.getElementById('inputHints').innerHTML = hints.join(' ');
}

function removeHints() {
    setHints([]);
}