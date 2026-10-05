'use strict';
// Nightly. Seven days after a ticket is closed its messages are deleted; the ticket row stays as a summary
// (subject, dates, organisation) for reporting. Legal asked for this: we do not keep conversation text of
// finished tickets longer than a week.
const { STATUS } = require('../tickets');

const KEEP_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;

function purgeClosed(store, { now = new Date() } = {}) {
  const purged = [];
  for (const t of store.listTickets({ status: STATUS.CLOSED })) {
    if (t.purged) continue;
    if (now.getTime() - new Date(t.closed_at).getTime() < KEEP_DAYS * DAY) continue;
    store.deleteMessages(t.id);
    store.updateTicket(t.id, { purged: true });
    purged.push(t.id);
  }
  return purged;
}

module.exports = { purgeClosed, KEEP_DAYS };
