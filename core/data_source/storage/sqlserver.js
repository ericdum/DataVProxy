'use strict';

const mssql = require('mssql');
const _ = require('lodash');
const Events = require('events');
const mysql = require('mysql');


// create table users (id int, name varchar(50))
// insert into users (id, name) values (1, "datav")
// show tables: select * from sys.tables
// show database: select * from sys.databases where owner_sid!=1;
// select db_name();
// =================

function Mysql(config){
  var self = this;
  this.config = config;
  this.api = config.name;
}

function queryFormat(query, values) {
  if (!values) return query;
  var sql = query.replace(/\:([a-zA-Z]\w*)/g, function (txt, key) {
    if ( Object.prototype.hasOwnProperty.call(values, key) ) {
      var value = values[key] || null;
      return mysql.escape(value);
    } else {
      return 'NULL'
    }
    return txt;
  }.bind(this));
  return sql;
};

Mysql.prototype.query = function (sql, values) {
  var self = this;
  return function(cb){
    if (!sql) {
      return cb('ER_PARSE_ERROR');
    }

    self.conn = new Mssql({
      user: self.config.user,
      password: self.config.password,
      server: self.config.host,
      port: self.config.port,
      database: self.config.database
    });

    self.conn.on('error', cb);
    self.conn.query(queryFormat(sql, values), function (err, rows) {
      cb && cb(err&&"[SQL Server Error] " + err.code, rows);
    });
  }
};

Mysql.prototype.end = function(){
  this.conn.end();
};

Mysql.prototype.testConnection = function() {
    var self = this;
  return function(cb) {
    var config = self.config;
    var conn = new Mssql({
      user: config.user,
      password: config.password,
      server: config.host,
      port: config.port,
      database: config.database
    });

    conn.on('error', cb);
    conn.on('connect', function(){
      cb(null, '连接成功');
    });
  }
}

module.exports = Mysql

/* =========================================================================== */
/* =========================================================================== */
/* =========================================================================== */
/* =========================================================================== */


let defaultConfig = {
  driver: 'tedious',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 3000
  }
};

class Mssql extends Events {
  /**
   * 构造函数
   * @param  {Object} config
   *     - user {String},
   *     - password {String},
   *     - server {String},
   *     - options {Object}
   *     - driver {String} 'tedious', 'tds', 'msnodesql', 'msnodesqlv8
   *     - pool {Object}
   *        - max {Number} 10,
   *        - min {Number} 0,
   *        - idleTimeoutMillis {Number} 30000
   */
  constructor(config) {
    super();
    config = _.merge({}, defaultConfig, config);
    this.req = null;
    this.connection = new mssql.Connection(config, (err) => {
      if (err) {
        return this.emit('error', err);
      }
      this.req = new mssql.Request(this.connection);
      this.req.multiple = false;
      this.clearQueue();
      this.emit('connect');
    });
    this.queue = [];
  }
  query(sql, cb) {
    if (!this.req) {
      return this.queue.push([sql, cb]);
    }
    try {
      this.req.query(sql, cb);
    } catch(e) {
      // 防止mssql 库报错
      cb(e)
    }
  }
  clearQueue() {
    let queue = this.queue;
    if (!queue.length) {
      return;
    }

    let q = queue.shift();
    this.query(q[0], (err, data) => {
      q[1](err, data);
      this.clearQueue();
    });
  }
  /*
  execute(procedureName, param, cb) {

  }
  */
}