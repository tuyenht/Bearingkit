'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { dueDate, isOverdue, daysLate, summary } = require('../src/invoice');

const invoice = { number: 'INV-1042', issuedOn: '2026-01-01', termsDays: 30, status: 'open' };

test('the due date is the issue date plus the payment terms', () => {
  assert.equal(dueDate(invoice), '2026-01-31');
});

test('an open invoice is overdue from the day after its due date', () => {
  assert.equal(isOverdue(invoice, '2026-01-31'), false);
  assert.equal(isOverdue(invoice, '2026-02-01'), true);
});

test('a paid invoice is never overdue', () => {
  assert.equal(isOverdue({ ...invoice, status: 'paid' }, '2026-06-01'), false);
});

test('days late counts whole days after the due date', () => {
  assert.equal(daysLate(invoice, '2026-02-10'), 10);
  assert.equal(daysLate(invoice, '2026-01-20'), 0);
});

test('the summary names the due date and the delay', () => {
  assert.equal(summary(invoice, '2026-01-15'), 'INV-1042: due 2026-01-31');
  assert.equal(summary(invoice, '2026-02-01'), 'INV-1042: due 2026-01-31, 1 day late');
  assert.equal(summary(invoice, '2026-02-02'), 'INV-1042: due 2026-01-31, 2 days late');
});
