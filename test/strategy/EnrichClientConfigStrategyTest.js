'use strict';

var common = require('../common');

var _ = common._;
var assert = common.assert;

var strategy = require('../../lib/strategy');
var EnrichClientConfigStrategy = strategy.EnrichClientConfigStrategy;

describe('EnrichClientConfigStrategy', function () {
  it("shouldn't modify config if apiKey isn't set", function (done) {
    var strategy = new EnrichClientConfigStrategy();

    var testConfig = {};

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);
      assert.deepEqual(testConfig, config);
      done();
    });
  });

  it("should copy the apiKey to the root config if key is set", function (done) {
    var strategy = new EnrichClientConfigStrategy();

    var apiKey = {
      id: "abc",
      secret: "def"
    };

    var testConfig = {
      client: {
        apiKey: apiKey
      }
    };

    strategy.process(_.cloneDeep(testConfig), function (err, config) {
      assert.isNull(err);

      assert.deepEqual(config, {
        apiKey: apiKey,
        client: {
          apiKey: apiKey
        }
      });

      done();
    });
  });
});
