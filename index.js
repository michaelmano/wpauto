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

const init = async function init() {
    await checkEnvironment(['git', 'composer', 'php', 'npm', 'mysql']);
    if (!directory) {
        directory = await ask('Please enter project path: ', directoryTree);
    }

    // Clone the project.
    await _cloneProject();
    // Download the new wordpress salts and put them into public/wp-config.php/
    _createSalts();
    // Wait for both composer and the env to be set up before moving on.
    Promise.all([
        // Install all required vendors.
        _composerInstall(),
        // Prompt the user for details regarding environment.
        _askForEnvDetails(),
    ]).then((data) => {
        // Create the database and .env file.
        _setupEnv(data[1]);
    });
    // Install all node packages.
    await _npmInstall();
};

const _cloneProject = async function _cloneProject() {
    console.log('Cloning the project.');
    return run('git', ['clone', '-b', config.branch, config.repo, directory]);
};

const _composerInstall = async function _composerInstall() {
    console.log('Installing vendors.');
    process.chdir(directory);
    return await run('composer', ['install']);
};

const _npmInstall = async function _npmInstall() {
    return run('npm', ['install']);
};

const _createSalts = async function _createSalts() {
    console.log('Setting up wp-config.php');
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
    const ENV = {
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

    return ENV;
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
};

init();
