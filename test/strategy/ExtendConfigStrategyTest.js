'use strict';

var common = require('../common');
var assert = common.assert;

var strategy = require('../../lib/strategy');
var ExtendConfigStrategy = strategy.ExtendConfigStrategy;

describe('ExtendConfigStrategy', function () {
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
});
