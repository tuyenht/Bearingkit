'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createStore } = require('../src/store');
const { STATUS, createTicket, assignTicket, resolveTicket, reopenTicket } = require('../src/tickets');
const { drain } = require('../src/notify');
const portal = require('../src/portal');
const { closeResolved } = require('../src/jobs/close-resolved');
const { purgeClosed } = require('../src/jobs/purge-closed');

const DAY = 24 * 60 * 60 * 1000;
const at = (days) => new Date(Date.UTC(2026, 0, 1) + days * DAY);
const acme = { id: 7, orgId: 1 };
const globex = { id: 9, orgId: 2 };

test('a new ticket is open, unassigned, with its SLA due time', () => {
  const store = createStore();
  const t = createTicket(store, { orgId: 1, customerId: 7, subject: 'Printer', body: 'It is on fire', now: at(0) });
  assert.equal(t.status, STATUS.OPEN);
  assert.equal(t.assignee_id, null);
  assert.equal(t.sla_due_at, new Date(at(0).getTime() + 8 * 60 * 60 * 1000).toISOString());
});

test('an agent reopens a resolved ticket, and the assignee hears of it', () => {
  const store = createStore();
  drain();
  const t = createTicket(store, { orgId: 1, customerId: 7, subject: 'Printer', body: 'x', now: at(0) });
  assignTicket(store, t.id, 41);
  resolveTicket(store, t.id, 41, { now: at(1) });
  assert.equal(reopenTicket(store, t.id, 42).status, STATUS.OPEN);
  assert.deepEqual(drain().map((m) => [m.to, m.event.type]), [['agent:41', 'ticket_reopened']]);
});

test('only a resolved ticket can be reopened', () => {
  const store = createStore();
  const t = createTicket(store, { orgId: 1, customerId: 7, subject: 'Printer', body: 'x', now: at(0) });
  assert.throws(() => reopenTicket(store, t.id, 41), /cannot reopen a open ticket/);
  resolveTicket(store, t.id, 41, { now: at(1) });
  closeResolved(store, { now: at(5) });
  assert.throws(() => reopenTicket(store, t.id, 41), /cannot reopen a closed ticket/);
});

test('a customer sees only their organisation, and answering a resolved ticket opens it again', () => {
  const store = createStore();
  const t = portal.openTicket(store, acme, { subject: 'Printer', body: 'x' });
  assert.equal(portal.getMyTicket(store, globex, t.id), null);
  assert.equal(portal.listMyTickets(store, globex).length, 0);
  resolveTicket(store, t.id, 41);
  assert.equal(portal.reply(store, acme, t.id, 'still broken').status, STATUS.OPEN);
});

test('a resolved ticket closes after three quiet days, and a closed one takes no answer', () => {
  const store = createStore();
  const t = createTicket(store, { orgId: 1, customerId: 7, subject: 'Printer', body: 'x', now: at(0) });
  resolveTicket(store, t.id, 41, { now: at(1) });
  assert.deepEqual(closeResolved(store, { now: at(3) }), []);
  assert.deepEqual(closeResolved(store, { now: at(4) }), [t.id]);
  assert.throws(() => portal.reply(store, acme, t.id, 'hello?'), /closed/);
});

test('a closed ticket loses its messages after seven days and keeps its row', () => {
  const store = createStore();
  const t = createTicket(store, { orgId: 1, customerId: 7, subject: 'Printer', body: 'x', now: at(0) });
  resolveTicket(store, t.id, 41, { now: at(1) });
  closeResolved(store, { now: at(4) });
  assert.deepEqual(purgeClosed(store, { now: at(10) }), []);
  assert.deepEqual(purgeClosed(store, { now: at(11) }), [t.id]);
  assert.equal(store.getMessages(t.id).length, 0);
  assert.equal(store.getTicket(t.id).subject, 'Printer');
});
