'use strict';

var DataCenter = require('./core');
var config     = require('./config');
var graceful   = require('graceful');
var app        = require('koa')();
var router     = require('koa-router')();
var koaBody    = require('koa-body')();
var crypto     = require('crypto');

app.on('error', function (err) {
  if (err.redirect) {
    this.redirect(err.redirect);
  } else if(err == 401){
    this.status = 401;
    this.body = 'Unauthorized'
  }else if(err == 404) {
    this.status = 404;
    this.body = 'Not Found';
  } else if(typeof err == 'string') {
    console.log(err)
    var data = {
      isError: true,
      message: err
    }
    this.body = JSON.stringify(data);
  } else {
    this.status = 500;
    this.body = err.message || 'Server Error';
    console.error(err.stack)
  }

});

app.use(function *(next) {
  if (this.request.header.origin && this.request.header.origin.match(/datav.aliyun.com(:\d+)?/)) {
    this.set('Access-Control-Allow-Origin', '*')
    this.set('Content-Type', 'application/json; charset=utf-8');
  }
  yield next;
});

router.get('/database', function *() {
  var key  = this.query.query;
  var data = decrypt(key);

  this.body = yield DataCenter.get({
    type: 'database'
    ,config: {
      sql: data.sql
      ,storage: findDB(data.db)
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


function decrypt(data) {
  var cipherChunks, decipher;
  cipherChunks = [];
  data = data.replace(/ /g, '+');
  decipher = crypto.createDecipheriv('aes-256-cbc', new Buffer(config.key, 'binary'), new Buffer(config.secret, 'binary'));
  decipher.setAutoPadding(true);
  cipherChunks.push(decipher.update(data, 'base64', 'utf8'));
  cipherChunks.push(decipher.final('utf8'));
  data = cipherChunks.join('');
  try {
    return JSON.parse(data);
  } catch(e) {
    return {};
  }
}

function findDB(id) {
  return config.databases.filter(function(db){
    return db.id == id;
  }).shift();
}
