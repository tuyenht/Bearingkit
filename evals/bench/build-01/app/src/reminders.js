'use strict';
const { format, addDays } = require('./deps');
const { TERMS_DAYS } = require('./invoice');

// Invoices whose due date is today or earlier, with the due date for the reminder email.
function dueReminders(invoices, today) {
  return invoices
    .map((inv) => ({ id: inv.id, due: addDays(inv.date, TERMS_DAYS) }))
    .filter((r) => r.due <= today)
    .map((r) => ({ id: r.id, due: format(r.due, 'YYYY-MM-DD') }));
}

module.exports = { dueReminders };
