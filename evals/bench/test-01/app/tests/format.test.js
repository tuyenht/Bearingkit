'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatCents } = require('../src/format');

test('formats cents with thousands separators', () => {
  assert.equal(formatCents(123456), '1,234.56');
  assert.equal(formatCents(5), '0.05');
  assert.equal(formatCents(-2500), '-25.00');
});
