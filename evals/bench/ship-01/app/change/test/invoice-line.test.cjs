'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatInvoiceLine } = require('../src/invoice-line.cjs');

test('formatInvoiceLine aligns the quantity and the total', () => {
  const line = formatInvoiceLine({ description: 'Paper, A4', quantity: 3, unitCents: 450 });
  assert.equal(line, `${'Paper, A4'.padEnd(24)}   3       13.50`);
});

test('formatInvoiceLine cuts a long description to 24 characters', () => {
  const item = { description: 'Recycled paper, A4, 80 g/m2, box', quantity: 12, unitCents: 2599 };
  assert.equal(formatInvoiceLine(item), 'Recycled paper, A4, 80 g  12      311.88');
});
