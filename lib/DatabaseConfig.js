var Events      = require('events');
var Util        = require('util');

module.exports  = DatabaseConfig;
Util.inherits(DatabaseConfig, Events.EventEmitter);
function DatabaseConfig(options) {
  // Catch and set options
  Events.EventEmitter.call(this);
  this.options  = options;
  // Get name vars from options.
  this.host               = this.options.host       || 'localhost';
  this.user               = this.options.user       || 'root';
  this.password           = this.options.password   || '';
  this.port               = this.options.port       || '3306';
  this.database           = this.options.database   || '';
  this.createDb           = this.options.createDb   || null;
}
