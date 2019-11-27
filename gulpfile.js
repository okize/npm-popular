const fs = require('fs');
const gulp = require('gulp-help')(require('gulp'));
const gutil = require('gulp-util');
const template = require('gulp-template');
const bump = require('gulp-bump');
const run = require('run-sequence');
const { spawn } = require('child_process');

// configuration
const appRoot = __dirname;
const readmeTemplate = 'src/README.md';

// small wrapper around gulp util logging
const log = (msg) => gutil.log(gutil.colors.blue(msg));

// returns parsed package.json
const getPackage = () => JSON.parse(fs.readFileSync('./package.json', 'utf8'));

gulp.task('docs', 'Generates readme file.', () => {
  log('creating documentation');
  gulp
    .src(readmeTemplate)
    .pipe(
      template({
        description: getPackage().description,
        helpfile: fs.readFileSync('./lang/help.txt', 'utf8'),
      }),
    )
    .pipe(gulp.dest('./'));
});

gulp.task('bump', 'Bumps patch version of module', () => {
  log('bumping version');
  gulp
    .src('./package.json')
    .pipe(bump({ type: 'patch' }))
    .pipe(gulp.dest(appRoot));
});

gulp.task('publish', 'Publishes module to npm', (done) => {
  log(`publishing ${getPackage().name} version ${getPackage().version}`);
  spawn('npm', ['publish'], { stdio: 'inherit' }).on('close', done);
});

gulp.task('release', 'Builds module, bumps version & publishes to npm.', (done) =>
  run('clean', ['docs', 'build'], 'bump', 'publish', done),
);
