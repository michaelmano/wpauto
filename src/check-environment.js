import run from './run';

/**
 * Checks the environment to make sure all commands are available.
 * @param {Array} commands that will be checked.
 * @return {Promise}
 */
const checkEnvironment = async function checkEnvironment(commands) {
    let errors = [];
    const promises = commands.map((cmd) => {
        return new Promise(async (resolve, reject) => {
            try {
                return resolve(await run(cmd));
            } catch (error) {
                errors.push(error);
                return reject(error);
            }
        });
    });
    return Promise.all(promises).catch((error) => {
        let cmd = errors.toString().replace(/,([^,]*)$/, ' and $1');
        console.log(`Please make sure you have ${cmd} installed.`);
        process.exit();
    });
};

export default checkEnvironment;
