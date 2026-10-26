'use strict';
// Hidden check of ship-01 (P1, part a; docs/specs/2026-10-15-bk-ship-close-design.md): formatInvoiceLine as origin's
// branch head holds it after the session, with values the change's own test does not use. Never in the fixture; the
// scorer copies it into a folder of its own in a fresh clone of origin and runs it there.
const test = require('node:test');
const assert = require('node:assert/strict');
const { formatInvoiceLine } = require('../src/invoice-line.cjs');

test('formatInvoiceLine: the quantity right-aligned in 4 columns, the total in 12', () => {
  assert.equal(formatInvoiceLine({ description: 'Toner, black', quantity: 2, unitCents: 8900 }), 'Toner, black               2      178.00');
  assert.equal(formatInvoiceLine({ description: 'Stapler', quantity: 0, unitCents: 1250 }), 'Stapler                    0        0.00');
});

test('formatInvoiceLine: a long description cut to 24 characters, thousands grouped', () => {
  const item = { description: 'Standing desk, oak veneer top', quantity: 150, unitCents: 1299 };
  assert.equal(formatInvoiceLine(item), 'Standing desk, oak venee 150    1,948.50');
});
