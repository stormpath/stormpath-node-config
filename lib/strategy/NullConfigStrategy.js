'use strict';

/**
 * Represents a strategy that that returns an empty object (pre loading).
 *
 * @class
 */
 var NullConfigStrategy = function () {};

NullConfigStrategy.prototype.process = function (callback) {
  callback(null, {});
};

module.exports = NullConfigStrategy;