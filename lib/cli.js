var displayHelp, displayVersion, fs, path, popular;

path = require('path');

fs = require('fs');

popular = require(path.join(__dirname, '.', 'app'));

displayVersion = function() {
  var pkg;
  pkg = require(path.join(__dirname, '..', 'package.json'));
  return console.log(pkg.version);
};

displayHelp = function() {
  var doc, filepath;
  filepath = path.join(__dirname, '..', 'lang', 'help.txt');
  doc = fs.readFileSync(filepath, 'utf8');
  return console.log('\n' + doc + '\n');
};

module.exports = function(argv) {
  var flags;
  flags = {
    total: argv.total || argv.t ? true : false,
    month: argv.month || argv.m ? true : false
  };
  if (argv._.length > 0) {
    return popular(argv._[0], flags);
  }
  if (argv.version || argv.V) {
    return displayVersion();
  }
  if (argv.help || argv.h) {
    return displayHelp();
  }
  if (!argv._.length) {
    return displayHelp();
  }
};
