'use strict';

/**
 * Retrieves Stormpath settings from the API service, and ensures the local
 * configuration object properly reflects these settings.
 *
 * @class
*/
function EnrichClientFromRemoteConfigStrategy (clientFactory) {
  this.clientFactory = clientFactory;
}

// Finds and returns an Application object given an Application HREF.  Will
// return an error if no Application is found.
EnrichClientFromRemoteConfigStrategy.prototype._resolveApplicationByHref = function (client, config, href, cb) {
  client.getApplication(href, function (err, app) {
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
EnrichClientFromRemoteConfigStrategy.prototype._resolveApplicationByName = function (client, config, name, cb) {
  client.getApplications({ name: name }, function(err, applications) {
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
  var application = config.application;

  if (config.skipRemoteConfig) {
    return callback(null, config);
  }

  // If we have an application then resolve a configuration using it.
  if (application) {
    var resolver = null;
    var client = this.clientFactory(config);

    // Resolve the application either explicitly by HREF or implicitly by name.
    if (application.href) {
      resolver = this._resolveApplicationByHref.bind(this, client, config, application.href);
    } else if (application.name) {
      resolver = this._resolveApplicationByName.bind(this, client, config, application.name);
    }

    if (resolver) {
      return client.on('ready', function () {
        resolver(function (err) {
          callback(err, err ? null : config);
        });
      });
    }
  }

  callback(null, config);
};

module.exports = EnrichClientFromRemoteConfigStrategy;
