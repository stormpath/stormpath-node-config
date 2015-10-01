'use strict';

var common = require('../common');
var assert = common.assert;

var strategy = require('../../lib/strategy');
var NullConfigStrategy = strategy.NullConfigStrategy;

describe('NullConfigStrategy', function () {
  var nullObject = {};

  it("should return the null object passed to the strategy", function (done) {
    var strategy = new NullConfigStrategy(nullObject);
    strategy.process(function (err, config) {
      assert.isNull(err);
      assert.equal(nullObject, config);
      done();
    });
  });
});
