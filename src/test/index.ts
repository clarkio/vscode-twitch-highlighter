//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//
// This file is providing the test runner to use when running extension tests.
// By default the test runner in use is Mocha based.
//
// You can provide your own test runner if you want to override it by exporting
// a function run(testRoot: string, clb: (error:Error) => void) that the extension
// host can call to run the tests. The test runner is expected to use console.log
// to report the results back to the caller. When the tests are finished, return
// a possible error to the callback or null if none.

import * as testRunner from 'vscode/lib/testrunner';
import * as path from 'path';

const os = process.env.AGENT_OS || 'Developer';
const date = new Date().toISOString().replace(/:/g,'-').replace(/\.\d+/, '');

process.env.SUITE_NAME = `${os} Tests`;
process.env.XUNIT_FILE = path.join(__dirname, 'results', `TEST-RESULTS-${os}-${date}.xml`);

console.log(`Suite Name: ${process.env.SUITE_NAME}`);
console.log(`Test Results File: ${process.env.XUNIT_FILE}`);

// You can directly control Mocha options by uncommenting the following lines
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info
testRunner.configure({
  ui: 'tdd', 		// the TDD UI is being used in extension.test.ts (suite, test, etc.)
  useColors: true, // colored output from test results
  reporter: 'spec-xunit-file'
});

module.exports = testRunner;
