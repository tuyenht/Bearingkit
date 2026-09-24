'use strict';
const { addDays, daysBetween } = require('./dates');

function dueDate(invoice) {
  return addDays(invoice.issuedOn, invoice.termsDays);
}

function isOverdue(invoice, today) {
  return invoice.status === 'open' && today > dueDate(invoice);
}

function daysLate(invoice, today) {
  return isOverdue(invoice, today) ? daysBetween(dueDate(invoice), today) : 0;
}

function summary(invoice, today) {
  const late = daysLate(invoice, today);
  if (late === 0) return `${invoice.number}: due ${dueDate(invoice)}`;
  return `${invoice.number}: due ${dueDate(invoice)}, ${late} day${late === 1 ? '' : 's'} late`;
}

module.exports = { dueDate, isOverdue, daysLate, summary };
