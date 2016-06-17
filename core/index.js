"use strict"

var dataSource = require('./data_source');

class DataCenter {
  *get(ds, query) {
    return yield dataSource.get(ds, query);
  }
}

module.exports = new DataCenter();
