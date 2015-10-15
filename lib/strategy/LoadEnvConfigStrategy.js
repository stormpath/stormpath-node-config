'use strict';

var flat = require('flat');
var extend = require('cloneextend').extend;

/**
 * Represents a strategy that loads configuration variables from the environment into the configuration.
 *
 * @class
 */
function LoadEnvConfigStrategy (prefix) {
  this.prefix = prefix;
}

LoadEnvConfigStrategy.prototype.process = function (config, callback) {
  var outerScope = this;

  var delimiter = '_';
  var flatConfig = { delimiter: delimiter };
  var flattendDefaultConfig = flat.flatten(config, flatConfig);

  var flatEnvValues = Object.keys(flattendDefaultConfig)
    .reduce(function(envVarMap, key) {
      var envKey = outerScope.prefix + delimiter + key.toUpperCase();

      var value = process.env[envKey];

      if(value !== undefined){
        envVarMap[key] = typeof flattendDefaultConfig[key] === 'number' ?
          parseInt(value, 10) : value;
      }

      return envVarMap;
    }, {});

  var envConfig = flat.unflatten(flatEnvValues, flatConfig);

  if (envConfig) {
    extend(config, envConfig);
  }

  callback(null, config);
};

module.exports = LoadEnvConfigStrategy;
