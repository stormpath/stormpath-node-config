'use strict';

var extend = require('../helpers/clone-extend').extend;

/**
 * Represents a strategy that validates the configuration (post loading).
 *
 * @class
 */
function ValidateClientConfigStrategy () {
}

ValidateClientConfigStrategy.prototype.process = function (config, callback) {
  var newError = function (err) {
    callback(new Error(err));
  };

  if (!config) {
    return newError("Configuration not instantiated.");
  }

  var client = config.client;

  if (!client) {
    return newError("Client cannot be empty.");
  }

  var apiToken = config.apiToken;

  if (!apiToken) {
    return newError("apiToken required.");
  }

  if (!config.org){
    return newError("org is required, e.g. https://dev-1234.oktapreview.com.");
  }

  var applicationId = config.application && config.application.id;

  if (!applicationId) {
    return newError("application.id must be defined.");
  }

  var web = config.web;

  if (web && web.spa && web.spa.enabled && web.spa.view === null) {
    return newError("SPA mode is enabled but stormpath.web.spa.view isn't set. This needs to be the absolute path to the file that you want to serve as your SPA entry.");
  }

  callback(null, config);
};

module.exports = ValidateClientConfigStrategy;
