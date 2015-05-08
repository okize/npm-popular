# modules
path = require('path')
fs = require('fs')
popular = require(path.join(__dirname, '.', 'app'))

# output version number of app
displayVersion = ->

  pkg = require(path.join(__dirname, '..', 'package.json'))
  console.log pkg.version

# output help documentation of app
displayHelp = ->

  filepath = path.join(__dirname, '..', 'lang', 'help.txt')
  doc = fs.readFileSync(filepath, 'utf8')
  console.log '\n' + doc + '\n'

module.exports = (argv) ->

  # flags we care about for app operation
  flags =
    total: if argv.total or argv.t then true else false
    month: if argv.month or argv.m then true else false
    noColor: if argv.noColor or argv.n then true else false

  # args passed
  return popular(argv._[0], flags) if argv._.length > 0

  # --version
  return displayVersion() if argv.version or argv.V

  # --help
  return displayHelp() if argv.help or argv.h

  # no args so display help
  displayHelp() unless argv._.length
