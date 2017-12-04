const directory = process.argv.slice(2)[0];
const ask = require('./ask');
const config = JSON.parse(JSON.stringify(require('../config.json')));
const run = require('./run');
const checkEnvironment = require('./check-environment');
const {
    directoryTree,
} = require('./completer');

const init = async function init() {
    await checkEnvironment(['git', 'composer', 'php', 'npm']);
    if (!directory) {
        ask('Please enter project path: ', directoryTree)
        .then((directory) => {
            return _clone(directory);
        });
    } else {
        return _clone(directory);
    }
};

/**
 * Private function clone will clone the repo in the specified directory.
 * @param {string} directory
 * @return {function}
 */
const _clone = function _clone(directory) {
    return run('git',
        ['clone', '-b', config.branch, config.repo, directory]
    );
};

module.exports = init;
