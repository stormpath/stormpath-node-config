'use strict';

var common = require('../common');

var _ = common._;
var assert = common.assert;

var strategy = require('../../lib/strategy');
var EnrichIntegrationConfigStrategy = strategy.EnrichIntegrationConfigStrategy;

describe('EnrichIntegrationConfigStrategy', function () {
  var enabled = { enabled: true };

  it("shouldn't modify config if no flags are set", function (done) {
    var strategy = new EnrichIntegrationConfigStrategy();

    var testConfig = {};

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);
      assert.deepEqual(testConfig, config);
      done();
    });
  });

  it("should enable web endpoints when website config is true", function (done) {
    var strategy = new EnrichIntegrationConfigStrategy();

    var testConfig = {
      website: true
    };

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        website: true,
        web: {
          register: enabled,
          login: enabled,
          logout: enabled,
          me: enabled
        }
      });

      done();
    });
  });

  it("should enable api endpoints when api config is true", function (done) {
    var strategy = new EnrichIntegrationConfigStrategy();

    var testConfig = {
      api: true
    };

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        api: true,
        web: {
          oauth2: enabled
        }
      });

      done();
    });
  });

  it("should copy api key to client if present in root", function (done) {
    var strategy = new EnrichIntegrationConfigStrategy();

    var testConfig = {
      apiKey: {
        id: "abc",
        secret: "def"
      }
    };

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        apiKey: {
          id: "abc",
          secret: "def"
        },
        client: {
          apiKey: {
            id: "abc",
            secret: "def"
          }
        }
      });

      done();
    });
  });
});
