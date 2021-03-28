var fs = require('fs');
let date = new Date();
let json = JSON.parse(fs.readFileSync('./module_nightly.json', 'utf8'));
json.version = `${date.getUTCFullYear()}.${date.getUTCMonth() + 1}.${date.getUTCDate()}.${date.getUTCHours()}.${date.getUTCMinutes()}.${date.getUTCSeconds()}`;
fs.writeFileSync('./module.json', JSON.stringify(json));