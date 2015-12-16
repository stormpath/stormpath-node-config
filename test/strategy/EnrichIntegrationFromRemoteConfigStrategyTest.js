'use strict';

var stormpath = require('stormpath');

var common = require('../common');
var assert = common.assert;
var sinon = common.sinon;

var Application = require('stormpath/lib/resource/Application');
var Collection = require('stormpath/lib/resource/CollectionResource');

var strategy = require('../../lib/strategy');
var EnrichIntegrationFromRemoteConfigStrategy = strategy.EnrichIntegrationFromRemoteConfigStrategy;

describe('EnrichIntegrationFromRemoteConfigStrategy', function () {
  var client, testStrategy;

  var mockApplicationData = {
    href: 'https://stormpath.mock/applications/stormpath',
    name: 'Stormpath'
  };

  var mockDirectory = {
    accountCreationPolicy: {
      verificationEmailStatus: 'ENABLED'
    },
    passwordPolicy: {
      resetEmailStatus: 'ENABLED'
    }
  };

  function makeMockConfig(mockApplication) {
    return {
      application: mockApplication,
      web: {
        register: {
          enabled: true
        }
      }
    };
  }

  function makeMockApplication(mockOAuthPolicy, mockAccountStoreMappings) {
    var mockApplication = new Application(mockApplicationData);

    sinon.stub(mockApplication, 'getOAuthPolicy')
      .yields(null, mockOAuthPolicy);

    sinon.stub(mockApplication, 'getAccountStoreMappings')
      .yields(null, mockAccountStoreMappings);

    return mockApplication;
  }

  before(function (done) {
    client = new stormpath.Client({
      skipRemoteConfig: true
    });

    testStrategy = new EnrichIntegrationFromRemoteConfigStrategy(function () {
      return client;
    });

    client.on('error', function (err) {
      throw err;
    });

    client.on('ready', function () {
      sinon.stub(client, 'getDirectory')
        .yields(null, mockDirectory);
      done();
    });
  });

  describe('when resolving an application', function () {
    it('should error if invalid', function (done) {
      testStrategy.process({ application: { href: '123' } }, function (err) {
        assert.isNotNull(err);
        assert.equal(err.message, 'Unable to resolve a Stormpath application.');
        done();
      });
    });
  });

  describe('when validating the application account store', function () {
    it('should error if there are no account store mappings', function (done) {
      var mockAccountStoreMappings = new Collection({ size: 0 });
      var mockApplication = makeMockApplication(null, mockAccountStoreMappings);
      var mockConfig = makeMockConfig(mockApplication);

      testStrategy.process(mockConfig, function (err) {
        assert.isNotNull(err);
        assert.equal(err.message, 'No account stores are mapped to the specified application. Account stores are required for login and registration.');
        done();
      });
    });

    it('should error if web.register is enabled but missing default account store mapping', function (done) {
      var mockAccountStoreMappings = new Collection({ size: 1 });
      var mockApplication = makeMockApplication(null, mockAccountStoreMappings);
      var mockConfig = makeMockConfig(mockApplication);

      mockApplication.defaultAccountStoreMapping = null;

      testStrategy.process(mockConfig, function (err) {
        assert.isNotNull(err);
        assert.equal(err.message, 'No default account store is mapped to the specified application. A default account store is required for registration.');
        done();
      });
    });
  });

  describe('when enriching', function () {
    it('should set the oAuthPolicy property on the application', function (done) {
      var mockOAuthPolicy = {};
      var mockAccountStoreMappings = new Collection({ size: 1 });
      var mockApplication = makeMockApplication(mockOAuthPolicy, mockAccountStoreMappings);
      var mockConfig = makeMockConfig(mockApplication);

      testStrategy.process(mockConfig, function (err, result) {
        assert.isNull(err);
        assert.equal(mockApplication.oAuthPolicy, mockOAuthPolicy);
        done();
      });
    });

    it('should set the socialProviders property on the configuration', function (done) {
      var mockOAuthPolicy = {};
      var mockAccountStoreMappings = new Collection({ size: 1 });
      var mockApplication = makeMockApplication(mockOAuthPolicy, mockAccountStoreMappings);
      var mockConfig = makeMockConfig(mockApplication);

      testStrategy.process(mockConfig, function (err, result) {
        assert.isNull(err);
        assert.isDefined(result.socialProviders);
        done();
      });
    });
  });
});
