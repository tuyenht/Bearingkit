'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

// On 2026-09-17 the Antigravity gate driver stopped after prompt 64 with exit status 0 and nothing in its log: the
// page reloaded, the DevTools socket closed, and a pending request that nothing would ever answer left the event
// loop empty. A request must settle whatever happens to the socket.
function fakeSocket() {
  const sent = [];
  return {
    sent,
    readyOpen: true,
    send(data) { if (!this.readyOpen) throw new Error('socket is closed'); sent.push(JSON.parse(data)); },
    close() { this.readyOpen = false; if (this.onclose) this.onclose({}); },
    answer(id, result) { this.onmessage({ data: JSON.stringify({ id, result }) }); },
  };
}

test('a DevTools request resolves with its own answer', async () => {
  const { client } = require('../scripts/antigravity/cdp.cjs');
  const ws = fakeSocket();
  const c = client(ws, { timeoutMs: 1000 });
  const p = c.evaluate('1 + 1');
  ws.answer(ws.sent[0].id, { result: { value: 2 } });
  assert.equal(await p, 2);
});

test('a pending request is rejected when the socket closes, instead of waiting forever', async () => {
  const { client } = require('../scripts/antigravity/cdp.cjs');
  const ws = fakeSocket();
  const c = client(ws, { timeoutMs: 60000 });
  const p = c.send('Runtime.evaluate', { expression: 'location.href' });
  ws.close();
  await assert.rejects(p, /socket closed/);
  await assert.rejects(c.send('Runtime.evaluate', {}), /closed/, 'a request on a closed socket fails at once');
});

test('a request nobody answers is rejected after the timeout', async () => {
  const { client } = require('../scripts/antigravity/cdp.cjs');
  const ws = fakeSocket();
  const c = client(ws, { timeoutMs: 30 });
  await assert.rejects(c.send('Runtime.evaluate', {}), /timed out after 30 ms/);
});
