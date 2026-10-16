'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { balanceLine } = require('../src/report.cjs');

test('balanceLine right-aligns the balance in 12 columns', () => {
  assert.equal(balanceLine({ name: 'Rent', balanceCents: 120000 }), 'Rent    1,200.00');
});
