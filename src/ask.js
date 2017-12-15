import rl from 'readline';

/**
 * Prompts the user for input and returns the input as a Promise.
 * @param {Object} options
 * @param {String} defaultAnswer
 * @param {Function} completer
 * @param {Array} validation
 * @return {answer}
 */
const ask = function ask(options) {
    const question = typeof options === 'string' ? options : options.question;
    const defaultAnswer = options.default ? options.default : null;
    const validation = options.validation ? options.validation : null;
    const completer = options.completer ? options.completer : null;

    const write = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer,
    });

    return new Promise((resolve, reject) => {
        write.question(question + '\n', (answer) => {
            write.close();
            if (validation) {
                reject(answer);
            }
            resolve(answer);
        });
        write.write(defaultAnswer);
    });
};

export default ask;
