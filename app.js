'use strict';

var DataCenter = require('./core');
var config     = require('./config');
var accesslog  = require('./core/accesslog');
var graceful   = require('graceful');
var app        = require('koa')();
var router     = require('koa-router')();
var koaBody    = require('koa-body')();
var crypto     = require('crypto');
var pkgJSON    = require('./package.json');

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

app.use(function *exceptionHandler(next){
  try {
    yield next;
  } catch(err) {
    if (err.redirect) {
      this.redirect(err.redirect);
    } else if(err*1 == err){
      this.status = err;
    } else if(typeof err == 'string') {
      var data = {
        isError: true,
        message: err
      }
      this.body = JSON.stringify(data);
    } else {
      console.error(err.stack);
      this.status = 500;
      this.body = err.message || 'Server Error';
    }
  }
});

router.get('/status', function *() {
  this.body = "hi there."
});

router.get('/version', function *() {
  this.body = pkgJSON.version;
});

router.get('/database', function *() {
  var key  = this.query._datav_id;
  var time = parseInt(this.query._datav_time);
  var data = decrypt(key, time);

  if (!data) return this.status = 401;
  delete this.query._datav_id;
  delete this.query._datav_time;

  var db = findDB(data.db)
  if (!db) throw "数据库不存在：" + data.db;

  this.body = yield DataCenter.get({
    type: 'database',
    config: {
      sql: data.sql,
      storage: db
    }
  }, this.query);
})

router.get('/get/databases', function *() {
  var key  = this.query._datav_id;
  var time = parseInt(this.query._datav_time);
  try {
    var data = decrypt(key, time);
  } catch(e) {
    return this.body={isError: true, message:"签名错误"};
  }
  var dbs = [];
  if (data.action != 'getDatabases') return this.body={isError: true, message:"配置错误"};
  this.body = {data: dbs};
  config.databases.forEach(function(db){
    dbs.push(db.id);
  });
})

router.get('/test/connection', function *() {
  var key  = this.query._datav_id;
  var time = parseInt(this.query._datav_time);
  try {
    var data = decrypt(key, time);
  } catch(e) {
    return this.body={isError: true, message:"签名错误"};
  }
  if (data.action != 'connectTest') return this.body={isError: true, message:"配置错误"};
  var db = findDB(data.db)
  if (!db) return this.body={isError: true, message: "数据库不存在：" + data.db};
  this.body = {
    data: yield DataCenter.testConnection({
      type: 'database',
      config: {
        storage: db
      }
    })
  }
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
  if (new Date().getTime()/1000 > time + config.expired) {
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
