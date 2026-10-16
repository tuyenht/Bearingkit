'use strict';
// Invoice line items: { description, quantity, unitCents }.

// The total of one line, in cents.
function lineTotal(item) {
  return item.quantity * item.unitCents;
}

module.exports = { lineTotal };
