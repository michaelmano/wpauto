var Events         = require('events');
var Util           = require('util');
var mysql          = require('mysql');
var Path           = require('path');

module.exports  = Database;
Util.inherits(Database, Events.EventEmitter);
function Database(options, callback) {

  Events.EventEmitter.call(this);

  var connection = mysql.createConnection(options.config.options);

  connection.connect(function(err, response) {
    if (!options.config.options.createDb || options.config.options.createDb === null ) {
      if (err) {
        callback('all details required');
      } else {
        callback('database');
      }
    } else {
      connection.query('CREATE DATABASE IF NOT EXISTS ' + options.config.options.createDb, function(err, result) {
        if(err) {
          console.log(err);
        } else {
          callback('environment');
        }
      });
    }
    connection.end();
  });
}
