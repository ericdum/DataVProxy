"use strict"
class Base {
  constructor(config) {
    this.config = config;
    this.data = config.config;
    this.filters = config.filters;
  }

  applyFilters(data, query) {
    for (var i in this.filters) {
      data = this.filters[i](data, query);
    }
    return data;
  }

  get(query, callback ) {
    var data = this.applyFilters(this.data, query);
    callback(null, data);
  }
}

module.exports = Base;
