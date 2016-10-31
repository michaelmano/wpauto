var Events      = require('events');
var Util        = require('util');
var url         = require('url');
var path        = require('path');
var wpauto      = require('../index');


module.exports  = DownloadConfig;

Util.inherits(DownloadConfig, Events.EventEmitter);

function DownloadConfig(options) {
  // Catch and set options
  Events.EventEmitter.call(this);
  this.options            = options;
  this.raw                = this.options.url || 'https://wordpress.org/latest.zip';
  this.parsed             = url.parse(this.raw);
  this.filename           = path.basename(this.parsed.pathname);
  this.parts              = this.filename.split(".");
  if ( this.parts[1] === 'zip' || this.parts[1] === 'tar' || this.parts[1] === 'gz' || this.options.extract === true ) {
    this.extract          = true;
  }
  this.protocol           = 'https://';
  this.url                = this.protocol + this.parsed.host + this.parsed.pathname;
  this.dirname            = path.resolve(path.join(__dirname, '../' + this.parts[0] + '/'));
  this.filepath           = this.dirname + '/' + this.filename;
  if (this.dirname !== 'latest' || this.filepath !== 'salt') {
    wpauto.env['themedir'] = this.dirname;
    wpauto.env['themeFinal']  = this.parts[0];
  }
}
