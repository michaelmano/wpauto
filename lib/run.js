'use strict';

var _require = require('child_process'),
    spawn = _require.spawn;

/**
 * Runs a command with the passed arguments or --version
 * @param {String} cmd the command that will be checked.
 * @param {Array} args the command that will be checked.
 * @return {Promise}
 */


var run = function run(cmd) {
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['--version'];

    return new Promise(function (resolve, reject) {
        var command = spawn(cmd, args, { cwd: process.cwd() });
        command.on('close', function (status) {
            if (status == 0) {
                resolve();
            }
        });
        command.on('error', function (error) {
            return reject(cmd);
        });
    });
};

module.exports = run;