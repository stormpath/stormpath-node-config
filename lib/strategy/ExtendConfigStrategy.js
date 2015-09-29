'use strict';

var extend = require('deep-extend');

/**
 * Represents a strategy that extends the configuration.
 *
 * @class
 */
var ExtendConfigStrategy = function (extendWith) {
  this.extendWith = extendWith;
};

ExtendConfigStrategy.prototype.process = function (config, callback) {
  extend(config, this.extendWith);
  callback(null, config);
};

module.exports = ExtendConfigStrategy;