var fs   = require('fs');
var path = require('path');
var RT   = require('random-token').create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%');

var key = RT(32);
var secret = RT(16);

console.log('生成 key 和 secret')
var configFile = path.join(__dirname, '../config.js');
var file = fs.readFileSync(configFile).toString();

file = file.replace(/(key['"]?\s*:\s*['"])[^'"]+/, '$1'+key)
file = file.replace(/(secret['"]?\s*:\s*['"])[^'"]+/, '$1'+secret)

fs.writeFileSync(configFile, file);
console.log('写入完成')
process.exit();
