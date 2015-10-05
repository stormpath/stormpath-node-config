'use strict';

var common = require('../common');
var assert = common.assert;

describe('YamlParser', function () {
  var parse = require('../../lib/parser/YamlParser');

  it('should parse valid yaml without error', function (done) {
    var validJson = "---\n  abc: \"123\"\n  def:\n    - 3\n    - 1\n    - 2\n";
    parse(validJson, function (err, result) {
      assert.isNull(err);

      assert.isTrue(!!result);
      assert.isString(result.abc);
      assert.equal(result.abc, "123");
      assert.isArray(result.def);
      assert.sameMembers(result.def, [3, 1, 2]);

      done();
    });
  });

  it('should be able to parse empty config without error', function (done) {
    parse('', function (err, result) {
      assert.isNull(err);
      assert.isNull(result);
      done();
    });
  });

  it('should parse invalid yaml with error', function (done) {
    var invalidJson = ",---\n  abc: \"123\"\n  def:\n    - 3\n    - 1\n    - 2\n";
    parse(invalidJson, function (err, result) {
      assert.isUndefined(result);

      assert.isTrue(!!err);
      assert.isString(err.message);
      assert.equal(err.message, "end of the stream or a document separator is expected at line 1, column 1:\n    ,---\n    ^");

      done();
    });
  });
});
