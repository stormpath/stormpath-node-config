'use strict';

var join = require('path').join;

module.exports = {
  expandHomeDir: function (path) {
    var isWindows = process.platform == 'win32';
    var homeDir = process.env[isWindows ? 'USERPROFILE' : 'HOME'];

    if (!path) {
      return path;
    }

    if (homeDir) {
      if (path === '~') {
        return homeDir;
      }

      if (path.slice(0, 2) !== '~/') {
        return path;
      }
    } else {
      return false;
    }

    return join(homeDir, path.slice(2));
  }
}
