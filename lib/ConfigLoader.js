'use strict';

var async = require('async');
var strategy = require('./strategy');

/**
 * Config Loader
 * Represents a configuration loader that loads a configuration through a list of strategies.
 *
 * @constructor
 */
var ConfigLoader = function (strategies) {
  this.strategies = [];

  if (strategies && !(strategies instanceof Array)) {
    throw new Error("Argument 'strategies' must be an array.");
  }
  
  // Ensure that we always start out with a empty configuration object.
  this.add(new strategy.NullConfigStrategy());

  for (var i = 0; i < strategies.length; i++) {
    this.add(strategies[i]);
  }
};

ConfigLoader.prototype.add = function (strategy) {
  if (!strategy || !strategy.process) {
    throw new Error("Unable to add strategy. Strategy is either empty or missing required method 'process'.");
  }

  this.strategies.push(strategy);
};

ConfigLoader.prototype.load = function (callback) {
  var strategies = this.strategies.slice();

  var tasks = [];

  for (var i = 0; i < strategies.length; i++) {
    tasks.push(strategies[i].process.bind(strategies[i]));
  }

  async.waterfall(tasks, callback);
};

module.exports = ConfigLoader;