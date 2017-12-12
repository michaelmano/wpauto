'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var run = require('./run');

/**
 * Checks the environment to make sure all commands are available.
 * @param {Array} commands that will be checked.
 * @return {Promise}
 */
var checkEnvironment = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(commands) {
        var _this = this;

        var errors, promises;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        errors = [];
                        promises = commands.map(function (cmd) {
                            return new Promise(function () {
                                var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(resolve, reject) {
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

module.exports = checkEnvironment;