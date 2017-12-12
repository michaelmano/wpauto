'use strict';

var fs = require('fs');

/**
 * Adds a tabbable Autocomplete for the user to find a directory.
 * @param {string} line
 * @return {string}
 */
var directoryTree = function directoryTree(line) {
    var strike = [];
    var currAddingDir = line.substr(line.lastIndexOf('/') + 1);
    var currAddedDir = line.indexOf('/') != -1 ? line.substring(0, line.lastIndexOf('/') + 1) : '';
    var path = process.cwd() + '/' + currAddedDir;
    var completions = fs.readdirSync(path);
    var hits = completions.filter(function (c) {
        return c.indexOf(currAddingDir) === 0;
    });

    if (hits.length === 1) strike.push(currAddedDir + hits[0] + '/');
    return strike.length ? [strike, line] : [hits.length ? hits : completions, line];
};

module.exports = {
    directoryTree: directoryTree
};