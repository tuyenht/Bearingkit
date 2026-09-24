'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDate, formatDate, addDays, daysBetween } = require('../src/dates');

test('a date survives parse and format', () => {
  assert.equal(formatDate(parseDate('2026-03-15')), '2026-03-15');
});

test('adding days crosses a month end', () => {
  assert.equal(addDays('2026-01-30', 3), '2026-02-02');
});

test('days between two dates', () => {
  assert.equal(daysBetween('2026-01-01', '2026-01-31'), 30);
});
