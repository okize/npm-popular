#!/usr/bin/env node

// modules
var path = require('path'),
  argv = require('optimist').argv,
  cli = require(path.resolve(__dirname, '..', 'src', 'cli'));

// init cli
cli(argv);
