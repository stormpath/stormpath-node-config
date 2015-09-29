'use strict';

/**
 * Represents a strategy that enriches the API Key configuration (post loading).
 *
 * @class
 */
 var EnrichClientConfigStrategy = function () {};

EnrichClientConfigStrategy.prototype.process = function (config, callback) {
  // For backwards compatibility reasons, if no API key is specified we'll try
  // to grab the API credentials out of our new format and shove it into the old
  // format.  This can go away once we cut a release and decide to no longer
  // support the old configuration formatting.
  if (!config.apiKey && config.client && config.client.apiKey) {
    config.apiKey = config.client.apiKey;
  }

  callback(null, config);
};

module.exports = EnrichClientConfigStrategy;