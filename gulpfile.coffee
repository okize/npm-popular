# modules
path = require 'path'
fs = require 'fs'
gulp = require 'gulp'
gutil = require 'gulp-util'
coffee = require 'gulp-coffee'
coffeelint = require 'gulp-coffeelint'
template = require 'gulp-template'
bump = require 'gulp-bump'
clean = require 'del'
runSequence = require 'run-sequence'
spawn = require('child_process').spawn

# configuration
appRoot = __dirname
readmeTemplate = 'src/README.md'
sourceDir = 'src/**/*.coffee'
buildDir = 'lib'

# small wrapper around gulp util logging
log = (msg) ->
  gutil.log gutil.colors.blue(msg)

# returns parsed package.json
getPackage = ->
  JSON.parse fs.readFileSync('./package.json', 'utf8')

# default task that's run with 'gulp'
gulp.task 'default', [
  'watch'
]

# watches source files and triggers build on change
gulp.task 'watch', ->
  log 'watching files...'
  gulp.watch sourceDir, ['build']

# lints coffeescript
gulp.task 'lint', ->
  log 'linting coffeescript'
  gulp
    .src(sourceDir)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())

# removes distribution folder
gulp.task 'clean', ->
  clean [buildDir]

# generates readme.md
gulp.task 'docs', ->
  log 'creating documentation'
  gulp
    .src(readmeTemplate)
    .pipe(
      template
        description: getPackage().description
        helpfile: fs.readFileSync './lang/help.txt', 'utf8'
    )
    .pipe(
      gulp.dest './'
    )

# builds coffeescript source into deployable javascript
gulp.task 'build', ->
  log 'compiling coffeescript'
  gulp
    .src(sourceDir)
    .pipe(
      coffee(
        bare: true
        sourceMap: false
      )
      .on('error', gutil.log)
    )
    .pipe(
      gulp.dest buildDir
    )

# bumps patch version
gulp.task 'bump', ->
  log 'bumping version'
  gulp
    .src('./package.json')
    .pipe(
      bump type: 'patch'
    )
    .pipe(
      gulp.dest appRoot
    )

# publishes module to npm
gulp.task 'publish', (done) ->
  log "publishing #{getPackage().name} version #{getPackage().version}"
  spawn('npm', ['publish'],
    stdio: 'inherit'
  ).on 'close', done

# releases new version of module
gulp.task 'release', (done) ->
  runSequence 'clean', ['docs', 'build'], 'bump', 'publish', done
