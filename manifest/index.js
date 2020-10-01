const fetch = require('node-fetch');
const fs = require('fs');
const AdmZip = require('adm-zip');
let sqlite3 = require('sqlite3').verbose();

async function getManifestURL() {
    return new Promise(resolve => {
        fetch('https://www.bungie.net/Platform/Destiny2/Manifest')
        .then(res => res.json())
        .then(json => {
            // console.log(json);
            let dbURL = `https://www.bungie.net${json['Response']['mobileWorldContentPaths']['en']}`;
            resolve(dbURL);     
        });
    });
}

async function downloadManifest(url, filename) {
    return new Promise (resolve => {
        fetch(url)
            .then(res => res.arrayBuffer())
            .then(arrayBuffer => {
                let buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(__dirname + '/output/buffer.bin', Buffer.from(buffer));

                let zip = new AdmZip(buffer);
                let zipEntries = zip.getEntries();
                fs.writeFileSync(`${filename}`, zipEntries[0].getData());
                resolve();
            });
    });
}

async function fixManifestDB(filename) {
    return new Promise (resolve => {
        let db = new sqlite3.Database(filename);

        db.run(`SELECT CASE WHEN id < 0 THEN id + 4294967296 ELSE id END AS id, json FROM DestinyInventoryItemDefinition` , (error) => {
            if(error) {
                console.log('error fixing db');
                db.close();
                throw 'DB error';
            }
            else {
                db.close();
                console.log('done fixing manifest')
                resolve();
            }
            
        });
    })    
}

async function ripTableToJSON(filename, tableName) {
    return new Promise (resolve => {
        let db = new sqlite3.Database(filename);

        let entries = [];

        db.each(`SELECT id, json FROM ${tableName}`, (error, row) => {
            // console.log(row);
            entries.push(JSON.parse(row.json));
            if(error) {
                console.log(error);
            }
        }, () => { // if complete
            resolve(entries);
        });
    })    
}


(async () =>{
    try {
        let manifestURL = await getManifestURL();
        console.log('manifest downloaded');
        await downloadManifest(manifestURL, __dirname + '/output/db.sqlite3');
        console.log('db extracted');
        let itemJSON = await ripTableToJSON(__dirname + '/output/db.sqlite3', 'DestinyInventoryItemDefinition');
        fs.writeFileSync(__dirname + '/output/items.json', JSON.stringify(itemJSON));
        console.log('db ripped to json');
    }
    catch(e)
    {
        console.log(e);
    }
})();
