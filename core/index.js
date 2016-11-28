"use strict"

var dataSource = require('./data_source');

class DataCenter {
  *get(ds, query) {
    return yield dataSource.get(ds, query);
  }

  *testConnection(ds) {
    return yield dataSource.testConnection(ds);
  }
}

module.exports = new DataCenter();
