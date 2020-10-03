let https = require('https');
let express = require('express');
let app = express();

let fs = require('fs');

let fetch = require('node-fetch');

const config = require('./config.json');

const client_id = config.oAuthID; // change this to your own client ID

app.get('/bnetAuth', async(req, res) => {
    if(req.query.code) {
        let resBody = '';
        // console.log('recieved code. can get oauth token now.');
        
        try {
            const apiResponse = await fetch('https://www.bungie.net/Platform/App/OAuth/Token/', {
                method: 'post',
                body: `client_id=${client_id}&grant_type=authorization_code&code=${req.query.code}`,
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            });

            // console.log('fetch is done ');

            const apiResponseBody = await apiResponse.json();

            const userQuery = await fetch('https://www.bungie.net/Platform/User/GetCurrentBungieNetUser/', {
                method: 'get',
                headers: {
                    'X-API-Key': config.apiKey,
                    'Authorization': `Bearer ${apiResponseBody.access_token}`
                }
            });

            const userQueryResponse = await userQuery.json();

            resBody = `authenticated as ${userQueryResponse['Response']['displayName']}`
        }
        catch(e) {
            console.log('fetch error');
            resBody = `error authenticating. please try again.`
            console.log(e);
        }

        res.send(resBody + '\n<br><button onclick="document.location=\'/bnetAuth\'">again</button>')
    }
    else {
        res.redirect(`https://www.bungie.net/en/OAuth/Authorize?client_id=${client_id}&response_type=code`);
    }
});

https.createServer({
    key: fs.readFileSync(__dirname + '/ssl/server.key'),
    cert: fs.readFileSync(__dirname + '/ssl/server.cert')
}, app).listen(3000, () => {
    console.log('Listening');
});
