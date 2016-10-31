var Events         = require('events');
var Util           = require('util');
var https          = require('https');
var fs             = require('fs');
var path           = require('path');
var wpauto         = require('../index');

module.exports = Download;

Util.inherits(Download, Events.EventEmitter);

function Download(options, callback) {
  Events.EventEmitter.call(this);
  try {
    fs.statSync(options.config.dirname);
    // Directory Exists.
    try {
      fs.statSync(options.config.filepath);
      // Directory and Files Exist.
    } catch(err) {
      // Directory Exists but the Files do not.
      return Initate(options);
    }
  } catch(err) {
    // Directory and Files do not exist. Lets create them.
    fs.mkdirSync(options.config.dirname);
    return Initate(options);
  }

  function Initate(options) {
    Events.EventEmitter.call(this);
    // Start downloading file and write it to the directory.
    var file      = fs.createWriteStream(options.config.filepath);
    var request   = https.get(options.config.url, function(response) {
      response.pipe(file);
      file.on('finish', function() {
        if ( options.config.extract === true ) {
          return Extract(options);
        } else {
          callback('');
        }
      });
    }).on('error', function(err) {
      // Delete the file if error.
      fs.unlink(options.config.filepath);
    });
  }

  function Extract(options) {
    Events.EventEmitter.call(this);
    (function waitForPrompt() {
       if (!wpauto.env.prompt && wpauto.env.prompt !== 'complete' ) {
      setTimeout(waitForPrompt, 1000);
      } else {
        var AdmZip  = require('adm-zip');
        var zip = new AdmZip(options.config.filepath);
        if (options.config.url === 'https://wordpress.org/latest.zip') {
          extDir = path.resolve(wpauto.env.path);
          zip.extractEntryTo('wordpress/',extDir,false,true);
        } else {
          zip.extractAllTo(options.config.dirname, true);
        }
        callback('Extracted ' + options.config.filename);
      }
    })();
  }
}
