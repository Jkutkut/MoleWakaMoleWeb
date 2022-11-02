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

    inputTerm.focus();
};

function executeCommand(command) {
    console.log(command);

    addCmd2Term(command);
    let result = handleCmd(command);
    if (result.length > 0)
        addResult2Term(result);
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

function handleCmd(command) {
    command = command.trim();
    if (command === "")
        return "";

    let cmd = command.split(" ");
    switch (cmd[0]) {
        case "help":
            return "<comment>TODO</comment>";
        case "clear":
            resultTerm.innerHTML = "";
            return "";
        default:
            return "<error>Error</error>: Command not found";
    }
}