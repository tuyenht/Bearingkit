'use strict';
// The store the tests run against. Production puts the same interface over Postgres.

function createStore() {
  const tickets = new Map();
  const messages = new Map();
  let nextId = 1;
  return {
    insertTicket(row) {
      const id = nextId++;
      tickets.set(id, { id, ...row });
      messages.set(id, []);
      return id;
    },
    getTicket(id) {
      const t = tickets.get(id);
      return t ? { ...t } : null;
    },
    updateTicket(id, patch) {
      const t = tickets.get(id);
      if (!t) throw new Error(`no ticket ${id}`);
      Object.assign(t, patch);
      return { ...t };
    },
    listTickets(filter = {}) {
      return [...tickets.values()].filter((t) => Object.entries(filter).every(([k, v]) => t[k] === v)).map((t) => ({ ...t }));
    },
    addMessage(ticketId, message) {
      messages.get(ticketId).push({ ...message });
    },
    getMessages(ticketId) {
      return (messages.get(ticketId) || []).map((m) => ({ ...m }));
    },
    deleteMessages(ticketId) {
      messages.set(ticketId, []);
    },
  };
}

module.exports = { createStore };
