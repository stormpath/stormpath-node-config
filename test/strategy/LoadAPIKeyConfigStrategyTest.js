'use strict';

var fs = require('fs');

var common = require('../common');

var _ = common._;
var assert = common.assert;
var temp = common.temp;

var strategy = require('../../lib/strategy');
var LoadAPIKeyConfigStrategy = strategy.LoadAPIKeyConfigStrategy;

describe('LoadAPIKeyConfigStrategy', function () {
  var invalidKeyPath, validKeyPath, validPropertiesData, testConfig;

  before(function () {
    invalidKeyPath = temp.path({ suffix: '.properties' });
    validKeyPath = temp.path({ suffix: '.properties' });
    validPropertiesData = "apiKey.id = abc\napiKey.secret = def";
    testConfig = {
      client: {
        apiKey: {}
      },
      other: {
        abc: 123
      }
    };
  });

  describe('when home path isn\'t set', function () {
    var isWindows = process.platform == 'win32';
    var envHomeKey = isWindows ? 'USERPROFILE' : 'HOME';

    it('should just continue', function (done) {
      var originalHomeEnv = process.env[envHomeKey];

      process.env[envHomeKey] = '';

      function restoreHomeEnv() {
        process.env[envHomeKey] = originalHomeEnv;
      }

      var strategy = new LoadAPIKeyConfigStrategy('~/apiKey.properties', false);

      strategy.process(_.cloneDeep(testConfig), function (err, config) {
        assert.isNull(err);
        assert.deepEqual(config, testConfig);
        done();
      });

      restoreHomeEnv();
    });

    it('should error if file must exist', function (done) {
      var originalHomeEnv = process.env[envHomeKey];

      process.env[envHomeKey] = '';

      function restoreHomeEnv() {
        process.env[envHomeKey] = originalHomeEnv;
      }

      var strategy = new LoadAPIKeyConfigStrategy('~/apiKey.properties', true);

      strategy.process(_.cloneDeep(testConfig), function (err, config) {
        assert.isUndefined(config);
        assert.isNotNull(err);
        assert.equal(err.message, "Unable to load '~/apiKey.properties'. Environment home not set.");
        done();
      });

      restoreHomeEnv();
    });
  });

  it("should succeed when loading invalid key without requiring it to exist", function (done) {
    var strategy = new LoadAPIKeyConfigStrategy(invalidKeyPath, false);
    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);
      assert.deepEqual(config, testConfig);
      done();
    });
  });

  it("should error when loading invalid key and requiring it to exist", function (done) {
    var strategy = new LoadAPIKeyConfigStrategy(invalidKeyPath, true);
    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isUndefined(config);
      assert.isNotNull(err);
      assert.equal(err.message, "Client API key file not found: " + invalidKeyPath);
      done();
    });
  });

  it("should succeed when loading valid key", function (done) {
    var strategy = new LoadAPIKeyConfigStrategy(validKeyPath, true);

    fs.writeFileSync(validKeyPath, validPropertiesData);

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        client: {
          apiKey: {
            id: "abc",
            secret: "def"
          },
        },
        other: {
          abc: 123
        }
      });

      done();
    });
  });

  it("should succeed when loading valid but empty key without requiring it to exist", function (done) {
    var strategy = new LoadAPIKeyConfigStrategy(validKeyPath);

    fs.writeFileSync(validKeyPath, '');

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);
      assert.deepEqual(config, testConfig);
      done();
    });
  });

  it("should error when loading valid but empty key and requiring it to exist", function (done) {
    var strategy = new LoadAPIKeyConfigStrategy(validKeyPath, true);

    fs.writeFileSync(validKeyPath, '');

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isUndefined(config);
      assert.isNotNull(err);
      assert.equal(err.message, 'Unable to read properties file: ' + validKeyPath);
      done();
    });
  });

  it("should error when loading valid key with invalid data", function (done) {
    var strategy = new LoadAPIKeyConfigStrategy(validKeyPath, true);

    fs.writeFileSync(validKeyPath, ',' + validPropertiesData);

    strategy.process({}, function (err, config) {
      assert.isUndefined(config);
      assert.isNotNull(err);
      assert.equal(err.message, 'Unable to read properties file: ' + validKeyPath);
      done();
    });
  });
});
