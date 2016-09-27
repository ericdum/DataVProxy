"use strict"
var config = require('../config');
var os = require('os');
var co = require('co');
var Storage = require('../core/data_source/storage');

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

co(function*(){
  for (var i in config.databases) {
    var db = config.databases[i];
    var storage = new Storage({config:{storage:db}});
    var result = yield storage.test();
    console.log('         ', db.id, '=>', result.toString())
    ++i;
  }
}).catch(function(e){
  console.error('=====', e);
});

setTimeout(function(){console.log(1)}, 30000)
