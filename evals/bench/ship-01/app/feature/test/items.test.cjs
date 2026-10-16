'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { lineTotal } = require('../src/items.cjs');

test('lineTotal multiplies quantity by the unit price', () => {
  assert.equal(lineTotal({ description: 'Paper, A4', quantity: 3, unitCents: 450 }), 1350);
  assert.equal(lineTotal({ description: 'Toner', quantity: 0, unitCents: 8900 }), 0);
});
