'use strict';

var common = require('../common');
var assert = common.assert;

var strategy = require('../../lib/strategy');
var DebugConfigStrategy = strategy.DebugConfigStrategy;

function MockLogger(listener) {
  this.listener = listener;
}

MockLogger.prototype.debug = function (message) {
  this.listener('debug', message);
};

describe('DebugConfigStrategy', function () {
  var mockLogger;
  var testSection;
  var testConfig;
  var testStrategy;
  var testListener;
  var loggedTestMessages = [];

  before(function () {
    testSection = '5c774a9e-72b2-4784-9729-3add5341fd39';
    testConfig = { abc: '5e2bf333-deac-490a-bfb2-f7d83f2748e1' };

    testListener = function onMessageLogged(type, message) {
      loggedTestMessages.push({ type: type, message: message });
    };

    mockLogger = new MockLogger(testListener);
    testStrategy = new DebugConfigStrategy(mockLogger, testSection);
  });

  describe('.process(config, callback)', function () {
    var returnedConfig;

    beforeEach(function (done) {
      testStrategy.process(testConfig, function (err, config) {
        returnedConfig = config;

        done(err);
      });
    });

    it('should log debug message', function () {
      assert.equal(loggedTestMessages.length, 1);
      assert.deepEqual(loggedTestMessages[0], { type: 'debug', message: testSection + ':\n' + JSON.stringify(testConfig, null, 4) + '\n' });
    });

    it('should call callback with provided config', function () {
      assert.deepEqual(returnedConfig, testConfig);
    });
  });
});
