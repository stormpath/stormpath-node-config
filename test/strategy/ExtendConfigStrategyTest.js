'use strict';

var common = require('../common');
var assert = common.assert;

var strategy = require('../../lib/strategy');
var ExtendConfigStrategy = strategy.ExtendConfigStrategy;

describe('ExtendConfigStrategy', function () {
  it("should be able to extend member that references itself", function (done) {
    var extendConfig = {
      abc: "123"
    };

    extendConfig.root = extendConfig;
    extendConfig.something = {
      root: extendConfig
    };

    var strategy = new ExtendConfigStrategy(extendConfig);

    strategy.process({}, function(err, config) {
      if (err) {
        throw err;
      }

      assert.deepEqual(config, {
        abc: "123",
        root: extendConfig,
        something: {
          root: extendConfig
        }
      });

      // Assert that any circular references aren't broken.
      var cursor = config;
      for (var i = 0; i < 100; i++) {
        assert.equal(cursor.root, config);
        assert.equal(cursor.abc, "123");
        cursor = cursor.root;
      }

      done();
    });
  });

  it("should extend while keeping members from previous object and overwriting with members from new", function (done) {
    var baseConfig = {
      abc: "321",
      def: "abc",
      ghi: {
        xyz: "123"
      }
    };

    var extendConfig = {
      abc: "123",
      ghi: {
        jkl: "abc"
      },
      xyz: 123
    };

    var strategy = new ExtendConfigStrategy(extendConfig);

    strategy.process(baseConfig, function(err, config) {
      assert.isNull(err);

      assert.equal(baseConfig, config);
      assert.isNotTrue(!!extendConfig.def);

      assert.deepEqual(config, {
        abc: "123",
        def: "abc",
        ghi: {
          jkl: "abc",
          xyz: "123"
        },
        xyz: 123
      });

      done();
    });
  });

  describe('extension hacks', function () {
    it('should preserve the cacheOptions.client object reference', function() {
      var baseConfig = {
        foo: 'bar',
        cacheOptions: { }
      };

      function MockCacheClient(){
        return this;
      }
      MockCacheClient.prototype.get = function get() { };
      MockCacheClient.prototype.set = function set() { };
      var extendConfig = {
        cacheOptions: {
          client: new MockCacheClient()
        }
      };
      var strategy = new ExtendConfigStrategy(extendConfig);

      strategy.process(baseConfig, function(err, newConfig){
        assert.isNull(err);
        assert.equal(newConfig.foo, baseConfig.foo);
        assert.equal(newConfig.cacheOptions.client.get, extendConfig.cacheOptions.client.get);
      });
    });

    it('should overwrite the web.produces array', function () {
      var baseConfig = {
        web: {
          produces: ['df9d24dd-59b2-4485-a1ae-18b3b04e71fd', 'fa845bd0-541c-4062-b52c-6757b372d8e2', '414c77f8-45d6-413d-aa49-122ddb62c82c']
        }
      };

      var extendConfig = {
        web: {
          produces: ['81b52001-384f-4944-adc8-56cc81c6fa62']
        }
      };

      var strategy = new ExtendConfigStrategy(extendConfig);

      strategy.process(baseConfig, function(err, newConfig){
        assert.isNull(err);
        assert.deepEqual(newConfig.web.produces, extendConfig.web.produces);
      });
    });

    it('should overwrite the web.login.form.fieldOrder array', function () {
      var baseConfig = {
        web: {
          login: {
            form: {
              fieldOrder: ['53b83ca6-b34c-41ab-95da-5d6df830b411', '9488945a-bb61-4ee4-92ab-810f0238f67e', 'c1e11faf-0928-4cec-8b84-48af0ff006a1']
            }
          }
        }
      };

      var extendConfig = {
        web: {
          login: {
            form: {
              fieldOrder: ['f066405c-4232-41d1-a63d-e99a11b3e894']
            }
          }
        }
      };

      var strategy = new ExtendConfigStrategy(extendConfig);

      strategy.process(baseConfig, function(err, newConfig){
        assert.isNull(err);
        assert.deepEqual(newConfig.web.login.form.fieldOrder, extendConfig.web.login.form.fieldOrder);
      });
    });

    it('should overwrite the web.register.form.fieldOrder array', function () {
      var baseConfig = {
        web: {
          register: {
            form: {
              fieldOrder: ['cabacd56-d996-49e1-bd3c-2fbac565473d', 'ccfb9bed-f2e6-4ca8-a854-ce0bae55c941', '7106bfd1-df64-40c1-b379-cd18dde9cb43']
            }
          }
        }
      };

      var extendConfig = {
        web: {
          register: {
            form: {
              fieldOrder: ['7d360fe6-0708-470a-857e-46170c84dbe0']
            }
          }
        }
      };

      var strategy = new ExtendConfigStrategy(extendConfig);

      strategy.process(baseConfig, function(err, newConfig){
        assert.isNull(err);
        assert.deepEqual(newConfig.web.register.form.fieldOrder, extendConfig.web.register.form.fieldOrder);
      });
    });
  });
});
