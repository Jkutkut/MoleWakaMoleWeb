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
        if (e.key === "ArrowUp" || e.key === "ArrowDown")
            handleHistory(e);

        // TODO
        if (e.key === "ArrowLeft") {
            removeHints();
        }
        else if (e.key === "ArrowRight") {
            removeHints();
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
    console.log("Tab pressed at position " + position);

    // TODO hanle tab

    setHints(['hint1', 'hint2', 'hint3']);
}

function setHints(hints) {
    document.getElementById('inputHints').innerHTML = hints.join(' ');
}

function removeHints() {
    setHints([]);
}