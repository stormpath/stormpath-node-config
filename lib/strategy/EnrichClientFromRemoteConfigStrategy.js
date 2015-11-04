'use strict';

var _ = require('lodash');

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
      // TODO: If 404 then give the user a more valuable error, e.g. stating that the application doesn't exist.
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
  client.getApplications({ name: name }, function (err, applications) {
    if (err) {
      return cb(err);
    }

    applications.detect(function (app, cb) {
      cb(name === app.name);
    }, function (app) {
      if (!app) {
        cb(new Error('Application not found: "' + name + '"'));
      } else {
        config.application = app;
        cb(null, app);
      }
    });
  });
};

// If there are only two applications and one of them is
// the Stormpath application, then use the other one as default.
EnrichClientFromRemoteConfigStrategy.prototype._resolveDefaultApplication = function (client, config, cb) {
  client.getApplications(function (err, applications) {
    if (err) {
      return cb(err);
    }

    var userApplications = _.filter(applications.items, function (app) {
      return app.name !== 'Stormpath';
    });

    if (userApplications.length === 1) {
      config.application = userApplications[0];
      cb(null, userApplications[0]);
    } else {
      cb(new Error('No application found.'));
    }
  });
};

EnrichClientFromRemoteConfigStrategy.prototype.process = function (config, callback) {
  if (config.skipRemoteConfig) {
    return callback(null, config);
  }

  var resolver = null;
  var application = config.application || {};
  var client = this.clientFactory(config);

  // Resolve the application either explicitly by HREF or implicitly by name.
  if (application.href) {
    resolver = this._resolveApplicationByHref.bind(this, client, config, application.href);
  } else if (application.name) {
    resolver = this._resolveApplicationByName.bind(this, client, config, application.name);
  } else {
    resolver = this._resolveDefaultApplication.bind(this, client, config);
  }

  client.on('ready', function () {
    resolver(function (err) {
      callback(err, err ? null : config);
    });
  });
};

module.exports = EnrichClientFromRemoteConfigStrategy;
