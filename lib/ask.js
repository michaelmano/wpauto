'use strict';

var rl = require('readline');

/**
 * Prompts the user for input and returns the input as a Promise.
 * @param {string} question
 * @param {function} completer
 * @param {string} defaultAnswer
 * @return {answer}
 */
var ask = function ask(question) {
    var completer = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var defaultAnswer = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    var write = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer
    });

    return new Promise(function (resolve, _) {
        write.question(question + '\n', function (answer) {
            write.close();
            resolve(answer);
        });
        write.write(defaultAnswer);
    });
};

module.exports = ask;