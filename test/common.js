var chai = require('chai');
var temp = require('temp');

// Automatically clean up temp
// files after tests complete.
temp.track();

module.exports = {
  temp: temp,
  assert: chai.assert,
  should: chai.should()
};
