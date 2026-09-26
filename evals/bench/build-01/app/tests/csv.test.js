'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { exportCsv, importInvoices } = require('../src');
const { assertSameDay, sample } = require('./helpers');

test('export writes US dates and dollars', () => {
  assert.equal(exportCsv(sample.slice(0, 2)), 'id,date,amount\nINV-101,01/15/2026,1250.00\nINV-102,02/20/2026,89.00');
});

test('import reads the accountant CSV', () => {
  const rows = importInvoices('id,date,amount\nINV-201,11/11/2026,300.50\nINV-202,2026-12-01,10\n');
  assert.equal(rows.length, 2);
  assertSameDay(rows[0].date, '2026-11-11');
  assert.equal(rows[0].amount, 30050);
  assertSameDay(rows[1].date, '2026-12-01');
});

test('import rejects a file with another header', () => {
  assert.throws(() => importInvoices('invoice,when,total\nA,11/11/2026,1'), /unexpected header/);
});
