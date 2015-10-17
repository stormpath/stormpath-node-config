'use strict';

var common = require('../common');

var _ = common._;
var assert = common.assert;

var strategy = require('../../lib/strategy');
var EnrichIntegrationConfigStrategy = strategy.EnrichIntegrationConfigStrategy;

describe('EnrichIntegrationConfigStrategy', function () {
  var enabled = { enabled: true };
  var disabled = { enabled: false };

  it("shouldn't modify config if no flags are set", function (done) {
    var testConfig = {};

    var strategy = new EnrichIntegrationConfigStrategy(testConfig);

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);
      assert.deepEqual(testConfig, config);
      done();
    });
  });

  it("should enable web endpoints when website config is true", function (done) {
    var testConfig = {
      website: true
    };

    var strategy = new EnrichIntegrationConfigStrategy(testConfig);

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

  it("should enable web endpoints when web config is true but without overriding any endpoints already set by user", function (done) {
    var testConfig = {
      website: true,
      web: {
        login: disabled,
        me: disabled
      }
    };

    var strategy = new EnrichIntegrationConfigStrategy(testConfig);

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        website: true,
        web: {
          register: enabled,
          login: disabled,
          logout: enabled,
          me: disabled
        }
      });

      done();
    });
  });

  it("should enable api endpoints when api config is true", function (done) {
    var testConfig = {
      api: true
    };

    var strategy = new EnrichIntegrationConfigStrategy(testConfig);

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

  it("should enable api endpoints when api config is true but without overriding any endpoints already set by user", function (done) {
    var testConfig = {
      api: true,
      web: {
        oauth2: disabled
      }
    };

    var strategy = new EnrichIntegrationConfigStrategy(testConfig);

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        api: true,
        web: {
          oauth2: disabled
        }
      });

      done();
    });
  });
});
