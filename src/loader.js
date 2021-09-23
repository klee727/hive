const glob = require('glob');
const path = require('path');

function getPlugins(dir, ext = '*.js') {
    const files = glob.sync(path.join(dir, ext), { cwd: __dirname });
    return files.map(file => require(file));
}

module.exports = { getPlugins }