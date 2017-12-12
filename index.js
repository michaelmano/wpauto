#! /usr/bin/env node
const fs = require('fs');
const download = require('./lib/download');
const ask = require('./lib/ask');
const config = JSON.parse(JSON.stringify(require('./config.json')));
const run = require('./lib/run');
const checkEnvironment = require('./lib/check-environment');
const {
    directoryTree,
} = require('./lib/completer');

let directory = process.argv.slice(2)[0];
let themeInstalled = false;
let domain = null;

const init = async function init() {
    await checkEnvironment(['git', 'composer', 'php', 'npm']);
    if (!directory) {
        directory = await ask('Please enter project path: ', directoryTree);
    }
    await _cloneProject();
    process.chdir(directory);
    await ask(
        'Would you like to install the starter theme?',
        null,
        'true',
    ).then(async (answer) => {
        if (answer == 'true') {
            themeInstalled = !themeInstalled;
        } else {
            await _removeThemeFromComposer();
        }
    });
    _createSalts();
    Promise.all([
        _composerInstall(),
        _askForEnvDetails(),
    ]).then((data) => {
        _setupEnv(data[1]);
    });
    await _npmInstall();
    if (themeInstalled) {
        await _removeThemeFromComposer();
    }
    await _setupValet().then(() => {
        _removeGit();
        console.log(
            'CD into the project',
            `'cd ${directory}'`,
            `and run 'npm run watch' to begin.`,
        );
    });
};

const _cloneProject = async function _cloneProject() {
    console.log('Cloning the project.');
    return run('git', ['clone', '-b', config.branch, config.repo, directory]);
};

const _composerInstall = async function _composerInstall() {
    return await run('composer', ['install']);
};

const _npmInstall = async function _npmInstall() {
    return run('npm', ['install']);
};

const _createSalts = async function _createSalts() {
    const wpConfig = 'public/wp-config.php';
    const salts = await download('https://api.wordpress.org/secret-key/1.1/salt/');

    fs.readFile(wpConfig, 'utf8', (error, data) => {
        if (error) {
          return console.error(error);
        }
        let saltArray = salts.toString().split('\n');
        let lines = data.split('\r\n');

        for (let count = 0; count < saltArray.length; ++count) {
            lines[count+38] = saltArray[count];
        }
        fs.writeFile(wpConfig, lines.join('\r\n'), (error) => console.error);
    });
};

const _askForEnvDetails = async function _askForEnvDetails() {
    env = {
        WP_HOME: await ask('Please enter the site URL: ',
            null, `http://${directory}.dev`
        ),
        WP_DEFAULT_THEME: await ask('What would you like to name your theme?: ',
            null, directory
        ),
        DB_NAME: await ask('Database name: ',
            null, directory.replace(new RegExp('-', 'g'), '_')
        ),
        DB_USER: await ask('Database user: ',
            null, 'root'
        ),
        DB_PASSWORD: await ask('Database password: ',
            null, ''
        ),
        DB_HOST: await ask('Database host: ',
            null, 'localhost'
        ),
        DB_PREFIX: await ask('Database prefix: ',
            null, 'wp_'
        ),
        DB_CHARSET: await ask('Database charset: ',
            null, 'utf8mb4'
        ),
        DB_COLLATE: await ask('Database collate: ',
            null, 'utf8mb4_general_ci'
        ),
        WP_ENV: await ask('What is the environment: ',
            null, 'local'
        ),
        WP_DEBUG: await ask('Enable Debugging?: ',
            null, 'false'
        ),
    };

    return env;
};

const _setupEnv = function _setupEnv(env) {
    new Promise((resolve, reject) => {
        let file = '';
        let count = 0;
        Object.keys(env).forEach((key, index) => {
            count++;
            file += `${key}=${env[key]}\r\n`;
            if (count === Object.keys(env).length) resolve(file);
        });
    }).then((file) => {
        fs.writeFile('.env', file, (error) => console.error);
    });

    if (env.DB_HOST === 'localhost') {
        const query = `
            CREATE DATABASE ${env.DB_NAME}
            CHARACTER SET ${env.DB_CHARSET}
            COLLATE ${env.DB_COLLATE};`;

        run('mysql', [
            `-u${env.DB_USER}`,
            (env.DB_PASSWORD !== '' ? ` -p${env.DB_PASSWORD}` : ''),
            `-Bse ${query}`,
        ]);
    }
    if (env.WP_DEFAULT_THEME !== 'starter-theme') {
        fs.rename(
            'public/wp-content/themes/starter-theme',
            `public/wp-content/themes/${env.WP_DEFAULT_THEME}`,
            (error) => {
                if (error) throw error;
        });
    }
    fs.writeFile(
        'style.scss',
        `/*!\r\n * Theme Name: ${env.WP_DEFAULT_THEME}\r\n*/\r\n`,
        (error) => console.error
    );
    domain = _getHostName(env.WP_HOME);
};

const _removeThemeFromComposer = function _removeThemeFromComposer() {
    return new Promise((resolve, reject) => {
        fs.readFile('composer.json', 'utf8', (error, data) => {
            if (error) {
            return console.error(error);
            }
            data = JSON.parse(data);
            delete data.repositories[1];
            delete data.require['michaelmano/starter-theme'];
            fs.writeFile(
                'composer.json',
                JSON.stringify(data, null, 2),
                (error) => reject(error),
            );
            resolve();
        });
    });
};

const _setupValet = async function _setupValet() {
    const config = process.env.HOME + '/.valet/config.json';
    if (fs.existsSync(config)) {
        fs.readFile(config, 'utf8', (error, data) => {
            if (error) {
              return console.error(error);
            }
            const siteExists = JSON.parse(data).paths.every((path) => {
                return directory.indexOf(path) > -1;
            });

            if (!siteExists) {
                _addSiteToValet();
            }
        });
    }
};

const _addSiteToValet = async function _addSiteToValet() {
    process.chdir('public');
    console.log('Linking project with Laravel Valet.');
    return await run('valet', ['link', domain]);
};

const _getHostName = function _getHostName(url) {
    const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null &&
        match.length > 2 &&
        typeof match[2] === 'string'&&
        match[2].length > 0
    ) {
        return match[2].slice(0, match[2].lastIndexOf('.'));
    } else {
        return null;
    }
};

const _removeGit = async function _removeGit() {
    return (
        await run('rm', ['-rf', '.git']),
        await run('git', ['init', '../'])
    );
};

init();
