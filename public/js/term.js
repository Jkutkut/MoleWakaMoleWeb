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
    window.addEventListener('click', () => {
        inputTerm.focus();
    });

    inputTerm.focus();
};

function executeCommand(command) {
    console.log(command);

    addCmd2Term(command);
}

function addCmd2Term(command) {
    let cmd = document.createElement('pre');
    cmd.innerHTML = "<cmd>$></cmd> " + command;

    resultTerm.appendChild(cmd);
    window.scrollTo(0, document.body.scrollHeight);
}