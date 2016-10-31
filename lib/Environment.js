var Events      = require('events');
var Util        = require('util');
var fs          = require('fs');
var wpauto      = require('../index');
var path        = require('path');

module.exports  = Environment;
Util.inherits(Environment, Events.EventEmitter);
function Environment(options, callback) {
  Events.EventEmitter.call(this);
  this.cnf = {};
  this.cnf.password_here      = wpauto.env.password || '';
  this.cnf.username_here      = wpauto.env.user || 'root';
  this.cnf.database_name_here = wpauto.env.database;
  this.cnf.wp_                =  wpauto.env.prefix || 'wp_';
  if(wpauto.env.port && wpauto.env.port !== '') {
    this.cnf.localhost        = wpauto.env.host + ':' + wpauto.env.port || 'localhost:' + wpauto.env.port;
  } else {
    this.cnf.localhost        = wpauto.env.host || 'localhost';
  }
  fs.rename(path.resolve(wpauto.env.path + '/wp-config-sample.php'), path.resolve(wpauto.env.path + '/wp-config.php'), function(err) {
    if(err) {
      console.log(err)
    } else {
      setupSalts();
    }
  });
  function setupSalts() {
    fs.readFile(path.resolve(wpauto.env.path + '/wp-config.php'), 'utf8', function (err,data) {
      if (err) {  return console.log(err) }
      find = fs.readFileSync(path.resolve('./lib/old-salt'), 'utf8')
      replace = fs.readFileSync(path.resolve('./salt/salt'), 'utf8')
      var salts  = data.replace(find, replace)
      fs.writeFile(path.resolve(wpauto.env.path + '/wp-config.php'), salts, 'utf8', function (err) {
         if (err) return console.log(err);
         setupWpconfig();
      });
    });
  }
  function setupWpconfig() {
    fs.readFile(path.resolve(wpauto.env.path + '/wp-config.php'), 'utf8', function (err,data) {
      if (err)  return console.log(err);
      for(var k in cnf) {
        data = data.replace(k, cnf[k]);
      }
      fs.writeFile(path.resolve(wpauto.env.path + '/wp-config.php'), data, 'utf8', function (err) {
        if (err) { return console.log(err); }
        FindThemeFiles();
      });
    });
  }
  function FindThemeFiles() {
    if(wpauto.env.url === '') {
      Finish();
    } else {
      dir = wpauto.env.themedir;
      find(dir);
      function find(dir) {
        files_ = []
        var files = fs.readdirSync(dir);
        for (var i in files){
          var name = dir + '/' + files[i];
          if (fs.statSync(name).isDirectory()) {
            find(name,files_);
          } else {
            files_.push(name)
          }
        }
      }
      MoveTheme(files_);
    }
  }
  function MoveTheme(files_) {
    var files = files_;
    console.log(dir);
    for(var i in files) {
      if(path.basename(files[i]) === 'style.css') {
        console.log(files[i])
        cssDir = files[i].split(path.basename(files[i]));
        fs.rename(cssDir[0], wpauto.env.path + '/wp-content/themes/' + wpauto.env.themeFinal, function (err) {
          Finish();
        });
      }
    }
  }
  function Finish() {
    console.log('Completed');
    Cleanup('salt');
    Cleanup(wpauto.env.themedir);
    Cleanup('latest');
    // Cleanup('node_modules');
    // Cleanup('lib');
    // fs.unlink('index.js');
    // fs.unlink('README.md');
    // fs.unlink('changes.txt');
    // fs.unlink('package.json');
    process.exit()
  }
  function Cleanup(path) {
    if( fs.existsSync(path) ) {
      fs.readdirSync(path).forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.lstatSync(curPath).isDirectory()) {
          Cleanup(curPath);
        } else {
          fs.unlinkSync(curPath);
        }
      });
      fs.rmdirSync(path);
    }
  }
}
