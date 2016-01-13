'use strict';

var path = require('path');
var common = require('./../common');
var expandHomeDir = require('../../lib/helpers/expand-home-dir');

var assert = common.assert;

describe('Helpers', function () {
  describe('expandHomeDir', function () {
    var isWindows = process.platform == 'win32';
    var envHomeKey = isWindows ? 'USERPROFILE' : 'HOME';

    it('expands ~/', function(){
      var homePath = process.env[envHomeKey];

      assert.ok(homePath);

      var mockPath = '/foo/bar/qux.corge';
      var mockExpandedPath = path.join(homePath, mockPath);

      assert.equal(expandHomeDir('~'), homePath);
      assert.equal(expandHomeDir('~/foo/bar/qux.corge'), mockExpandedPath);
      assert.equal(expandHomeDir('/foo/bar/qux.corge'), mockPath);
    });

    it('returns false when no home path is set', function () {
      var originalHomeEnv = process.env[envHomeKey];

      process.env[envHomeKey] = '';

      function restoreHomeEnv() {
        process.env[envHomeKey] = originalHomeEnv;
      }

      assert.equal(expandHomeDir('~'), false);

      restoreHomeEnv();
    });
  })
});
