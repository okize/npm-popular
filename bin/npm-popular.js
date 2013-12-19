#!/usr/bin/env node

// modules
var path = require('path'),
    argv = require('optimist').argv,
    cli = require(path.resolve(__dirname, '..', 'lib', 'cli'));

// init cli
cli(argv);