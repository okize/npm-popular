# modules
path = require('path')
fs = require('fs')
gulp = require('gulp-help')(require('gulp'))
gutil = require('gulp-util')
coffee = require('gulp-coffee')
coffeelint = require('gulp-coffeelint')
template = require('gulp-template')
bump = require('gulp-bump')
clean = require('del')
run = require('run-sequence')
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

gulp.task 'watch', 'Watches coffeescript files and triggers build on change.', ->
  log 'watching files...'
  gulp.watch sourceDir, ['build']

gulp.task 'lint', 'Lints coffeescript.', ->
  log 'linting coffeescript'
  gulp
    .src(sourceDir)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter())

# removes distribution folder
gulp.task 'clean', 'Deletes build directory.', ->
  clean [buildDir]

gulp.task 'docs', 'Generates readme file.', ->
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

gulp.task 'build', 'Compiles coffeescript source into javascript.', ->
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

gulp.task 'bump', 'Bumps patch version of module', ->
  log 'bumping version'
  gulp
    .src('./package.json')
    .pipe(
      bump type: 'patch'
    )
    .pipe(
      gulp.dest appRoot
    )

gulp.task 'publish', 'Publishes module to npm', (done) ->
  log "publishing #{getPackage().name} version #{getPackage().version}"
  spawn('npm', ['publish'],
    stdio: 'inherit'
  ).on 'close', done

gulp.task 'release', 'Builds module, bumps version & publishes to npm.', (done) ->
  run(
    'clean'
    ['docs', 'build']
    'bump'
    'publish'
    done
  )
