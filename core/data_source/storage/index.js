"use strict"
var Base   = require('../../base');

var drivers = {
  'mysql': require('./mysql'),
  'rds': require('./mysql'),
  'ads': require('./mysql'),
  'mssql': require('./sqlserver')
};

var pool = {};

class Storage extends Base{
  constructor(config) {
    super(config);
    var storage = config.config.storage
    if (!pool[storage.id]) {
      if(drivers[storage.type]) {
        pool[storage.id] = new drivers[storage.type](storage);
      } else {
        console.error('unsupport', storage.type);
        throw 'unsupport', storage.type;
      }
    }
    this.sql = config.config.sql;
    this.storage = pool[storage.id];
  }
  *get(query, callback) {
    var data = yield this.query(this.sql, query, callback);
    return this.applyFilters(data, query);
  }

  *query(sql, data, callback) {
    return yield this.storage.query(sql, data, callback);
  }

  *test() {
    return yield this.storage.test();
  }

  *testConnection() {
    return yield this.storage.testConnection();
  }
}

module.exports = Storage;
