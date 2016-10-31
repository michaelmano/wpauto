var Classes = Object.create(null);

var env     = {
  downloaded:  0
};

module.exports = {
  dbCheck: dbCheck,
  env    : env
}

Initiate();

function Initiate() {
  var fs  = require('fs');
  fs.readFile('./lib/logo.txt', (err, data) => {
    console.log('\x1b[36m' +  data + '\x1b[0m')
  });
  Download({url: 'https://api.wordpress.org/secret-key/1.1/salt/', extract: false});
  Download({url: 'https://wordpress.org/latest.zip'});
  dbCheck();
}

function dbCheck() {
  setTimeout(function(){
    CreateDatabase({user: 'root'});
  }, 50);
}

function Download(options) {
  var Download         = loadClass('Download');
  var DownloadConfig   = loadClass('DownloadConfig');
  return Download({config: new DownloadConfig(options)}, function(response) {
    env.downloaded++
  if(response !== '') {
    console.log(response);
  }
  });
}

function CreateDatabase(options) {
  var Database         = loadClass('Database');
  var DatabaseConfig   = loadClass('DatabaseConfig');
  return Database({config: new DatabaseConfig(options)}, function(response) {
    Prompt(response);
  });
}

function Prompt(options) {
  var Prompt  = loadClass('Prompt');
  return Prompt(options, function(response) {
    if(response.type === 'db') {
      CreateDatabase(response);
    }
    if(response.type === 'environment') {
      if( response.url !== '' ) {
        Download(response);
        var count = 3;
      } else {
        var count = 2;
      }
      (function DownloadCompleted() {
        if (env.downloaded===count)  {
          Environment(response);
        } else {
          setTimeout(
            DownloadCompleted, 1000);
        }
      })();
    }
  });
}

function Environment(options) {
  var Environment = loadClass('Environment');
  return Environment(options, function(response) {
    console.log(response);
  });
}

Object.defineProperty(exports, 'Types', {
  get: loadClass.bind(null, 'Types')
});

/**
 * Load the given class.
 * @param {string} className Name of class to default
 * @return {function|object} Class constructor or exports
 * @private
 */

function loadClass(className) {
  var Class = Classes[className];

  if (Class !== undefined) {
    return Class;
  }

  // This uses a switch for static require analysis
  switch (className) {
    case 'Initiate':
      Class   = require('./lib/Initiate');
      break;
    case 'Download':
      Class   = require('./lib/Download');
      break;
    case 'DownloadConfig':
        Class = require('./lib/DownloadConfig');
        break;
    case 'MySQL':
        Class = require('mysql');
        break;
    case 'Database':
        Class = require('./lib/Database');
        break;
    case 'DatabaseConfig':
        Class = require('./lib/DatabaseConfig');
        break;
    case 'Prompt':
        Class = require('./lib/Prompt');
        break;
    case 'Environment':
        Class = require('./lib/Environment');
        break;
    default:
      throw new Error('Cannot find class \'' + className + '\'');
  }

  // Store to prevent invoking require()
  Classes[className] = Class;

  return Class;
}

/**
 * Load the given class.
 * @param {string} className Name of class to default
 * @return {function|object} Class constructor or exports
 * @private
 */
