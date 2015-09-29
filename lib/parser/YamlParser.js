'use strict';

var yaml = require('js-yaml');

/**
 * Represents a parser that parses YAML strings.
 *
 * @func
 */
module.exports = function YamlParser (text, callback) {
  try {
    var data = yaml.load(text);
    callback(null, data);
  } catch (err) {
    console.log(err.stack);
    callback(err);
  }
};