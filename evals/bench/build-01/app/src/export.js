'use strict';
const { format } = require('./deps');

// The CSV the US accountant imports: dates as MM/DD/YYYY, amounts in dollars.
function exportCsv(invoices) {
  const rows = invoices.map((inv) => `${inv.id},${format(inv.date, 'MM/DD/YYYY')},${(inv.amount / 100).toFixed(2)}`);
  return ['id,date,amount', ...rows].join('\n');
}

module.exports = { exportCsv };
