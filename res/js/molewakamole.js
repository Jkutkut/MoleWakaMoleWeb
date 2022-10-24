// async function postDataExample(url = '', data = {}) {
//     // Default options are marked with *
//     const response = await fetch(url, {
//       method: 'POST', // *GET, POST, PUT, DELETE, etc.
//       // mode: 'cors', // no-cors, *cors, same-origin
//       // cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//       credentials: 'same-origin', // include, *same-origin, omit
//       headers: {
//         'Content-Type': 'application/json'
//         // 'Content-Type': 'application/x-www-form-urlencoded',
//       },
//       // redirect: 'follow', // manual, *follow, error
//       // referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
//       body: JSON.stringify(data) // body data type must match "Content-Type" header
//     });
//     return response.json(); // parses JSON response into native JavaScript objects
// }


// async function post(url, data) {
//     const URL = "https://api.intra.42.fr";
//     const response = await fetch(URL + url, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(data)
//     });
//     return response.json();
// }

// TODO hide logic in client

var api;

window.onload = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (!code)
        window.location = "https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-6236d8a89f167191736e11a8f16a4ebd5232d8ab82f0eb194be85bf5deebbbbc&redirect_uri=http%3A%2F%2F127.0.0.1%2F&response_type=code"
    api = new API42(code);

    let login = "jre-gonz"
    console.log(api.get(`v2/users/${login}/campus_users`))
}