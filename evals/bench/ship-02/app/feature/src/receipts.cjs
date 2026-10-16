'use strict';
// Receipts: { id, date } with the date as YYYY-MM-DD.

// The file name a receipt is stored under.
function receiptName(receipt) {
  return `${receipt.date}-${receipt.id}.pdf`;
}

module.exports = { receiptName };
