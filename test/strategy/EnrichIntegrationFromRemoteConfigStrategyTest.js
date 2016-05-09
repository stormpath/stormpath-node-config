'use strict';

var stormpath = require('stormpath');

var common = require('../common');
var assert = common.assert;
var sinon = common.sinon;
var strings = common.strings;

var Directory = require('stormpath/lib/resource/Directory');
var Application = require('stormpath/lib/resource/Application');
var Collection = require('stormpath/lib/resource/CollectionResource');
var AccountStoreMapping = require('stormpath/lib/resource/AccountStoreMapping');

var strategy = require('../../lib/strategy');
var EnrichIntegrationFromRemoteConfigStrategy = strategy.EnrichIntegrationFromRemoteConfigStrategy;

var sandbox;

describe('EnrichIntegrationFromRemoteConfigStrategy', function () {
  var client, testStrategy;

  var mockApplicationData = {
    href: 'https://stormpath.mock/applications/stormpath',
    name: 'Stormpath'
  };

  var mockDirectory = {
    href: 'https://stormpath.mock/directories/stormpath',
    accountCreationPolicy: {
      verificationEmailStatus: 'ENABLED'
    },
    passwordPolicy: {
      resetEmailStatus: 'ENABLED'
    },
    getPasswordPolicy: function () {}
  };

  function makeMockConfig(mockApplication) {
    return {
      application: mockApplication,
      web: {
        register: {
          enabled: true
        },
        forgotPassword: {
          enabled: true
        },
        changePassword: {
          enabled: true
        },
        verifyEmail: {
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

  function makeMockDirectory() {
    var directory = new Directory({ href: 'http://mock.api/directories/mock' });

    sinon.stub(directory, 'getProvider')
      .yields(null, {
        providerId: 'mock'
      });

    return directory;
  }

  before(function (done) {
    client = new stormpath.Client({
      skipRemoteConfig: true,
      client: {
        apiKey: {
          id: 'abc',
          secret: 'def'
        }
      }
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

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('when resolving an application', function () {
    it('should error if invalid', function (done) {
      testStrategy.process({ application: { href: '123' } }, function (err) {
        assert.isNotNull(err);
        assert.equal(err.message, strings.UNABLE_TO_RESOLVE_APP);
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
        assert.equal(err.message, strings.NO_ACCOUNT_STORES_MAPPED);
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
        assert.equal(err.message, strings.NO_DEFAULT_ACCOUNT_STORE_MAPPED);
        done();
      });
    });

    it('should error if both web.register.autoLogin and config.web.verifyEmail.enabled is set at same time', function (done) {
      var mockAccountStoreMapping = new AccountStoreMapping({ accountStore: makeMockDirectory() });
      var mockAccountStoreMappings = new Collection({ size: 1, items: [mockAccountStoreMapping] }, null, AccountStoreMapping);

      mockAccountStoreMappings.detect = function (iter, complete) {
        complete(mockAccountStoreMapping);
      };

      mockAccountStoreMappings.each = function (iter, complete) {
        iter(mockAccountStoreMapping, function () {
          complete();
        });
      };

      sinon.stub(mockAccountStoreMapping, 'getAccountStore')
        .yields(null, mockAccountStoreMapping.accountStore);

      var mockApplication = makeMockApplication(null, mockAccountStoreMappings);
      var mockConfig = makeMockConfig(mockApplication);

      mockConfig.web.register.autoLogin = true;

      testStrategy.process(mockConfig, function (err) {
        assert.isNotNull(err);
        assert.equal(err.message, strings.CONFLICTING_AUTO_LOGIN_AND_EMAIL_VERIFICATION_CONFIG);
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

    it('should set the web.social property on the configuration', function (done) {
      var mockOAuthPolicy = {};
      var mockAccountStoreMappings = new Collection({ size: 1 });
      var mockApplication = makeMockApplication(mockOAuthPolicy, mockAccountStoreMappings);
      var mockConfig = makeMockConfig(mockApplication);

      testStrategy.process(mockConfig, function (err, result) {
        assert.isNull(err);
        assert.isDefined(result.web.social);
        done();
      });
    });
  });

  describe('when parsing the directory workflow statuses', function () {
    var enrichWithDirectoryPolicies;
    var mockConfig;

    beforeEach(function () {
      var mockAccountStoreMappings = new Collection({ size: 0 });
      var mockApplication = makeMockApplication(null, mockAccountStoreMappings);

      var policy = {
        getStrength: function () {}
      };

      enrichWithDirectoryPolicies = testStrategy._enrichWithDirectoryPolicies;
      mockConfig = makeMockConfig(mockApplication);

      sandbox.stub(mockDirectory, 'getPasswordPolicy').yields(null, policy);
      sandbox.stub(policy, 'getStrength').yields(null, {});
    });

    describe('the password policy', function () {
      describe('when "ENABLED"', function () {
        beforeEach(function () {
          mockDirectory.passwordPolicy.resetEmailStatus = 'ENABLED';
        });

        describe('and config.web.forgotPassword.enabled is false', function () {
          it('should leave config.web.forgotPassword.enabled as false', function (done) {
            mockConfig.web.forgotPassword.enabled = false;

            enrichWithDirectoryPolicies(client, mockConfig, mockDirectory.href, function () {
              assert.equal(mockConfig.web.forgotPassword.enabled, false);
              done();
            });
          });
        });

        describe('and config.web.forgotPassword.enabled is undefined', function () {
          it('should set config.web.forgotPassword.enabled to true', function (done) {
            mockConfig.web.forgotPassword.enabled = undefined;

            enrichWithDirectoryPolicies(client, mockConfig, mockDirectory.href, function () {
              assert.equal(mockConfig.web.forgotPassword.enabled, true);
              done();
            });
          });
        });

        describe('and config.web.changePassword.enabled is false', function () {
          it('should leave config.web.changePassword.enabled as false', function (done) {
            mockConfig.web.changePassword.enabled = false;

            enrichWithDirectoryPolicies(client, mockConfig, mockDirectory.href, function () {
              assert.equal(mockConfig.web.changePassword.enabled, false);
              done();
            });
          });
        });

        describe('and config.web.changePassword.enabled is undefined', function () {
          it('should set config.web.changePassword.enabled to true', function (done) {
            mockConfig.web.changePassword.enabled = undefined;

            enrichWithDirectoryPolicies(client, mockConfig, mockDirectory.href, function () {
              assert.equal(mockConfig.web.changePassword.enabled, true);
              done();
            });
          });
        });
      });

      describe('when undefined', function () {
        beforeEach(function () {
          mockDirectory.passwordPolicy.resetEmailStatus = undefined;
        });

        it('should set config.web.forgotPassword.enabled to false', function (done) {
          mockConfig.web.forgotPassword.enabled = true;

          enrichWithDirectoryPolicies(client, mockConfig, mockDirectory.href, function () {
            assert.equal(mockConfig.web.forgotPassword.enabled, false);
            done();
          });
        });

        it('should set config.web.changePassword.enabled to false', function (done) {
          mockConfig.web.changePassword.enabled = true;

          enrichWithDirectoryPolicies(client, mockConfig, mockDirectory.href, function () {
            assert.equal(mockConfig.web.changePassword.enabled, false);
            done();
          });
        });
      });
    });

    describe('the email verification policy', function(){
      describe('when ENABLED', function(){
        beforeEach(function () {
          mockDirectory.accountCreationPolicy.verificationEmailStatus = 'ENABLED';
        });

        describe('and config.web.verifyEmail.enabled is false', function () {
          it('should leave config.web.verifyEmail.enabled as false', function (done) {
            mockConfig.web.verifyEmail.enabled = false;

            enrichWithDirectoryPolicies(client, mockConfig, mockDirectory.href, function () {
              assert.equal(mockConfig.web.verifyEmail.enabled, false);
              done();
            });
          });
        });

        describe('and config.web.verifyEmail.enabled is undefined', function () {
          it('should set config.web.verifyEmail.enabled to true', function (done) {
            mockConfig.web.verifyEmail.enabled = undefined;

            enrichWithDirectoryPolicies(client, mockConfig, mockDirectory.href, function () {
              assert.equal(mockConfig.web.verifyEmail.enabled, true);
              done();
            });
          });
        });
      });
    });
  });
});
