'use strict';
// datefmt/testing: assertion helpers for test suites.
const assert = require('node:assert/strict');

function assertSameDay(actual, expected) {
  assert.equal(String(actual).slice(0, 10), String(expected).slice(0, 10), `expected the same day as ${expected}`);
}

module.exports = { assertSameDay };
