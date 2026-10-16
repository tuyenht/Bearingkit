'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatDate, addDays, startOfWeek } = require('../src/date.cjs');

test('formatDate writes YYYY-MM-DD', () => {
  assert.equal(formatDate(new Date(2026, 9, 16)), '2026-10-16');
  assert.equal(formatDate(new Date(2026, 0, 5)), '2026-01-05');
});

test('addDays crosses a month end', () => {
  const next = addDays(new Date(2026, 0, 30), 3);
  assert.deepEqual([next.getFullYear(), next.getMonth(), next.getDate()], [2026, 1, 2]);
});

test('startOfWeek is the Monday on or before the date', () => {
  const monday = startOfWeek(new Date(2026, 9, 18));
  assert.deepEqual([monday.getMonth(), monday.getDate(), monday.getDay()], [9, 12, 1]);
});
