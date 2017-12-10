#! /usr/bin/env node
const ask = require('./lib/ask');
const config = JSON.parse(JSON.stringify(require('./config.json')));
const run = require('./lib/run');
const checkEnvironment = require('./lib/check-environment');
const {
    directoryTree,
} = require('./lib/completer');

let directory = process.argv.slice(2)[0];

const init = async function init() {
    await checkEnvironment(['git', 'composer', 'php', 'npm']);
    if (!directory) {
        directory = await ask('Please enter project path: ', directoryTree);
    }

    await _cloneProject();
    await _composerInstall();
    await _npmInstall();
};

const _cloneProject = async function _cloneProject() {
    console.log('Cloning the project.');
    return run('git', ['clone', '-b', config.branch, config.repo, directory]);
};

const _composerInstall = async function _composerInstall() {
    console.log('Installing vendors.');
    process.chdir(directory);
    return run('composer', ['install']);
};

const _npmInstall = async function _npmInstall() {
    console.log('Installing node packages.');
    return run('npm', ['install']);
};

init();
