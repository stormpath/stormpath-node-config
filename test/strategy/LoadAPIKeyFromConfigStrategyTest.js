'use strict';

var fs = require('fs');

var common = require('../common');

var _ = common._;
var assert = common.assert;
var temp = common.temp;

var strategy = require('../../lib/strategy');
var LoadAPIKeyFromConfigStrategy = strategy.LoadAPIKeyFromConfigStrategy;

describe('LoadAPIKeyFromConfigStrategy', function () {
  var keyPath, validPropertiesData, testConfig;

  before(function () {
    keyPath = temp.path({ suffix: '.properties' });
    validPropertiesData = "apiKey.id = abc\napiKey.secret = def";
    testConfig = {
      client: {
        apiKey: {
          file: keyPath
        }
      }
    }
  });

  it("should error when loading key that doesn't exist", function (done) {
    var strategy = new LoadAPIKeyFromConfigStrategy();

    fs.writeFileSync(keyPath, ',' + validPropertiesData);

    strategy.process(testConfig, function (err, config) {
      assert.isNotNull(err);
      assert.equal(err.message, 'Unable to read properties file: ' + keyPath);
      done();
    });
  });

  it("should error when loading valid key but with invalid data", function (done) {
    var strategy = new LoadAPIKeyFromConfigStrategy();

    fs.writeFileSync(keyPath, ',' + validPropertiesData);

    strategy.process(testConfig, function (err, config) {
      assert.isNotNull(err);
      assert.equal(err.message, 'Unable to read properties file: ' + keyPath);
      done();
    });
  });

  it("should succeed when loading valid key", function (done) {
    var strategy = new LoadAPIKeyFromConfigStrategy();

    fs.writeFileSync(keyPath, validPropertiesData);

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        client: {
          apiKey: {
            file: keyPath,
            id: "abc",
            secret: "def"
          },
        }
      });

      done();
    });
  });
});
