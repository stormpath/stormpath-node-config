function Config () {
}

Config.prototype.toString = function () {
  return JSON.stringify(this, null, 4);
};

module.exports = Config;