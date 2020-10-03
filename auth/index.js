let https = require('https');
let express = require('express');
let app = express();

let fs = require('fs');

let fetch = require('node-fetch');

const client_id = 31383; // change this to your own client ID

app.get('/bnetAuth', async(req, res) => {
    if(req.query.code) {
        res.send('good<br><button onclick="document.location=\'/bnetAuth\'">again</button>')
        console.log('recieved code. can get oauth token now.');

        try {
            const apiResponse = await fetch('https://www.bungie.net/Platform/App/OAuth/Token/', {
                method: 'post',
                body: `client_id=${client_id}&grant_type=authorization_code&code=${req.query.code}`,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });

            console.log('fetch is done ');

            const apiResponseBody = await apiResponse.json();

            console.log(apiResponseBody);

        }
        catch(e) {
            console.log('fetch error');
            console.log(e);
        }
        

    }
    else {
        res.redirect(`https://www.bungie.net/en/OAuth/Authorize?client_id=${client_id}&response_type=code`);
    }
    // res.send('done');
    // res.send(req.params['code']);
});

https.createServer({
    key: fs.readFileSync(__dirname + '/ssl/server.key'),
    cert: fs.readFileSync(__dirname + '/ssl/server.cert')
}, app).listen(3000, () => {
    console.log('Listening');
});
