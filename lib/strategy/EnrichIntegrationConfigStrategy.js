'use strict';

var extend = require('../helpers/clone-extend').extend;

/**
 * Represents a strategy that enriches the configuration (post loading).
 *
 * @class
 */
function EnrichIntegrationConfigStrategy(userConfig) {
  this.userConfig = userConfig;
}

EnrichIntegrationConfigStrategy.prototype.process = function (config, callback) {
  // If multi-tenancy is enabled, and if there isn't a value for organizationNameKey
  // isn't set, then force a value for it.
  if (config.web.multiTenancy.enabled) {
    if (config.web.register.form.fields.organizationNameKey.enabled !== false) {
      config.web.register.form.fields.organizationNameKey.enabled = true;
    }

    if (config.web.login.form.fields.organizationNameKey.enabled !== false) {
      config.web.login.form.fields.organizationNameKey.enabled = true;
    }
  }

  callback(null, config);
};

module.exports = EnrichIntegrationConfigStrategy;
