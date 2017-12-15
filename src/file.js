import fs from 'fs';
import promisify from 'util.promisify';

const readFile = promisify(fs.readFile);

const writeFile = promisify(fs.writeFile);

const renameFile = promisify(fs.rename);

const fileExists = fs.existsSync;

export {
    readFile,
    writeFile,
    renameFile,
    fileExists,
};
