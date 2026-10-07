'use strict';
// Nightly. A resolved ticket the customer has not answered for three days is closed.
const { STATUS } = require('../tickets');

const QUIET_DAYS = 3;
const DAY = 24 * 60 * 60 * 1000;

function closeResolved(store, { now = new Date() } = {}) {
  const closed = [];
  for (const t of store.listTickets({ status: STATUS.RESOLVED })) {
    if (now.getTime() - new Date(t.resolved_at).getTime() < QUIET_DAYS * DAY) continue;
    store.updateTicket(t.id, { status: STATUS.CLOSED, closed_at: now.toISOString() });
    closed.push(t.id);
  }
  return closed;
}

module.exports = { closeResolved, QUIET_DAYS };
