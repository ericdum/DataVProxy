"use strict"
var config = require('../config');
var os = require('os');

var nc = os.networkInterfaces();
var ip = '请查看阿里云 ECS 后台';
for (var i in nc) {
  try {
    nc[i].forEach(function(n) {
      if (n.family == 'IPv4') {
        if (n.internal == false) {
          let f = n.address.split('.').shift()
          if (f != '10') {
            ip = n.address + " (以域名和ECS后台显示为准)";
          }
        }
      }
    });
  } catch(e) {}
}

console.log('    域名:', ip);
console.log('    端口:', config.port);
console.log('    Key :', config.key);
console.log(' Secret :', config.secret);
console.log('已配置DB:');

var i = 1;
config.databases.forEach(function(db){
  console.log('         ', (i++)+'=>', db.id)
});
