"use strict"
var drivers = {
  //'static'  : require('./static'),
  //'api'     : require('./remote'),
  'database' : require('./storage'),
  //'csv'     : require('./csv'),
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
}

module.exports = new DataFactory();
