#!/usr/bin/env node
'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/*eslint-disable no-var, prefer-const, no-console*/

// Forwards the arguments from this script to ./run-jasmine-tests and invokes it runs it under
// a timeout. This is used to help find tests that are not terminating on their own.

var spawn = require('child_process').spawn;

var TIMEOUT_IN_MILLIS = 5 * 60 * 1000;
var runJasmineTests = require.resolve('./run-jasmine-tests');

// Contents of process.argv:
// 0 is "node"
// 1 is the path to this script.
// 2+ (the remaining args) are the args to forward to ./run-jasmine-tests.
var varArgs = process.argv.slice(2);

var args = [
  runJasmineTests,
  '--forceexit',
  '--color',
  '--captureExceptions',
].concat(varArgs);

var testInfo = 'cd ' + process.cwd() + ' && node ' + args.join(' ');

var timeoutId = setTimeout(function() {
  console.error('Test runner timed out for: ' + testInfo);
  process.abort();
}, TIMEOUT_IN_MILLIS);

var child = spawn('node', args);

child.stdout.on('data', function(/* Buffer */ data) {
  process.stdout.write(data.toString());
});

child.stderr.on('data', function(/* Buffer */ data) {
  process.stderr.write(data.toString());
});

child.on('close', function(code) {
  clearTimeout(timeoutId);
  if (code === 0) {
    console.log('TEST PASSED when running: ' + testInfo);
  } else {
    console.error('TEST FAILED when running: ' + testInfo);
  }
  process.exit(code);
});

child.on('error', function(err) {
  console.error('TEST FAILED when running: ' + testInfo);
  console.error(err.toString());
  process.exit(1);
});
