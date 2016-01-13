'use strict';

var path = require('path');
var common = require('./../common');
var expandHomeDir = require('../../lib/helpers/expand-home-dir');

var assert = common.assert;

describe('Helpers', function () {
  describe('expandHomeDir', function () {
    var isWindows = process.platform == 'win32';
    var envHomeKey = isWindows ? 'USERPROFILE' : 'HOME';

    it('returns path with home directory when ~/ is used', function(){
      var homePath = process.env[envHomeKey];

      assert.ok(homePath);

      var mockPath = '/foo/bar/qux.corge';
      var mockExpandedPath = path.join(homePath, mockPath);

      assert.equal(expandHomeDir('~'), homePath);
      assert.equal(expandHomeDir('~' + mockPath), mockExpandedPath);
      assert.equal(expandHomeDir(mockPath), mockPath);
    });

    describe('when home path isn\'t set', function () {
      it('returns false when it tries to resolve ~', function () {
        var originalHomeEnv = process.env[envHomeKey];

        process.env[envHomeKey] = '';

        function restoreHomeEnv() {
          process.env[envHomeKey] = originalHomeEnv;
        }

        assert.equal(expandHomeDir('~'), false);

        restoreHomeEnv();
      });

      it('returns path when ~ isn\'t provided (absolute path)', function () {
        var originalHomeEnv = process.env[envHomeKey];

        process.env[envHomeKey] = '';

        function restoreHomeEnv() {
          process.env[envHomeKey] = originalHomeEnv;
        }

        assert.equal(expandHomeDir('/my/file.xml'), '/my/file.xml');

        restoreHomeEnv();
      });
    });
  })
});
