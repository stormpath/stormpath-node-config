'use strict';

var common = require('../common');

var _ = common._;
var assert = common.assert;
var temp = common.temp;

var fs = require('fs');

var strategy = require('../../lib/strategy');
var LoadFileConfigStrategy = strategy.LoadFileConfigStrategy;

describe('LoadFileConfigStrategy', function () {
  var testConfig, invalidJsonPath;

  before(function () {
    testConfig = { abc: "123", def: [2, 1, 3] };
    invalidJsonPath = temp.path({ suffix: '.json' });
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

      var strategy = new LoadFileConfigStrategy('~/something.xml', false);

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

      var strategy = new LoadFileConfigStrategy('~/something.xml', true);

      strategy.process(_.cloneDeep(testConfig), function (err, config) {
        assert.isUndefined(config);
        assert.isNotNull(err);
        assert.equal(err.message, "Unable to load '~/something.xml'. Environment home not set.");
        done();
      });

      restoreHomeEnv();
    });
  });

  it("should error when loading file with unsupported file type", function (done) {
    var strategy = new LoadFileConfigStrategy('something.xml', false);
    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isUndefined(config);
      assert.isNotNull(err);
      assert.equal(err.message, "Unable to load file 'something.xml'. Extension 'xml' not supported.");
      done();
    });
  });

  it("should succeed when loading invalid file but with valid json file type", function (done) {
    var strategy = new LoadFileConfigStrategy('something.json', false);
    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);
      assert.deepEqual(config, testConfig);
      done();
    });
  });

  it("should succeed when loading invalid file but with valid yaml file type", function (done) {
    var strategy = new LoadFileConfigStrategy('something.yml', false);
    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);
      assert.deepEqual(config, testConfig);
      done();
    });
  });

  it("should succeed when loading invalid file without requiring it to exist", function (done) {
    var strategy = new LoadFileConfigStrategy(invalidJsonPath, false);
    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);
      assert.deepEqual(config, testConfig);
      done();
    });
  });

  it("should error when loading invalid file and requiring it to exist", function (done) {
    var strategy = new LoadFileConfigStrategy(invalidJsonPath, true);
    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isUndefined(config);
      assert.isNotNull(err);
      assert.equal(err.message, "Config file '" + invalidJsonPath + "' doesn't exist.");
      done();
    });
  });

  it("should succeed when loading valid file with valid json", function (done) {
    var validJsonPath = temp.path({ suffix: '.json' });
    var strategy = new LoadFileConfigStrategy(validJsonPath, true);

    fs.writeFileSync(validJsonPath, JSON.stringify(testConfig));

    strategy.process({}, function (err, config) {
      assert.isNull(err);
      assert.deepEqual(config, testConfig);
      done();
    });
  });

  it("should error when loading valid file with invalid json", function (done) {
    var validJsonPath = temp.path({ suffix: '.json' });
    var strategy = new LoadFileConfigStrategy(validJsonPath, true);

    fs.writeFileSync(validJsonPath, ',' + JSON.stringify(testConfig));

    strategy.process({}, function (err, config) {
      assert.isUndefined(config);
      assert.isNotNull(err);
      assert.match(err.message, /Unexpected token/);
      done();
    });
  });
});
