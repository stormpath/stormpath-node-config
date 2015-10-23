'use strict';

var common = require('../common');
var assert = common.assert;

var strategy = require('../../lib/strategy');
var LoadEnvConfigStrategy = strategy.LoadEnvConfigStrategy;

describe('LoadEnvConfigStrategy', function () {
  var testPrefix, testConfig, testVariables;

  beforeEach(function () {
    testPrefix = "TEST";

    testConfig = {
      that: {
        exist: null,
        is: {
          alias: null
        },
        exists: {
          and: {
            areVery: {
              deep: null
            }
          }
        }
      }
    };

    testVariables = {
      TEST_THAT_EXIST: "123",
      TEST_THAT_EXISTS_AND_AREVERY_DEEP: "456",
      TEST_THAT_SHOULDNT_EXIST: "789",
      TEST_THAT_HAS_ALIAS: 'abc',
      THAT_EXIST: "zzz"
    };

    for (var key in testVariables) {
      process.env[key] = testVariables[key];
    }
  });

  afterEach(function () {
    for (var key in testVariables) {
      delete process.env[key];
    }
  });

  it('should load environment variables with respect to alias', function (done) {
    var strategy = new LoadEnvConfigStrategy(testPrefix, {
      TEST_THAT_IS_ALIAS: 'TEST_THAT_HAS_ALIAS'
    });

    strategy.process(testConfig, function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        that: {
          exist: "123",
          is: {
            alias: "abc"
          },
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

  it("should load environment variables that map to existing properties on config", function (done) {
    var strategy = new LoadEnvConfigStrategy(testPrefix);
    strategy.process(testConfig, function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        that: {
          exist: "123",
          is: {
            alias: null
          },
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
