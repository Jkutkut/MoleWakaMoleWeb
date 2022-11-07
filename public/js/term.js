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
        handleTab(e);
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
var history = [];
var historyIdx = 0;
function handleHistory(e) {
    if (e.key === "ArrowUp") {
        // TODO history
    }
    else if (e.key === "ArrowDown") {
        // TODO history
    }
    else
        return;
    removeHints();
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