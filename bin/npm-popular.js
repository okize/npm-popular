#!/usr/bin/env node

// modules
const path = require('path');
const { argv } = require('optimist');

const cli = require(path.resolve(__dirname, '..', 'src', 'cli'));

// init cli
cli(argv);
