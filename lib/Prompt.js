var readline  = require('readline');
var question  = [];
var wpauto    = require('../index');
var path      = require('path');

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

module.exports = Prompt;
function Prompt(options, callback) {
  if ( options === 'environment' ) {
    rl.question('Prefix for tables (leave blank for wp_) : ', (prefix) => {
      rl.question('Custom theme URL (leave blank to skip) : ', (theme) => {
        rl.question('Where would you like Wordpress Extracted (leave blank for this directory) : ', (environment) => {
          wpauto.env['path']   = path.resolve(environment);
          wpauto.env['prefix'] = prefix;
          wpauto.env['prompt'] = 'complete';
          if(theme === '') {
            wpauto.env['themDL'] = false;
          } else {
            wpauto.env['themDL'] = true;
          }
          console.log('Please wait while we finish downloading and extracting files.');
          callback({
            type: 'environment',
            url:  theme,
            path: environment
          });
        });
      });
    });
  }
  if ( options === 'database' ) {
    rl.question('Database name : ', (database) => {
      wpauto.env['database'] = database;
      wpauto.env['user'] = 'root';
      callback({
        type: 'db',
        user: 'root',
        createDb: database
      });
    });
  }
  if ( options === 'all details required' ) {
    var config = [];
    console.log('leave blank for default settings (words in brackets)');
    rl.question('Host (localhost): ', (host) => {
      rl.question('Port (3306): ', (port) => {
        rl.question('Username (root): ', (user) => {
          rl.question('Password : ', (password) => {
            rl.question('Database name you wish to create : ', (database) => {
              var obj = {
                type: 'db',
              };

              if (host !== '' )     { obj['host'] = host; wpauto.env['host'] = host; } else {  obj['host'] = 'localhost'; wpauto.env['host'] = 'localhost'; }
              if (port !== '' )     { obj['port'] = port; wpauto.env['port'] = port; }
              if (user !== '' )     { obj['user'] = user; wpauto.env['user'] = user; } else {  obj['user'] = 'root'; wpauto.env['user'] = 'root'; }

              if (password !== '' ) { obj['password'] = password; wpauto.env['password'] = password; }
              if (database !== '' ) {

                obj['createDb']        = database;
                wpauto.env['database'] = database;

                callback (obj);
              } else { console.log('you must enter in a database name you wish to create.'); return wpauto();}
            });
          });
        });
      });
    });
  }
}
