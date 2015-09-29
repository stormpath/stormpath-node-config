'use strict';

var fs = require('fs');
var extend = require('deep-extend');
var expandHomeDir = require('expand-home-dir');
var propsParser = require('properties-parser');

/**
 * Represents a strategy that loads API keys from a .properties file into the configuration.
 *
 * @class
 */
function LoadAPIKeyConfigStrategy (filePath, force) {
  this.filePath = expandHomeDir(filePath);
  this.force = force || false;
}

LoadAPIKeyConfigStrategy.prototype.process = function (config, callback) {
  var outerScope = this;
  fs.exists(this.filePath, function (exist) {
    if (!exist) {
      if (outerScope.force) {
        callback(new Error('Client API key file not found: ' + outerScope.filePath));
      } else {
        callback(null, config);
      }
    } else {
      // Extend config with default client apiKey fields.
      extend(config, {
        client: {
          apiKey: {}
        }
      });

      if (!outerScope.force && config.client.apiKey.id && config.client.apiKey.secret) {
        return callback(null, config);
      }

      var keyProps = propsParser.read(outerScope.filePath);

      if (!keyProps || !keyProps['apiKey.id'] || !keyProps['apiKey.secret']) {
        return callback(new Error('Unable to read properties file: ' + outerScope.filePath));
      }

      config.client.apiKey.id = keyProps['apiKey.id'];
      config.client.apiKey.secret = keyProps['apiKey.secret'];

      callback(null, config);
    }
  });
};

module.exports = LoadAPIKeyConfigStrategy;