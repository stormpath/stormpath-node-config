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
    return newError("apiToken required.  Please provide your Okta API token to the client constructor as `apiToken` or through the OKTA_APITOKEN environment variable.");
  }

  if (!config.org){
    return newError("org is required, e.g. https://dev-1234.oktapreview.com. Please provide to the client constructor as `org` or through the OKTA_ORG environment variable.");
  }

  if (config.org.match(new RegExp(/-admin\./))){
    return newError("Provided OKTA_ORG " + config.org + " is the URL for your Org Admin UI, please remove -admin from the OKTA_ORG, e.g. https://dev-1234.oktapreview.com.");
  }

  config.org = config.org.replace(/\/$/,'') + '/';

  var applicationId = config.application && config.application.id;

  if (!applicationId) {
    return newError("application.id must be defined. Please provide to the client constructor as `application.id` or through the OKTA_APPLICATION_ID environment variable.");
  }

  var web = config.web;

  if (web && web.spa && web.spa.enabled && web.spa.view === null) {
    return newError("SPA mode is enabled but stormpath.web.spa.view isn't set. This needs to be the absolute path to the file that you want to serve as your SPA entry.");
  }

  callback(null, config);
};

module.exports = ValidateClientConfigStrategy;
