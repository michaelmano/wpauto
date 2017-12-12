const {
    spawn,
} = require('child_process');

/**
 * Runs a command with the passed arguments or --version
 * @param {String} cmd the command that will be checked.
 * @param {Array} args the command that will be checked.
 * @return {Promise}
 */
const run = function run(cmd, args = ['--version']) {
    return new Promise((resolve, reject) => {
        const command = spawn(cmd, args, {cwd: process.cwd()});
        command.on('close', function(status) {
            if (status == 0) {
                resolve();
            }
        });
        command.on('error', (error) => {
            return reject(cmd);
        });
    });
};

module.exports = run;
