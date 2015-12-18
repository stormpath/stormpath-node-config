var _ = require('lodash');
var temp = require('temp');
var chai = require('chai');
var sinon = require('sinon');

var strings = require('../lib/strings');

// Automatically clean up temp
// files after tests complete.
temp.track();

module.exports = {
  _: _,
  assert: chai.assert,
  sinon: sinon,
  temp: temp,
  strings: strings
};
