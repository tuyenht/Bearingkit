// Minimal Chrome DevTools Protocol client for the Antigravity 2.0 window (Electron, port 1405).
// Usage: node cdp.cjs eval "<js expression>"   |   node cdp.cjs targets
'use strict';
const http = require('node:http');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let s = ''; res.on('data', (d) => { s += d; }); res.on('end', () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } }); }).on('error', reject);
  });
}

// Wraps a WebSocket-like object in a request/response client. Every request settles: with its answer, or rejected
// when the socket closes or the timeout passes. Without that, a page reload closed the socket, the pending request was
// never answered, the event loop emptied, and the gate driver exited with status 0 and nothing in its log
// (2026-09-17, after prompt 64 of the Antigravity run).
function client(ws, { timeoutMs = 60000 } = {}) {
  let id = 0;
  const pending = new Map();
  const settle = (i, how, value) => {
    const p = pending.get(i);
    if (!p) return;
    clearTimeout(p.timer);
    pending.delete(i);
    p[how](value);
  };
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) settle(m.id, 'resolve', m); };
  ws.onclose = () => { for (const i of [...pending.keys()]) settle(i, 'reject', new Error('DevTools socket closed')); };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const i = ++id;
    const timer = setTimeout(() => settle(i, 'reject', new Error(`DevTools ${method} timed out after ${timeoutMs} ms`)), timeoutMs);
    pending.set(i, { resolve, reject, timer });
    try { ws.send(JSON.stringify({ id: i, method, params })); } catch (e) { settle(i, 'reject', e); }
  });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500));
    return r.result && r.result.result ? r.result.result.value : undefined;
  };
  return { send, evaluate, close: () => ws.close() };
}

async function connect(port = 1405, opts) {
  const list = await getJson(`http://127.0.0.1:${port}/json/list`);
  const page = list.find((t) => t.type === 'page') || list[0];
  if (!page) throw new Error('no page target');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  return { page, ...client(ws, opts) };
}

module.exports = { connect, getJson, client };

if (require.main === module) {
  (async () => {
    const [cmd, ...rest] = process.argv.slice(2);
    if (cmd === 'targets') { console.log(JSON.stringify(await getJson('http://127.0.0.1:1405/json/list'), null, 1)); return; }
    const c = await connect();
    if (cmd === 'eval') { const v = await c.evaluate(rest.join(' ')); console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 1)); }
    c.close();
  })().catch((e) => { console.error(e.message || e); process.exit(1); });
}
