const rl = require('readline');

/**
 * Prompts the user for input and returns the input as a Promise.
 * @param {string} question
 * @param {function} completer
 * @param {string} defaultAnswer
 * @return {answer}
 */
const ask = function ask(question, completer = null, defaultAnswer = null) {
    const write = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer,
    });

    return new Promise((resolve, _) => {
        write.question(question + '\n', (answer) => {
            write.close();
            resolve(answer);
        });
        write.write(defaultAnswer);
    });
};

module.exports = ask;
