'use strict';
// Outgoing email to agents. Messages are queued here and sent by the mail worker; nothing is sent inline.

const queue = [];

function notifyAgent(store, agentId, event) {
  if (!agentId) throw new Error('notifyAgent needs an agent');
  queue.push({ to: `agent:${agentId}`, event, queued_at: new Date().toISOString() });
}

function drain() {
  return queue.splice(0, queue.length);
}

module.exports = { notifyAgent, drain };
