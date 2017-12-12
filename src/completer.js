import fs from 'fs';

/**
 * Adds a tabbable Autocomplete for the user to find a directory.
 * @param {string} line
 * @return {string}
 */
const directoryTree = function directoryTree(line) {
    let strike = [];
    const currAddingDir = line.substr(line.lastIndexOf('/') + 1);
    const currAddedDir = (line.indexOf('/') != - 1)
        ? line.substring(0, line.lastIndexOf('/') + 1)
        : '';
    const path = process.cwd() + '/' + currAddedDir;
    const completions = fs.readdirSync(path);
    const hits = completions.filter(function(c) {
        return c.indexOf(currAddingDir) === 0;
    });

    if (hits.length === 1) strike.push(currAddedDir + hits[0] + '/');
    return (strike.length)
        ? [strike, line]
        : [hits.length ? hits : completions, line];
};

export {
    directoryTree,
};
