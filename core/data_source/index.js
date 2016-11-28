"use strict"
var drivers = {
  'database' : require('./storage')
};

class DataFactory{
  constructor() {
    this.sources = {};
  }

  *get(config, query) {
    if (!drivers[config.type]) {
      throw 'Wrong API Type: '+ JSON.stringify(config)
    }
    var Driver = drivers[config.type];
    var model = new Driver(config);
    return yield model.get(query);
  }

  *testConnection(config) {
    if (!drivers[config.type]) {
      throw 'Wrong API Type: '+ JSON.stringify(config)
    }
    var Driver = drivers[config.type];
    var model = new Driver(config);
    return yield model.testConnection();
  }
}

module.exports = new DataFactory();
