'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { alignRight, money } = require('../src/text.cjs');

test('alignRight pads to the width and leaves longer values alone', () => {
  assert.equal(alignRight('7', 3), '  7');
  assert.equal(alignRight('42', 4, '0'), '0042');
  assert.equal(alignRight('12345', 3), '12345');
});

test('money groups thousands and keeps two decimals', () => {
  assert.equal(money(123450), '1,234.50');
  assert.equal(money(5), '0.05');
  assert.equal(money(-99900), '-999.00');
});
