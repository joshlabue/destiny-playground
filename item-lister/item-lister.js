let express = require('express');
let app = express();

let hbs = require('hbs');

app.set('view engine', 'hbs');

let fs = require('fs');

let itemList = JSON.parse(fs.readFileSync(__dirname + '/items.json'));
let weapons = itemList.filter((item) => {
    if(item['traitIds'] == undefined) return false
    else return item['traitIds'][0] == 'item_type.weapon';
});

weapons.sort((a, b) => {
    return (a.displayProperties.name > b.displayProperties.name ? 1 : -1);
});

app.get('/', (req, res) => {
    res.render(__dirname + '/page.hbs', {
        items: weapons
    });
});

app.listen(3000);
console.log('Listening on 3000')