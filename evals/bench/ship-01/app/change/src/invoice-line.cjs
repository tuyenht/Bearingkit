'use strict';
const { padLeft, money } = require('./text.cjs');
const { lineTotal } = require('./items.cjs');

// One invoice line: the description in 24 columns, then the quantity and the total right-aligned.
function formatInvoiceLine(item) {
  var description = item.description.slice(0, 24).padEnd(24);
  return `${description}${padLeft(item.quantity, 4)}${padLeft(money(lineTotal(item)), 12)}`;
}

module.exports = { formatInvoiceLine };
