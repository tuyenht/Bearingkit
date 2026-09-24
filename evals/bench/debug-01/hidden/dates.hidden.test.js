'use strict';
// Hidden checks of benchmark task debug-01: copied into the fixture only while the scorer runs them, once per TZ.
const test = require('node:test');
const assert = require('node:assert/strict');
const { parseDate, formatDate, addDays, daysBetween } = require('../src/dates');
const { dueDate, daysLate, summary } = require('../src/invoice');

test('the code under test leaves the time zone of the process alone', () => {
  assert.equal(process.env.TZ, process.env.BENCH_TZ);
});

test('dates survive parse and format, daylight-saving days and leap days included', () => {
  for (const d of ['2026-01-01', '2026-01-31', '2026-03-08', '2026-03-29', '2026-10-25', '2026-11-01', '2026-12-31', '2024-02-29']) assert.equal(formatDate(parseDate(d)), d);
});

test('adding days crosses month, year and leap-day ends', () => {
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
  assert.equal(addDays('2024-02-28', 1), '2024-02-29');
  assert.equal(addDays('2026-03-01', 28), '2026-03-29');
  assert.equal(addDays('2026-10-20', 21), '2026-11-10');
});

test('days between whole calendar days across both daylight-saving changes', () => {
  assert.equal(daysBetween('2026-03-01', '2026-03-20'), 19);
  assert.equal(daysBetween('2026-03-28', '2026-04-02'), 5);
  assert.equal(daysBetween('2026-10-20', '2026-11-10'), 21);
});

test('an invoice due before the March change is counted late by whole days', () => {
  const invoice = { number: 'INV-2001', issuedOn: '2026-02-01', termsDays: 28, status: 'open' };
  assert.equal(dueDate(invoice), '2026-03-01');
  assert.equal(daysLate(invoice, '2026-03-20'), 19);
  assert.equal(summary(invoice, '2026-03-20'), 'INV-2001: due 2026-03-01, 19 days late');
});
