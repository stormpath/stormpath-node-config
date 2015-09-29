'use strict';

/**
 * Represents a parser that parses JSON strings.
 *
 * @func
 */
 module.exports = function JsonParser (text, callback) {
  try {
    var data = JSON.parse(text);
    callback(null, data);
  } catch (err) {
    callback(err);
  }
};