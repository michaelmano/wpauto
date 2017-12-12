'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = _interopDefault(require('fs'));
var https = _interopDefault(require('https'));
var rl = _interopDefault(require('readline'));
var child_process = require('child_process');

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

/**
 * Checks the environment to make sure all commands are available.
 * @param {Array} commands that will be checked.
 * @return {Promise}
 */
var checkEnvironment = function () {
    var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(commands) {
        var _this = this;

        var errors, promises;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        errors = [];
                        promises = commands.map(function (cmd) {
                            return new Promise(function () {
                                var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
                                    return regeneratorRuntime.wrap(function _callee$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    _context.prev = 0;
                                                    _context.t0 = resolve;
                                                    _context.next = 4;
                                                    return run(cmd);

                                                case 4:
                                                    _context.t1 = _context.sent;
                                                    return _context.abrupt('return', (0, _context.t0)(_context.t1));

                                                case 8:
                                                    _context.prev = 8;
                                                    _context.t2 = _context['catch'](0);

                                                    errors.push(_context.t2);
                                                    return _context.abrupt('return', reject(_context.t2));

                                                case 12:
                                                case 'end':
                                                    return _context.stop();
                                            }
                                        }
                                    }, _callee, _this, [[0, 8]]);
                                }));

                                return function (_x2, _x3) {
                                    return _ref2.apply(this, arguments);
                                };
                            }());
                        });
                        return _context2.abrupt('return', Promise.all(promises).catch(function (error) {
                            var cmd = errors.toString().replace(/,([^,]*)$/, ' and $1');
                            console.log('Please make sure you have ' + cmd + ' installed.');
                            process.exit();
                        }));

                    case 3:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    function checkEnvironment(_x) {
        return _ref.apply(this, arguments);
    }

    return checkEnvironment;
}();

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

var directory = process.argv.slice(2)[0];
var themeInstalled = false;
var domain = null;

var init = function () {
    var _ref = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
        var _this = this;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return checkEnvironment(['git', 'composer', 'php', 'npm']);

                    case 2:
                        if (directory) {
                            _context2.next = 6;
                            break;
                        }

                        _context2.next = 5;
                        return ask('Please enter project path: ', directoryTree);

                    case 5:
                        directory = _context2.sent;

                    case 6:
                        _context2.next = 8;
                        return _cloneProject();

                    case 8:
                        process.chdir(directory);
                        _context2.next = 11;
                        return ask('Would you like to install the starter theme?', null, 'true').then(function () {
                            var _ref2 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(answer) {
                                return regeneratorRuntime.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                if (!(answer == 'true')) {
                                                    _context.next = 4;
                                                    break;
                                                }

                                                themeInstalled = !themeInstalled;
                                                _context.next = 6;
                                                break;

                                            case 4:
                                                _context.next = 6;
                                                return _removeThemeFromComposer();

                                            case 6:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, _this);
                            }));

                            return function (_x) {
                                return _ref2.apply(this, arguments);
                            };
                        }());

                    case 11:
                        _createSalts();
                        Promise.all([_composerInstall(), _askForEnvDetails()]).then(function (data) {
                            _setupEnv(data[1]);
                        });
                        _context2.next = 15;
                        return _npmInstall();

                    case 15:
                        if (!themeInstalled) {
                            _context2.next = 18;
                            break;
                        }

                        _context2.next = 18;
                        return _removeThemeFromComposer();

                    case 18:
                        _context2.next = 20;
                        return _setupValet().then(function () {
                            _removeGit();
                            console.log('CD into the project', '\'cd ' + directory + '\'', 'and run \'npm run watch\' to begin.');
                        });

                    case 20:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    function init() {
        return _ref.apply(this, arguments);
    }

    return init;
}();

var _cloneProject = function () {
    var _ref3 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        console.log('Cloning the project.');
                        return _context3.abrupt('return', run('git', ['clone', '-b', 'develop', 'git@github.com:michaelmano/wordpress.git', directory]));

                    case 2:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    function _cloneProject() {
        return _ref3.apply(this, arguments);
    }

    return _cloneProject;
}();

var _composerInstall = function () {
    var _ref4 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
        return regeneratorRuntime.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        _context4.next = 2;
                        return run('composer', ['install']);

                    case 2:
                        return _context4.abrupt('return', _context4.sent);

                    case 3:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    function _composerInstall() {
        return _ref4.apply(this, arguments);
    }

    return _composerInstall;
}();

var _npmInstall = function () {
    var _ref5 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
        return regeneratorRuntime.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        return _context5.abrupt('return', run('npm', ['install']));

                    case 1:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    function _npmInstall() {
        return _ref5.apply(this, arguments);
    }

    return _npmInstall;
}();

var _createSalts = function () {
    var _ref6 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6() {
        var wpConfig, salts;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
            while (1) {
                switch (_context6.prev = _context6.next) {
                    case 0:
                        wpConfig = 'public/wp-config.php';
                        _context6.next = 3;
                        return download('https://api.wordpress.org/secret-key/1.1/salt/');

                    case 3:
                        salts = _context6.sent;


                        fs.readFile(wpConfig, 'utf8', function (error, data) {
                            if (error) {
                                return console.error(error);
                            }
                            var saltArray = salts.toString().split('\n');
                            var lines = data.split('\r\n');

                            for (var count = 0; count < saltArray.length; ++count) {
                                lines[count + 38] = saltArray[count];
                            }
                            fs.writeFile(wpConfig, lines.join('\r\n'), function (error) {
                                return console.error;
                            });
                        });

                    case 5:
                    case 'end':
                        return _context6.stop();
                }
            }
        }, _callee6, this);
    }));

    function _createSalts() {
        return _ref6.apply(this, arguments);
    }

    return _createSalts;
}();

var _askForEnvDetails = function () {
    var _ref7 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7() {
        return regeneratorRuntime.wrap(function _callee7$(_context7) {
            while (1) {
                switch (_context7.prev = _context7.next) {
                    case 0:
                        _context7.next = 2;
                        return ask('Please enter the site URL: ', null, 'http://' + directory + '.dev');

                    case 2:
                        _context7.t0 = _context7.sent;
                        _context7.next = 5;
                        return ask('What would you like to name your theme?: ', null, directory);

                    case 5:
                        _context7.t1 = _context7.sent;
                        _context7.next = 8;
                        return ask('Database name: ', null, directory.replace(new RegExp('-', 'g'), '_'));

                    case 8:
                        _context7.t2 = _context7.sent;
                        _context7.next = 11;
                        return ask('Database user: ', null, 'root');

                    case 11:
                        _context7.t3 = _context7.sent;
                        _context7.next = 14;
                        return ask('Database password: ', null, '');

                    case 14:
                        _context7.t4 = _context7.sent;
                        _context7.next = 17;
                        return ask('Database host: ', null, 'localhost');

                    case 17:
                        _context7.t5 = _context7.sent;
                        _context7.next = 20;
                        return ask('Database prefix: ', null, 'wp_');

                    case 20:
                        _context7.t6 = _context7.sent;
                        _context7.next = 23;
                        return ask('Database charset: ', null, 'utf8mb4');

                    case 23:
                        _context7.t7 = _context7.sent;
                        _context7.next = 26;
                        return ask('Database collate: ', null, 'utf8mb4_general_ci');

                    case 26:
                        _context7.t8 = _context7.sent;
                        _context7.next = 29;
                        return ask('What is the environment: ', null, 'local');

                    case 29:
                        _context7.t9 = _context7.sent;
                        _context7.next = 32;
                        return ask('Enable Debugging?: ', null, 'false');

                    case 32:
                        _context7.t10 = _context7.sent;
                        env = {
                            WP_HOME: _context7.t0,
                            WP_DEFAULT_THEME: _context7.t1,
                            DB_NAME: _context7.t2,
                            DB_USER: _context7.t3,
                            DB_PASSWORD: _context7.t4,
                            DB_HOST: _context7.t5,
                            DB_PREFIX: _context7.t6,
                            DB_CHARSET: _context7.t7,
                            DB_COLLATE: _context7.t8,
                            WP_ENV: _context7.t9,
                            WP_DEBUG: _context7.t10
                        };
                        return _context7.abrupt('return', env);

                    case 35:
                    case 'end':
                        return _context7.stop();
                }
            }
        }, _callee7, this);
    }));

    function _askForEnvDetails() {
        return _ref7.apply(this, arguments);
    }

    return _askForEnvDetails;
}();

var _setupEnv = function _setupEnv(env) {
    new Promise(function (resolve, reject) {
        var file = '';
        var count = 0;
        Object.keys(env).forEach(function (key, index) {
            count++;
            file += key + '=' + env[key] + '\r\n';
            if (count === Object.keys(env).length) resolve(file);
        });
    }).then(function (file) {
        fs.writeFile('.env', file, function (error) {
            return console.error;
        });
    });

    if (env.DB_HOST === 'localhost') {
        var query = '\n            CREATE DATABASE ' + env.DB_NAME + '\n            CHARACTER SET ' + env.DB_CHARSET + '\n            COLLATE ' + env.DB_COLLATE + ';';

        run('mysql', ['-u' + env.DB_USER, env.DB_PASSWORD !== '' ? ' -p' + env.DB_PASSWORD : '', '-Bse ' + query]);
    }
    if (env.WP_DEFAULT_THEME !== 'starter-theme') {
        fs.rename('public/wp-content/themes/starter-theme', 'public/wp-content/themes/' + env.WP_DEFAULT_THEME, function (error) {
            if (error) throw error;
        });
    }
    fs.writeFile('style.scss', '/*!\r\n * Theme Name: ' + env.WP_DEFAULT_THEME + '\r\n*/\r\n', function (error) {
        return console.error;
    });
    domain = _getHostName(env.WP_HOME);
};

var _removeThemeFromComposer = function _removeThemeFromComposer() {
    return new Promise(function (resolve, reject) {
        fs.readFile('composer.json', 'utf8', function (error, data) {
            if (error) {
                return console.error(error);
            }
            data = JSON.parse(data);
            delete data.repositories[1];
            delete data.require['michaelmano/starter-theme'];
            fs.writeFile('composer.json', JSON.stringify(data, null, 2), function (error) {
                return reject(error);
            });
            resolve();
        });
    });
};

var _setupValet = function () {
    var _ref8 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8() {
        var config;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
            while (1) {
                switch (_context8.prev = _context8.next) {
                    case 0:
                        config = process.env.HOME + '/.valet/config.json';

                        if (fs.existsSync(config)) {
                            fs.readFile(config, 'utf8', function (error, data) {
                                if (error) {
                                    return console.error(error);
                                }
                                var siteExists = JSON.parse(data).paths.every(function (path) {
                                    return directory.indexOf(path) > -1;
                                });

                                if (!siteExists) {
                                    _addSiteToValet();
                                }
                            });
                        }

                    case 2:
                    case 'end':
                        return _context8.stop();
                }
            }
        }, _callee8, this);
    }));

    function _setupValet() {
        return _ref8.apply(this, arguments);
    }

    return _setupValet;
}();

var _addSiteToValet = function () {
    var _ref9 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9() {
        return regeneratorRuntime.wrap(function _callee9$(_context9) {
            while (1) {
                switch (_context9.prev = _context9.next) {
                    case 0:
                        process.chdir('public');
                        console.log('Linking project with Laravel Valet.');
                        _context9.next = 4;
                        return run('valet', ['link', domain]);

                    case 4:
                        return _context9.abrupt('return', _context9.sent);

                    case 5:
                    case 'end':
                        return _context9.stop();
                }
            }
        }, _callee9, this);
    }));

    function _addSiteToValet() {
        return _ref9.apply(this, arguments);
    }

    return _addSiteToValet;
}();

var _getHostName = function _getHostName(url) {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
        return match[2].slice(0, match[2].lastIndexOf('.'));
    } else {
        return null;
    }
};

var _removeGit = function () {
    var _ref10 = asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10() {
        return regeneratorRuntime.wrap(function _callee10$(_context10) {
            while (1) {
                switch (_context10.prev = _context10.next) {
                    case 0:
                        _context10.next = 2;
                        return run('rm', ['-rf', '.git']);

                    case 2:
                        _context10.next = 4;
                        return run('git', ['init', '../']);

                    case 4:
                        return _context10.abrupt('return', _context10.sent);

                    case 5:
                    case 'end':
                        return _context10.stop();
                }
            }
        }, _callee10, this);
    }));

    function _removeGit() {
        return _ref10.apply(this, arguments);
    }

    return _removeGit;
}();

init();
