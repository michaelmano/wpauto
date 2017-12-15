'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var child_process = require('child_process');
var rl = _interopDefault(require('readline'));
var https = _interopDefault(require('https'));
var fs = _interopDefault(require('fs'));
var promisify = _interopDefault(require('util.promisify'));

/**
 * Runs a command with the passed arguments or --version
 * @param {String} cmd the command that will be checked.
 * @param {Array} args the command that will be checked.
 * @return {Promise}
 */
var run = function run(cmd) {
    var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['--version'];

    return new Promise(function (resolve, reject) {
        var command = child_process.spawn(cmd, args, { cwd: process.cwd() });
        command.on('close', function (status) {
            if (status == 0) {
                resolve();
            }
        });
        command.on('error', function (error) {
            return reject(cmd);
        });
    });
};

/**
 * Prompts the user for input and returns the input as a Promise.
 * @param {Object} options
 * @param {String} defaultAnswer
 * @param {Function} completer
 * @param {Array} validation
 * @return {answer}
 */
var ask = function ask(options) {
    var question = typeof options === 'string' ? options : options.question;
    var defaultAnswer = options.default ? options.default : null;
    var validation = options.validation ? options.validation : null;
    var completer = options.completer ? options.completer : null;

    var write = rl.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completer
    });

    return new Promise(function (resolve, reject) {
        write.question(question + '\n', function (answer) {
            write.close();
            if (validation) {
                reject(answer);
            }
            resolve(answer);
        });
        write.write(defaultAnswer);
    });
};

/**
 * Downloads the requested url and returns it as a string.
 * @param {string} url
 * @return {promise}
 */
var download = function download(url) {
    return new Promise(function (resolve, reject) {
        https.get(url, function (res) {
            res.on('data', function (data) {
                return resolve(data);
            });
        }).on('error', function (error) {
            reject(error);
        });
    });
};

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

var readFile = promisify(fs.readFile);

var writeFile = promisify(fs.writeFile);

var renameFile = promisify(fs.rename);

var fileExists = fs.existsSync;

var asyncToGenerator = function (fn) {
  return function () {
    var gen = fn.apply(this, arguments);
    return new Promise(function (resolve, reject) {
      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          return Promise.resolve(value).then(function (value) {
            step("next", value);
          }, function (err) {
            step("throw", err);
          });
        }
      }

      return step("next");
    });
  };
};

var init = function () {
    var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var config, valet;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return checkRequirements(['git', 'composer', 'php', 'npm']);

                    case 2:
                        _context.next = 4;
                        return setup();

                    case 4:
                        config = _context.sent;

                        console.log('\r\n\r\n', '* Now installing required node packages', 'and composer vendors.');
                        _context.next = 8;
                        return valetExists(config.directory);

                    case 8:
                        valet = _context.sent;
                        _context.next = 11;
                        return cloneProject(config.directory);

                    case 11:
                        _context.prev = 11;
                        _context.next = 14;
                        return process.chdir(config.directory);

                    case 14:
                        _context.next = 19;
                        break;

                    case 16:
                        _context.prev = 16;
                        _context.t0 = _context['catch'](11);
                        throw _context.t0;

                    case 19:
                        if (!(config.theme !== 'yes')) {
                            _context.next = 22;
                            break;
                        }

                        _context.next = 22;
                        return removeThemeFromComposer();

                    case 22:
                        createSalts();
                        _context.next = 25;
                        return run('npm', ['install']);

                    case 25:
                        _context.next = 27;
                        return run('composer', ['install']);

                    case 27:
                        setupEnv(config.env);

                        if (!config.theme) {
                            _context.next = 31;
                            break;
                        }

                        _context.next = 31;
                        return removeThemeFromComposer();

                    case 31:
                        _context.next = 33;
                        return run('rm', ['-rf', '.git']);

                    case 33:
                        _context.next = 35;
                        return run('git', ['init', '../']);

                    case 35:
                        if (!(valet !== null || valet !== true)) {
                            _context.next = 49;
                            break;
                        }

                        console.log('Now running valet link and secure.');
                        _context.prev = 37;
                        _context.next = 40;
                        return process.chdir('public');

                    case 40:
                        _context.next = 45;
                        break;

                    case 42:
                        _context.prev = 42;
                        _context.t1 = _context['catch'](37);
                        throw _context.t1;

                    case 45:
                        _context.next = 47;
                        return run('valet', ['link', config.directory]);

                    case 47:
                        _context.next = 49;
                        return run('valet', ['secure']);

                    case 49:
                        console.log('CD into the project', '\'cd ' + config.directory + '\'', 'and run \'npm run watch\' to begin.');
                        process.exit();

                    case 51:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this, [[11, 16], [37, 42]]);
    }));

    function init() {
        return _ref.apply(this, arguments);
    }

    return init;
}();

var checkRequirements = function checkRequirements(requirements) {
    return Promise.all(requirements.map(function (requirement) {
        return run(requirement);
    }));
};

var setup = function () {
    var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var directory, theme, env, config;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        if (!process.argv.slice(2)[0]) {
                            _context2.next = 4;
                            break;
                        }

                        _context2.t0 = process.argv.slice(2)[0];
                        _context2.next = 7;
                        break;

                    case 4:
                        _context2.next = 6;
                        return ask({
                            question: 'Please enter project path: ',
                            completer: directoryTree
                        });

                    case 6:
                        _context2.t0 = _context2.sent;

                    case 7:
                        directory = _context2.t0;
                        _context2.next = 10;
                        return ask({
                            question: 'Would you like to install the starter theme?',
                            default: 'yes'
                        });

                    case 10:
                        theme = _context2.sent;
                        _context2.next = 13;
                        return ask({
                            question: 'Please enter the site URL: ',
                            default: 'https://' + directory + '.dev'
                        });

                    case 13:
                        _context2.t1 = _context2.sent;
                        _context2.next = 16;
                        return ask({
                            question: 'What would you like to name your theme?: ',
                            default: directory
                        });

                    case 16:
                        _context2.t2 = _context2.sent;
                        _context2.next = 19;
                        return ask({
                            question: 'Database name: ',
                            default: directory.replace(new RegExp('-', 'g'), '_')
                        });

                    case 19:
                        _context2.t3 = _context2.sent;
                        _context2.next = 22;
                        return ask({
                            question: 'Database user: ',
                            default: 'root'
                        });

                    case 22:
                        _context2.t4 = _context2.sent;
                        _context2.next = 25;
                        return ask({
                            question: 'Database password: ',
                            default: ''
                        });

                    case 25:
                        _context2.t5 = _context2.sent;
                        _context2.next = 28;
                        return ask({
                            question: 'Database host: ',
                            default: 'localhost'
                        });

                    case 28:
                        _context2.t6 = _context2.sent;
                        _context2.next = 31;
                        return ask({
                            question: 'Database prefix: ',
                            default: 'wp_'
                        });

                    case 31:
                        _context2.t7 = _context2.sent;
                        _context2.next = 34;
                        return ask({
                            question: 'Database charset: ',
                            default: 'utf8mb4'
                        });

                    case 34:
                        _context2.t8 = _context2.sent;
                        _context2.next = 37;
                        return ask({
                            question: 'Database collate: ',
                            default: 'utf8mb4_general_ci'
                        });

                    case 37:
                        _context2.t9 = _context2.sent;
                        _context2.next = 40;
                        return ask({
                            question: 'What is the environment: ',
                            default: 'local'
                        });

                    case 40:
                        _context2.t10 = _context2.sent;
                        _context2.next = 43;
                        return ask({
                            question: 'Enable Debugging?: ',
                            default: 'false'
                        });

                    case 43:
                        _context2.t11 = _context2.sent;
                        env = {
                            WP_HOME: _context2.t1,
                            WP_DEFAULT_THEME: _context2.t2,
                            DB_NAME: _context2.t3,
                            DB_USER: _context2.t4,
                            DB_PASSWORD: _context2.t5,
                            DB_HOST: _context2.t6,
                            DB_PREFIX: _context2.t7,
                            DB_CHARSET: _context2.t8,
                            DB_COLLATE: _context2.t9,
                            WP_ENV: _context2.t10,
                            WP_DEBUG: _context2.t11
                        };
                        config = {
                            directory: directory,
                            theme: theme,
                            env: env
                        };
                        return _context2.abrupt('return', config);

                    case 47:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    function setup() {
        return _ref2.apply(this, arguments);
    }

    return setup;
}();

var cloneProject = function cloneProject(directory) {
    return run('git', ['clone', '-b', 'develop', 'git@github.com:michaelmano/wordpress.git', directory]);
};

var createSalts = function () {
    var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        var wpConfig, salts, newConfig;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        wpConfig = 'public/wp-config.php';
                        salts = null;
                        newConfig = null;
                        _context3.prev = 3;
                        _context3.next = 6;
                        return download('https://api.wordpress.org/secret-key/1.1/salt/').then(function (data) {
                            return data.toString().split('\n');
                        }).catch(function (error) {
                            throw error;
                        });

                    case 6:
                        salts = _context3.sent;
                        _context3.next = 12;
                        break;

                    case 9:
                        _context3.prev = 9;
                        _context3.t0 = _context3['catch'](3);
                        throw _context3.t0;

                    case 12:
                        _context3.prev = 12;
                        _context3.next = 15;
                        return readFile(wpConfig, { encoding: 'utf8' }).then(function (data) {
                            data = data.split('\r\n');
                            for (var count = 0; count < salts.length; ++count) {
                                data[count + 38] = salts[count];
                                if (count === salts.length) {
                                    return data;
                                }
                            }
                        });

                    case 15:
                        newConfig = _context3.sent;
                        _context3.next = 21;
                        break;

                    case 18:
                        _context3.prev = 18;
                        _context3.t1 = _context3['catch'](12);
                        throw _context3.t1;

                    case 21:
                        _context3.prev = 21;
                        _context3.next = 24;
                        return writeFile(wpConfig, newConfig);

                    case 24:
                        _context3.next = 29;
                        break;

                    case 26:
                        _context3.prev = 26;
                        _context3.t2 = _context3['catch'](21);
                        throw _context3.t2;

                    case 29:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this, [[3, 9], [12, 18], [21, 26]]);
    }));

    function createSalts() {
        return _ref3.apply(this, arguments);
    }

    return createSalts;
}();

var removeThemeFromComposer = function () {
    var _ref4 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        var composerData;
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        composerData = null;
                        _context4.prev = 1;
                        _context4.next = 4;
                        return readFile('composer.json', { encoding: 'utf8' }).then(function (data) {
                            data = JSON.parse(data);
                            delete data.repositories[1];
                            delete data.require['michaelmano/starter-theme'];
                            return data;
                        });

                    case 4:
                        composerData = _context4.sent;
                        _context4.next = 10;
                        break;

                    case 7:
                        _context4.prev = 7;
                        _context4.t0 = _context4['catch'](1);
                        throw _context4.t0;

                    case 10:
                        _context4.prev = 10;
                        _context4.next = 13;
                        return writeFile('composer.json', JSON.stringify(composerData, null, 2));

                    case 13:
                        _context4.next = 18;
                        break;

                    case 15:
                        _context4.prev = 15;
                        _context4.t1 = _context4['catch'](10);
                        throw _context4.t1;

                    case 18:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this, [[1, 7], [10, 15]]);
    }));

    function removeThemeFromComposer() {
        return _ref4.apply(this, arguments);
    }

    return removeThemeFromComposer;
}();

var setupEnv = function () {
    var _ref5 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(env) {
        var _this = this;

        var file, count, query;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        file = '';
                        count = 0;

                        Object.keys(env).forEach(function () {
                            var _ref6 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(key, index) {
                                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                                    while (1) {
                                        switch (_context5.prev = _context5.next) {
                                            case 0:
                                                count++;
                                                file += key + '=' + env[key] + '\r\n';

                                                if (!(count === Object.keys(env).length)) {
                                                    _context5.next = 11;
                                                    break;
                                                }

                                                _context5.prev = 3;
                                                _context5.next = 6;
                                                return writeFile('.env', file);

                                            case 6:
                                                _context5.next = 11;
                                                break;

                                            case 8:
                                                _context5.prev = 8;
                                                _context5.t0 = _context5['catch'](3);
                                                throw _context5.t0;

                                            case 11:
                                            case 'end':
                                                return _context5.stop();
                                        }
                                    }
                                }, _callee5, _this, [[3, 8]]);
                            }));

                            return function (_x2, _x3) {
                                return _ref6.apply(this, arguments);
                            };
                        }());

                        if (env.DB_HOST === 'localhost') {
                            query = '\n            CREATE DATABASE ' + env.DB_NAME + '\n            CHARACTER SET ' + env.DB_CHARSET + '\n            COLLATE ' + env.DB_COLLATE + ';';


                            run('mysql', ['-u' + env.DB_USER, env.DB_PASSWORD !== '' ? ' -p' + env.DB_PASSWORD : '', '-Bse ' + query]);
                        }

                        if (!(env.WP_DEFAULT_THEME !== 'starter-theme')) {
                            _context6.next = 13;
                            break;
                        }

                        _context6.prev = 5;

                        renameFile('public/wp-content/themes/starter-theme', 'public/wp-content/themes/' + env.WP_DEFAULT_THEME);
                        _context6.next = 12;
                        break;

                    case 9:
                        _context6.prev = 9;
                        _context6.t0 = _context6['catch'](5);
                        throw _context6.t0;

                    case 12:
                        ;

                    case 13:
                        _context6.prev = 13;
                        _context6.next = 16;
                        return writeFile('style.scss', '/*!\r\n * Theme Name: ' + env.WP_DEFAULT_THEME + '\r\n*/\r\n');

                    case 16:
                        _context6.next = 21;
                        break;

                    case 18:
                        _context6.prev = 18;
                        _context6.t1 = _context6['catch'](13);
                        throw _context6.t1;

                    case 21:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this, [[5, 9], [13, 18]]);
    }));

    function setupEnv(_x) {
        return _ref5.apply(this, arguments);
    }

    return setupEnv;
}();

var valetExists = function () {
    var _ref7 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(directory) {
        var config;
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        config = process.env.HOME + '/.valet/config.json';
                        _context7.prev = 1;
                        _context7.next = 4;
                        return readFile(config).then(function (data) {
                            return JSON.parse(data).paths.every(function (path) {
                                return directory.indexOf(path) > -1;
                            });
                        });

                    case 4:
                        return _context7.abrupt('return', _context7.sent);

                    case 7:
                        _context7.prev = 7;
                        _context7.t0 = _context7['catch'](1);
                        return _context7.abrupt('return', null);

                    case 10:
                        return _context7.abrupt('return', false);

                    case 11:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this, [[1, 7]]);
    }));

    function valetExists(_x4) {
        return _ref7.apply(this, arguments);
    }

    return valetExists;
}();

init();
