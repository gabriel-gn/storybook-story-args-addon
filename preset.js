function config(entry = []) {
  return [...entry, require.resolve("./dist/esm/preset.js")];
}

function managerEntries(entry = []) {
  return [...entry, require.resolve('./dist/esm/register')];
}

module.exports = {
  managerEntries,
  config,
};
// module.exports = require('./dist/preset.js');
