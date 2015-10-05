var temp = require('temp');
var chai = require('chai');

// Automatically clean up temp
// files after tests complete.
temp.track();

module.exports = {
  _: require('lodash'),
  assert: chai.assert,
  temp: temp
};
