function managerEntries(entry = []) {
  return [...entry, require.resolve("./register")]; //👈 Addon implementation
}

module.exports = { managerEntries }
// module.exports = require('./dist/preset.js');
