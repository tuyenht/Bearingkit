'use strict';
// What a customer can do from the portal. Every function takes the signed-in customer and reads only their
// organisation's tickets.
const { STATUS, createTicket } = require('./tickets');

function listMyTickets(store, customer) {
  return store.listTickets({ org_id: customer.orgId });
}

function getMyTicket(store, customer, id) {
  const t = store.getTicket(id);
  if (!t || t.org_id !== customer.orgId) return null;
  return { ...t, messages: store.getMessages(id) };
}

function openTicket(store, customer, { subject, body }) {
  return createTicket(store, { orgId: customer.orgId, customerId: customer.id, subject, body });
}

// The customer answers. On a resolved ticket that puts it back to open; a closed ticket takes no more answers.
function reply(store, customer, id, body, { now = new Date() } = {}) {
  const t = getMyTicket(store, customer, id);
  if (!t) return null;
  if (t.status === STATUS.CLOSED) throw new Error('this ticket is closed; please open a new one');
  store.addMessage(id, { from: 'customer', body, at: now.toISOString() });
  if (t.status === STATUS.RESOLVED || t.status === STATUS.PENDING) store.updateTicket(id, { status: STATUS.OPEN, resolved_at: null });
  return getMyTicket(store, customer, id);
}

module.exports = { listMyTickets, getMyTicket, openTicket, reply };
