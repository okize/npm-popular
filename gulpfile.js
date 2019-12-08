const path = require('path');
const fs = require('fs');
const gulp = require('gulp-help')(require('gulp'));
const gutil = require('gulp-util');
const coffee = require('gulp-coffee');
const coffeelint = require('gulp-coffeelint');
const template = require('gulp-template');
const bump = require('gulp-bump');
const clean = require('del');
const run = require('run-sequence');
const { spawn } = require('child_process');

// configuration
const appRoot = __dirname;
const readmeTemplate = 'src/README.md';
const sourceDir = 'src/**/*.coffee';
const buildDir = 'lib';

// small wrapper around gulp util logging
const log = (msg) => gutil.log(gutil.colors.blue(msg));

// returns parsed package.json
const getPackage = () => JSON.parse(fs.readFileSync('./package.json', 'utf8'));

gulp.task('watch', 'Watches coffeescript files and triggers build on change.', () => {
  log('watching files...');
  return gulp.watch(sourceDir, ['build']);
});

gulp.task('lint', 'Lints coffeescript.', () => {
  log('linting coffeescript');
  return gulp
    .src(sourceDir)
    .pipe(coffeelint())
    .pipe(coffeelint.reporter());
});

// removes distribution folder
gulp.task('clean', 'Deletes build directory.', () => clean([buildDir]));

gulp.task('docs', 'Generates readme file.', () => {
  log('creating documentation');
  return gulp
    .src(readmeTemplate)
    .pipe(
      template({
        description: getPackage().description,
        helpfile: fs.readFileSync('./lang/help.txt', 'utf8'),
      }),
    )
    .pipe(gulp.dest('./'));
});

gulp.task('build', 'Compiles coffeescript source into javascript.', () => {
  log('compiling coffeescript');
  return gulp
    .src(sourceDir)
    .pipe(
      coffee({
        bare: true,
        sourceMap: false,
      }).on('error', gutil.log),
    )
    .pipe(gulp.dest(buildDir));
});

gulp.task('bump', 'Bumps patch version of module', () => {
  log('bumping version');
  return gulp
    .src('./package.json')
    .pipe(bump({ type: 'patch' }))
    .pipe(gulp.dest(appRoot));
});

gulp.task('publish', 'Publishes module to npm', (done) => {
  log(`publishing ${getPackage().name} version ${getPackage().version}`);
  return spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('release', 'Builds module, bumps version & publishes to npm.', (done) =>
  run('clean', ['docs', 'build'], 'bump', 'publish', done),
);
