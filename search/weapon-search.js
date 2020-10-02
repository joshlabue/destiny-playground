let fs = require('fs');

let itemList = JSON.parse(fs.readFileSync(__dirname + '/items.json'));

let searchTerm = 'anarchy';

let results = [];

for(item in itemList) {
    if(JSON.stringify(itemList[item]).toUpperCase().includes(searchTerm.toUpperCase())) {
        results.push(itemList[item]);
    }
}

for(item in results) {
    let resultItem = {
        name: results[item]['displayProperties']['name'],
        description: results[item]['displayProperties']['description'],
        itemType: results[item]['itemTypeAndTierDisplayName']
    };
    console.log(`${resultItem.name} (${resultItem.itemType}) - ${resultItem.description}`);
}