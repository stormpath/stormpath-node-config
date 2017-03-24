'use strict';

var common = require('../common');

var _ = common._;
var assert = common.assert;

var strategy = require('../../lib/strategy');
var EnrichIntegrationConfigStrategy = strategy.EnrichIntegrationConfigStrategy;

describe('EnrichIntegrationConfigStrategy', function () {
  var testConfig = {
    web: {
      multiTenancy: {
        enabled: false
      },
      register: {
        form: {
          fields: {
            organizationNameKey: {
            }
          }
        }
      },
      login: {
        form: {
          fields: {
            organizationNameKey: {
            }
          }
        }
      }
    }
  };

  describe('when nothing is enabled', function () {
    it('shouldn\'t modify the config', function (done) {
      var newTestConfig = _.cloneDeep(testConfig);
      var strategy = new EnrichIntegrationConfigStrategy(testConfig);

      strategy.process(newTestConfig, function (err, config) {
        assert.isNull(err);
        assert.deepEqual(testConfig, config);
        done();
      });
    });
  });

  describe('web.multiTenancy.enabled is true', function () {
    var newConfig;

    before(function (done) {
      var newTestConfig = _.cloneDeep(testConfig);
      var strategy = new EnrichIntegrationConfigStrategy(testConfig);

      newTestConfig.web.multiTenancy.enabled = true;

      strategy.process(newTestConfig, function (err, config) {
        assert.isNull(err);
        newConfig = config;
        done();
      });
    });

    it('should set web.login.form.fields.organizationNameKey.enabled to true', function () {
      assert.equal(newConfig.web.login.form.fields.organizationNameKey.enabled, true);
    });

    it('should set web.register.form.fields.organizationNameKey.enabled to true', function () {
      assert.equal(newConfig.web.register.form.fields.organizationNameKey.enabled, true);
    });
  });
});
