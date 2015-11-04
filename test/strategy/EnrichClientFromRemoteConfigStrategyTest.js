'use strict';

var stormpath = require('stormpath');

var common = require('../common');
var _ = common._;
var assert = common.assert;
var sinon = common.sinon;

var strategy = require('../../lib/strategy');
var EnrichClientFromRemoteConfigStrategy = strategy.EnrichClientFromRemoteConfigStrategy;

describe('EnrichClientFromRemoteConfigStrategy', function () {
  var client, mockApplications, testStrategy;

  before(function (done) {
    mockApplications = [{
      href: 'https://stormpath.mock/applications/stormpath',
      name: 'Stormpath'
    }, {
      href: 'https://stormpath.mock/applications/my-application',
      name: 'My Application'
    }];

    client = new stormpath.Client({
      skipRemoteConfig: true
    });

    testStrategy = new EnrichClientFromRemoteConfigStrategy(function () {
      return client;
    });

    client.on('error', function (err) {
      throw err;
    });

    client.on('ready', function () {
      done();
    });
  });

  it('should resolve application by name', function (done) {
    var mockApplication = mockApplications[1];
    var mockName = mockApplication.name;

    var testConfig = {
      application: {
        name: mockName
      }
    };

    if (client.getApplications.restore) {
      client.getApplications.restore();
    }

    var mockItems = {
      items: mockApplications
    };

    mockItems.detect = function (predicate, callback) {
      predicate(mockApplications[0], function (result) {
        assert.isFalse(result);
      });
      predicate(mockApplication, function (result) {
        assert.isTrue(result);
      });
      callback(mockApplication);
    };

    sinon.stub(client, 'getApplications')
      .withArgs({ name: mockName })
      .yields(null, mockItems);

    testStrategy.process(testConfig, function (err, resultConfig) {
      assert.isNull(err);

      assert.deepEqual(resultConfig, {
        application: mockApplication
      });

      done();
    });
  });

  it('should resolve application by href', function (done) {
    var mockApplication = mockApplications[1];
    var mockHref = mockApplication.href;

    var testConfig = {
      application: {
        href: mockHref
      }
    };

    if (client.getApplication.restore) {
      client.getApplication.restore();
    }

    sinon.stub(client, 'getApplication')
      .withArgs(mockHref)
      .yields(null, mockApplication);

    testStrategy.process(testConfig, function (err, resultConfig) {
      assert.isNull(err);

      assert.deepEqual(resultConfig, {
        application: mockApplication
      });

      done();
    });
  });

  describe('when neither href or name is specified', function () {
    it('should resolve a default application', function (done) {
      var testConfig = {};

      if (client.getApplications.restore) {
        client.getApplications.restore();
      }

      sinon.stub(client, 'getApplications').yields(null, {
        items: mockApplications
      });

      testStrategy.process(testConfig, function (err, resultConfig) {
        assert.isNull(err);

        assert.deepEqual(resultConfig, {
          application: mockApplications[1]
        });

        done();
      });
    });
  });
});
