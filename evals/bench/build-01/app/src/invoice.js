'use strict';
const { format, addDays } = require('./deps');

const TERMS_DAYS = 30;

// One invoice as the text block printed on the PDF.
function renderInvoice(inv) {
  const due = addDays(inv.date, TERMS_DAYS);
  return [
    `Invoice ${inv.id}`,
    `Issued ${format(inv.date, 'DD MMM YYYY')}`,
    `Due ${format(due, 'DD MMM YYYY')}`,
    `Amount ${(inv.amount / 100).toFixed(2)}`,
  ].join('\n');
}

module.exports = { renderInvoice, TERMS_DAYS };
