'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { receiptName } = require('../src/receipts.cjs');

test('receiptName puts the date first so names sort by day', () => {
  assert.equal(receiptName({ id: 'R-17', date: '2026-10-02' }), '2026-10-02-R-17.pdf');
});
