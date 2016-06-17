var fs   = require('fs');
var path = require('path');
var RT   = require('random-token').create('abcdefghijklmnopqrstuvwxzyABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%')

var key = RT(32);
var secret = RT(16);

var configFile = path.join(__dirname, '../config.js');
var file = fs.readFileSync(configFile).toString();

file = file.replace(/(key['"]?\s*:\s*['"])[^'"]+/, '$1'+key)
file = file.replace(/(secret['"]?\s*:\s*['"])[^'"]+/, '$1'+secret)

console.log('已为您生成新的 key 和 secret')
console.log('Key:', key);
console.log('Secret:', secret);
console.log('是否需要覆盖 config.js 配置的 key, secret')
console.log('需要请输入：yes')

process.stdin.setEncoding('utf8');

process.stdin.on('readable', function() {
  var chunk = process.stdin.read();
  if (chunk !== null) {
    if (chunk.toString().trim().toLowerCase() == 'yes') {
      fs.writeFileSync(configFile, file);
      console.log('写入完成')
      process.exit();
    } else {
      console.log('已退出')
      process.exit();
    }
  }
});

process.stdin.on('end', function() {
  process.stdout.write('end');
});
