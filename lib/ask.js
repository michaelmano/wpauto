const rl = require('readline');

/**
 * Prompts the user for input and returns the input as a Promise.
 * @param {string} question
 * @param {function} completer
 * @return {answer}
 */
const ask = function ask(question, completer = null) {
    const write = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer,
    });

    return new Promise((resolve, _) => {
        write.question(question + '\n', function(answer) {
            write.close();
            resolve(answer);
        });
    });
};

module.exports = ask;
