#!/usr/bin/env node

const { argv } = require('optimist');
const cli = require('../src/cli');

// init cli
cli(argv);
