'use strict';

var extend = require('cloneextend').extend;

/**
 * Represents a strategy that enriches the configuration (post loading).
 *
 * @class
 */
function EnrichIntegrationConfigStrategy () {
}

EnrichIntegrationConfigStrategy.prototype.process = function (config, callback) {
  var enabled = {
    enabled: true
  };

  // If a user enables a boolean configuration option named `website`, this
  // means the user is building a website and we should automatically enable
  // certain features in the library meant for users developing websites.  This
  // is a simpler way of handling configuration than forcing users to specify
  // all nested JSON configuration options themselves.
  if (config.website) {
    extend(config, {
      web: {
        register: enabled,
        login: enabled,
        logout: enabled,
        me: enabled
      }
    });
  }

  // If a user enables a boolean configuration option named `api`, this means
  // the user is building an API service, and we should automatically enable
  // certain features in the library meant for users developing API services --
  // namely, our OAuth2 token endpoint (/oauth/token).  This allows users
  // building APIs to easily provision OAuth2 tokens without specifying any
  // nested JSON configuration options.
  if (config.api) {
    extend(config, {
      web: {
        oauth2: enabled
      }
    });
  }

  callback(null, config);
};

module.exports = EnrichIntegrationConfigStrategy;
