'use strict';

var DataCenter = require('./core');
var config     = require('./config');
var accesslog  = require('./core/accesslog');
var graceful   = require('graceful');
var app        = require('koa')();
var router     = require('koa-router')();
var koaBody    = require('koa-body')();
var crypto     = require('crypto');

app.on('error', function (err) {
  console.error(err)
  console.error(err.stack)
});

app.use(accesslog());
app.use(function *(next) {
  if (this.request.header.origin && this.request.header.origin.match(/datav.aliyun.com(:\d+)?/)) {
    this.set('Access-Control-Allow-Origin', '*')
    this.set('Content-Type', 'application/json; charset=utf-8');
  }
  yield next;
});

router.get('/database', function *() {
  var key  = this.query.id;
  var time = parseInt(this.query.time);
  var data = decrypt(key, time);

  if (!data) return this.status = 401;

  this.body = yield DataCenter.get({
    type: 'database',
    config: {
      sql: data.sql,
      storage: findDB(data.db)
    }
  }, this.query);
})

app.use(router.routes());

/**
 * Page not found handler
 */
app.use(function *() {
  this.status = 404;
  this.body = 'Not Found';
});

app.listen(config.port, config.bindingHost);

graceful({
  server: app,
  error: function (err, throwErrorCount) {
    if (err.message) {
      err.message += ' (uncaughtException throw ' + throwErrorCount + ' times on pid:' + process.pid + ')';
    }
    console.error(err);
  }
});


function decrypt(data, time) {
  var vp = 60; // 一分钟有效期
  if (new Date().getTime()/1000 > time + vp) {
    return false;
  }
  var key = time + config.key.substr(time.toString().length)
  var cipherChunks, decipher;
  cipherChunks = [];
  data = data.replace(/ /g, '+');
  decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(key, 'binary'), new Buffer(config.secret, 'binary'));
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
  try {
    cipherChunks.push(decipher.final('utf8'));
  } catch (e) {
    return false;
  }
  data = cipherChunks.join('');
  try {
    return JSON.parse(data);
  } catch(e) {
    return false;
  }
}

function findDB(id) {
  return config.databases.filter(function(db){
    return db.id == id;
  }).shift();
}
