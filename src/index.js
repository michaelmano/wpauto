import run from './run';
import ask from './ask';
import download from './download';
import {
    directoryTree,
} from './completer';
import {
    readFile,
    writeFile,
    renameFile,
} from './file';

const init = async function init() {
    await checkRequirements(['git', 'composer', 'php', 'npm']);
    const config = await setup();
    const valet = await valetExists(config.directory);
    await cloneProject(config.directory);
    try {
        await process.chdir(config.directory);
    } catch (error) {
        throw (error);
    }
    if (config.theme !== 'yes') {
        await removeThemeFromComposer();
    }
    await setupWpConfig();
    await installPackages();
    setupEnv(config.env);
    if (config.theme) {
        await removeThemeFromComposer();
    }
    await run('rm', ['-rf', '.git', 'composer.lock', 'package-lock.json']);
    await run('git', ['init', '.']);
    await run('git', ['add', '.']);
    await run('git', ['commit', '-m "Initial Commit."']);
    if (valet !== null || valet !== true) {
        console.log('Now running valet link.');
        try {
            await process.chdir('public');
        } catch (error) {
            throw (error);
        }
        await run('valet', [
            'link',
            config.foldername,
        ]);
    }
    console.log(
        'CD into the project',
        `'cd ${config.directory}'`,
        `and run 'npm run watch' to begin.`,
    );
    process.exit();
};

const checkRequirements = function checkRequirements(requirements) {
    return Promise.all(
        requirements.map((requirement) => {
            return run(requirement);
        })
    );
};

const setup = async function setup() {
    const directory = process.argv.slice(2)[0]
        ? process.argv.slice(2)[0]
        : await ask({
            question: 'Please enter project path: ',
            completer: directoryTree,
        });

    const foldername = directory.match(/([^\/]*)\/*$/)[1];

    const theme = await ask({
        question: 'Would you like to install the starter theme?',
        default: 'yes',
    });

    const env = {
        WP_HOME: await ask({
            question: 'Please enter the site URL: ',
            default: `http://${foldername}.test`,
        }),
        WP_DEFAULT_THEME: await ask({
            question: 'What would you like to name your theme?: ',
            default: foldername,
        }),
        DB_NAME: await ask({
            question: 'Database name: ',
            default: foldername.replace(new RegExp('-', 'g'), '_'),
        }),
        DB_USER: await ask({
            question: 'Database user: ',
            default: 'root',
        }),
        DB_PASSWORD: await ask({
            question: 'Database password: ',
            default: '',
        }),
        DB_HOST: await ask({
            question: 'Database host: ',
            default: 'localhost',
        }),
        DB_PREFIX: await ask({
            question: 'Database prefix: ',
            default: 'wp_',
        }),
        DB_CHARSET: await ask({
            question: 'Database charset: ',
            default: 'utf8mb4',
        }),
        DB_COLLATE: await ask({
            question: 'Database collate: ',
            default: 'utf8mb4_general_ci',
        }),
        WP_ENV: await ask({
            question: 'What is the environment: ',
            default: 'local',
        }),
        WP_DEBUG: await ask({
            question: 'Enable Debugging?: ',
            default: 'false',
        }),
    };

    const config = {
        directory,
        foldername,
        theme,
        env,
    };

    return config;
};

const cloneProject = function cloneProject(directory) {
    return run('git', [
        'clone',
        '-b',
        'develop',
        'git@github.com:michaelmano/wordpress.git',
        directory,
    ]);
};

const downloadSalts = function downloadSalts() {
    return new Promise(async (resolve, reject) => {
        try {
            await download('https://api.wordpress.org/secret-key/1.1/salt/')
                .then((data) => {
                    return resolve(data.toString().split('\n'));
                });
        } catch (error) {
            reject(error);
            throw error;
        }
    });
};

const setupWpConfig = async function setupWpConfig() {
    return new Promise(async (resolve, reject) => {
        try {
            await readFile('public/wp-config.php', {encoding: 'utf8'})
            .then(async (data) => {
                let salts = await downloadSalts();
                data = data.split('\r\n');
                for (let count = 0; count < salts.length; ++count) {
                    data[count+38] = salts[count];
                    if (count === salts.length-1) {
                        await writeFile('public/wp-config.php', data.join('\r\n'));
                        resolve();
                    }
                }
            });
        } catch (error) {
            reject(error);
            throw error;
        }
    });
};

const installPackages = function installPackages() {
    return new Promise((resolve, reject) => {
        console.log('Now Installing composer and node packages.');
        Promise.all([
            run('npm', ['install']),
            run('composer', ['install']),
        ]).then(() => {
            resolve();
        }).catch((error) => {
            reject(error);
        });
    });
};

const removeThemeFromComposer = async function removeThemeFromComposer() {
    let composerData = null;
    try {
        composerData = await readFile('composer.json', {encoding: 'utf8'})
        .then((data) => {
            data = JSON.parse(data);
            data.repositories = data.repositories.filter(
                (repository, index) => {
                    return index !== 1;
                });
            delete data.require['michaelmano/starter-theme'];
            return data;
        });
    } catch (error) {
        throw (error);
    }
    try {
        await writeFile('composer.json', JSON.stringify(composerData, null, 2));
    } catch (error) {
        throw (error);
    }
};

const setupEnv = async function setupEnv(env) {
    let file = '';
    let count = 0;
    Object.keys(env).forEach(async (key, index) => {
        count++;
        file += `${key}=${env[key]}\r\n`;
        if (count === Object.keys(env).length) {
            try {
                await writeFile('.env', file);
            } catch (error) {
                throw (error);
            }
        }
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
        try {
            renameFile(
                'public/wp-content/themes/starter-theme',
                `public/wp-content/themes/${env.WP_DEFAULT_THEME}`
            );
        } catch (error) {
            throw (error);
        };
    }
    try {
        await writeFile(
            'style.scss',
            `/*!\r\n * Theme Name: ${env.WP_DEFAULT_THEME}\r\n*/\r\n`
        );
    } catch (error) {
        throw (error);
    }
};

const valetExists = async function valetExists(directory) {
    const config = process.env.HOME + '/.valet/config.json';
    try {
        return await readFile(config).then((data) => {
            return JSON.parse(data).paths.every((path) => {
                return directory.indexOf(path) > -1;
            });
        });
    } catch (error) {
        return null;
    }

    return false;
};

init();
