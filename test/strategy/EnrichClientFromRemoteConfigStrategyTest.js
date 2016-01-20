'use strict';

var stormpath = require('stormpath');

var common = require('../common');
var assert = common.assert;
var sinon = common.sinon;
var strings = common.strings;

var Application = require('stormpath/lib/resource/Application');
var Collection = require('stormpath/lib/resource/CollectionResource');

var strategy = require('../../lib/strategy');
var EnrichClientFromRemoteConfigStrategy = strategy.EnrichClientFromRemoteConfigStrategy;

describe('EnrichClientFromRemoteConfigStrategy', function () {
  var client, testStrategy;

  var mockRestApiError = {
    err: 'something bad happened'
  };

  var mockApplications = [{
    href: 'https://stormpath.mock/applications/stormpath',
    name: 'Stormpath'
  }, {
    href: 'https://stormpath.mock/applications/my-application',
    name: 'My Application'
  }];

  var mockEmptyCollectionResponse = new Collection({
    items: []
  });

  var mockResolveableApplicationResponse = new Collection({
    items: mockApplications
  });

  var mockUnresolveableApplicationResponse = new Collection({
    items: mockApplications.concat([{
      href: 'https://stormpath.mock/applications/my-other-application',
      name: 'My Other Application'
    }])
  });

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

  describe('when an application name is specified', function(){
    afterEach(function(){
      client.getApplications.restore();
    });

    it('should return REST API errors if the erorr is not 404', function(done) {
      var testConfig = {
        application: {
          name: 'hello'
        }
      };

      sinon.stub(client, 'getApplications').yields(mockRestApiError);

      testStrategy.process(testConfig, function (err) {
        assert.isNotNull(err);
        assert.deepEqual(err,mockRestApiError);
        done();
      });
    });

    it('should return an error if the application cannot be found', function(done) {
      var mockName = 'hello';

      var testConfig = {
        application: {
          name: mockName
        }
      };

      sinon.stub(client, 'getApplications')
        .withArgs({ name: mockName })
        .yields(null, mockEmptyCollectionResponse);

      testStrategy.process(testConfig, function (err) {
        assert.isNotNull(err);
        assert.equal(err.message, strings.APP_NAME_NOT_FOUND.replace('%name%', mockName));
        done();
      });
    });

    it('should return the correct application if it exists', function (done) {
      var mockApplication = mockApplications[1];
      var mockName = mockApplication.name;

      var testConfig = {
        application: {
          name: mockName
        }
      };

      sinon.stub(client, 'getApplications')
        .withArgs({ name: mockName })
        .yields(null, mockResolveableApplicationResponse);

      testStrategy.process(testConfig, function (err, resultConfig) {
        assert.isNull(err);
        assert.equal(resultConfig.application.name, mockApplication.name);
        done();
      });
    });
  });

  describe('when an application href is defined', function(){
    var mockApplication = mockApplications[1];
    var mockHref = mockApplication.href;

    var testConfig = {
      application: {
        href: mockHref
      }
    };

    afterEach(function(){
      client.getApplication.restore();
    });

    it('should return REST API errors if the erorr is not 404', function(done) {
      sinon.stub(client, 'getApplication')
        .withArgs(mockHref)
        .yields(mockRestApiError);

      testStrategy.process(testConfig, function (err) {
        assert.isNotNull(err);
        assert.deepEqual(err,mockRestApiError);
        done();
      });
    });

    it('should return an error if the application cannot be found by href', function(done) {
      sinon.stub(client, 'getApplication')
        .withArgs(mockHref)
        .yields({
          status: 404
        });

      testStrategy.process(testConfig, function (err) {
        assert.isNotNull(err);
        assert.equal(err.message, strings.APP_HREF_NOT_FOUND.replace('%href%', mockHref));
        done();
      });
    });

    it('should resolve application by href if the application exists', function (done) {
      sinon.stub(client, 'getApplication')
        .withArgs(mockHref)
        .yields(null, new Application(mockApplication));

      testStrategy.process(testConfig, function (err, resultConfig) {
        assert.isNull(err);
        assert.equal(resultConfig.application.href, mockApplication.href);
        done();
      });
    });
  });

  describe('when neither href or name is specified', function () {
    var testConfig = {};

    afterEach(function(){
      client.getApplications.restore();
    });

    it('should return REST API errors if the erorr is not 404', function(done) {
      sinon.stub(client, 'getApplications').yields(mockRestApiError);

      testStrategy.process(testConfig, function (err) {
        assert.isNotNull(err);
        assert.deepEqual(err,mockRestApiError);
        done();
      });
    });

    it('should return an "unresolveable" error if more than one application exists, other than the `Stormpath` application', function(done) {
      sinon.stub(client, 'getApplications')
        .yields(null, mockUnresolveableApplicationResponse);

      testStrategy.process(testConfig, function (err) {
        assert.isNotNull(err);
        assert.equal(err.message, strings.UNABLE_TO_AUTO_RESOLVE_APP);
        done();
      });
    });

    it('should return the application that is not the `Stormpath` application, if that is the only other application that exists', function (done) {
      sinon.stub(client, 'getApplications')
        .yields(null, mockResolveableApplicationResponse);

      testStrategy.process(testConfig, function (err, resultConfig) {
        assert.isNull(err);
        assert.equal(resultConfig.application.href, mockApplications[1].href);
        done();
      });
    });
  });
});
