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
function LoadAPIKeyConfigStrategy (filePath, mustExist) {
  this.filePath = expandHomeDir(filePath);
  this.mustExist = mustExist || false;
}

LoadAPIKeyConfigStrategy.prototype.process = function (config, callback) {
  var filePath = this.filePath;
  var mustExist = this.mustExist;

  fs.exists(this.filePath, function (exist) {
    if (!exist) {
      if (mustExist) {
        callback(new Error('Client API key file not found: ' + filePath));
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

      if (!mustExist && config.client.apiKey.id && config.client.apiKey.secret) {
        return callback(null, config);
      }

      var keyProps = propsParser.read(filePath);

      if (!keyProps || !keyProps['apiKey.id'] || !keyProps['apiKey.secret']) {
        return callback(new Error('Unable to read properties file: ' + filePath));
      }

      config.client.apiKey.id = keyProps['apiKey.id'];
      config.client.apiKey.secret = keyProps['apiKey.secret'];

      callback(null, config);
    }
  });
};

module.exports = LoadAPIKeyConfigStrategy;
