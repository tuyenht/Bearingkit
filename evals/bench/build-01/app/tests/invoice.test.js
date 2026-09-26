'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { renderInvoice, dueReminders } = require('../src');
const { sample } = require('./helpers');

test('an invoice prints its issue and due dates', () => {
  assert.equal(renderInvoice(sample[0]), 'Invoice INV-101\nIssued 15 Jan 2026\nDue 14 Feb 2026\nAmount 1250.00');
});

test('reminders list invoices due by today', () => {
  assert.deepEqual(dueReminders(sample, '2026-03-22'), [{ id: 'INV-101', due: '2026-02-14' }, { id: 'INV-102', due: '2026-03-22' }]);
  assert.deepEqual(dueReminders(sample, '2026-02-13'), []);
});
