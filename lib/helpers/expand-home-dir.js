'use strict';

var join = require('path').join;

function expandHomeDir(path) {
  var isWindows = process.platform == 'win32';
  var homeDir = process.env[isWindows ? 'USERPROFILE' : 'HOME'];

  if (!path) {
    return path;
  }

  if (!homeDir) {
    return false;
  }

  if (path === '~') {
    return homeDir;
  }

  if (path.slice(0, 2) !== '~/') {
    return path;
  }

  return join(homeDir, path.slice(2));
}

module.exports = expandHomeDir;
