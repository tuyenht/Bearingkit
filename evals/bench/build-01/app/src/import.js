'use strict';
const { parse } = require('./deps');

// Invoices from the US accountant's CSV (id,date,amount; dates as MM/DD/YYYY, amounts in dollars).
function importInvoices(csv) {
  const [header, ...lines] = String(csv).trim().split(/\r?\n/);
  if (header.trim() !== 'id,date,amount') throw new Error(`unexpected header: ${header}`);
  return lines.filter((l) => l.trim()).map((line) => {
    const [id, date, amount] = line.split(',');
    return { id, date: parse(date), amount: Math.round(Number(amount) * 100) };
  });
}

module.exports = { importInvoices };
