const path = require('path');
const fs = require('fs');
const pkg = require('../package.json');
const popular = require('./app');

const helpFile = path.join(__dirname, '..', 'lang', 'help.txt');
const doc = fs.readFileSync(helpFile, 'utf8');

// output version number of app
const displayVersion = () => console.log(pkg.version);

// output help documentation of app
const displayHelp = () => console.log(`\n${doc}\n`);

module.exports = (argv) => {
  // flags we care about for app operation
  const flags = {
    total: !!(argv.total || argv.t),
    month: !!(argv.month || argv.m),
    noColor: !!(argv.noColor || argv.n),
  };

  // args passed
  if (argv._.length > 0) {
    return popular(argv._[0], flags);
  }

  // --version
  if (argv.version || argv.V) {
    return displayVersion();
  }

  // --help
  if (argv.help || argv.h) {
    return displayHelp();
  }

  // no args so display help
  return displayHelp();
};
