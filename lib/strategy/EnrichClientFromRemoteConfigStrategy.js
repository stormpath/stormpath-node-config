'use strict';

/**
 * Retrieves Stormpath settings from the API service, and ensures the local
 * configuration object properly reflects these settings.
 *
 * @class
*/
var EnrichClientFromRemoteConfigStrategy = function (client) {
  this.client = client;
};

// Finds and returns an Application object given an Application HREF.  Will
// return an error if no Application is found.
EnrichClientFromRemoteConfigStrategy.prototype._resolveApplicationByHref = function (config, href, cb) {
  this.client.getApplication(href, function (err, app) {
    if (err) {
      cb(err);
    } else {
      config.application = app;
      cb(null, app);
    }
  });
};

// Finds and returns an Application object given an Application name.  Will
// return an error if no Application is found.
EnrichClientFromRemoteConfigStrategy.prototype._resolveApplicationByName = function (config, name, cb) {
  this.client.getApplications({ name: name }, function(err, applications) {
    if (err) {
      return cb(err);
    }

    applications.detect(function(app, cb) {
      cb(name === app.name);
    }, function(app) {
      if (!app) {
        cb(new Error('Application not found: "' + name + '"'));
      } else {
        config.application = app;
        cb(null, app);
      }
    });
  });
};

EnrichClientFromRemoteConfigStrategy.prototype.process = function (config, callback) {
  var resolver = function (callback) {
    callback(null);
  };

  // This is an ugly hack. Basically a chicken and egg problem...
  // We're using this strategy as a part of configuring our client,
  // but in order to do an API call we need a client that is configured... ¯\_(ツ)_/¯
  // For now, cheat a little bit and set the config on our client before hand.
  this.client._setConfig(config);

  // If we have an application then resolve a configuration from it.
  if (config.application) {
    // Resolve the application either explicitly by HREF or implicitly by name.
    if (config.application.href) {
      resolver = this._resolveApplicationByHref.bind(this, config, config.application.href);
    } else if (config.application.name) {
      resolver = this._resolveApplicationByName.bind(this, config, config.application.name);
    }
  }

  resolver(function (err) {
    callback(err, err ? null : config);
  });
};

module.exports = EnrichClientFromRemoteConfigStrategy;