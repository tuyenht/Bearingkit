'use strict';
const { notifyAgent } = require('./notify');

const STATUS = Object.freeze({ OPEN: 'open', PENDING: 'pending', RESOLVED: 'resolved', CLOSED: 'closed' });
const SLA_HOURS = 8;
const HOUR = 60 * 60 * 1000;

function createTicket(store, { orgId, customerId, subject, body, now = new Date() }) {
  const id = store.insertTicket({
    org_id: orgId,
    customer_id: customerId,
    subject,
    status: STATUS.OPEN,
    assignee_id: null,
    created_at: now.toISOString(),
    sla_due_at: new Date(now.getTime() + SLA_HOURS * HOUR).toISOString(),
    resolved_at: null,
    closed_at: null,
    purged: false,
  });
  store.addMessage(id, { from: 'customer', body, at: now.toISOString() });
  return store.getTicket(id);
}

function assignTicket(store, id, agentId) {
  const t = mustGet(store, id);
  if (t.status === STATUS.CLOSED) throw new Error('a closed ticket cannot be changed');
  return store.updateTicket(id, { assignee_id: agentId });
}

function resolveTicket(store, id, agentId, { now = new Date() } = {}) {
  const t = mustGet(store, id);
  if (t.status !== STATUS.OPEN && t.status !== STATUS.PENDING) throw new Error(`cannot resolve a ${t.status} ticket`);
  return store.updateTicket(id, { status: STATUS.RESOLVED, resolved_at: now.toISOString(), resolved_by: agentId });
}

// An agent takes a resolved ticket back. Nothing else can be reopened.
function reopenTicket(store, id, agentId) {
  const t = mustGet(store, id);
  if (t.status !== STATUS.RESOLVED) throw new Error(`cannot reopen a ${t.status} ticket`);
  const updated = store.updateTicket(id, { status: STATUS.OPEN, resolved_at: null });
  if (t.assignee_id && t.assignee_id !== agentId) notifyAgent(store, t.assignee_id, { type: 'ticket_reopened', ticketId: id, by: `agent:${agentId}` });
  return updated;
}

function mustGet(store, id) {
  const t = store.getTicket(id);
  if (!t) throw new Error(`no ticket ${id}`);
  return t;
}

module.exports = { STATUS, SLA_HOURS, createTicket, assignTicket, resolveTicket, reopenTicket };
