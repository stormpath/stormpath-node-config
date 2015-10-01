'use strict';

var common = require('../common');
var assert = common.assert;

var strategy = require('../../lib/strategy');
var LoadEnvConfigStrategy = strategy.LoadEnvConfigStrategy;

describe('LoadEnvConfigStrategy', function () {
  var testPrefix = "TEST";

  var testConfig = {
    that: {
      exist: null,
      exists: {
        and: {
          areVery: {
            deep: null
          }
        }
      }
    }
  };

  var testVariables = {
    TEST_THAT_EXIST: "123",
    TEST_THAT_EXISTS_AND_AREVERY_DEEP: "456",
    TEST_THAT_DOESNT_EXIST: "789",
    THAT_EXIST: "zzz"
  };

  before(function () {
    for (var key in testVariables) {
      process.env[key] = testVariables[key];
    }
  });

  after(function () {
    for (var key in testVariables) {
      delete process.env[key];
    }
  });

  it("should load environment variables that map to existing properties on config", function (done) {
    var strategy = new LoadEnvConfigStrategy(testPrefix);
    strategy.process(testConfig, function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        that: {
          exist: "123",
          exists: {
            and: {
              areVery: {
                deep: "456"
              }
            }
          }
        }
      });

      done();
    });
  });
});
