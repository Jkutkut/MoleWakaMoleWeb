var CMDS = null;

window.addEventListener('load', async () => {
    let response = await fetch('/json/mole.json');
    CMDS = await response.json();
});

function handleCmd(command) {
    command = command.trim();
    if (command === "")
        return "";

    let cmd = command.split(" ");
    switch (cmd[0]) {
        case "help":
            return handleHistory(cmd);
        case "clear":
            resultTerm.innerHTML = "";
            return "";
        default:
            return "<error>Error</error>: Command not found";
    }
}

function handleHistory(cmd) {
    if (!CMDS)
        throw new Error("CMDS not loaded");

    CMDS.cmds.forEach(cmd => console.log(cmd));

    return "<error>Error</error>: TODO";
}