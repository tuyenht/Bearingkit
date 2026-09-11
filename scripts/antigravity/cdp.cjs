// Minimal Chrome DevTools Protocol client for the Antigravity 2.0 window (Electron, port 1405).
// Usage: node cdp.cjs eval "<js expression>"   |   node cdp.cjs targets
'use strict';
const http = require('node:http');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => { let s = ''; res.on('data', (d) => { s += d; }); res.on('end', () => { try { resolve(JSON.parse(s)); } catch (e) { reject(e); } }); }).on('error', reject);
  });
}

async function connect(port = 1405) {
  const list = await getJson(`http://127.0.0.1:${port}/json/list`);
  const page = list.find((t) => t.type === 'page') || list[0];
  if (!page) throw new Error('no page target');
  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (r.result && r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 500));
    return r.result && r.result.result ? r.result.result.value : undefined;
  };
  return { page, send, evaluate, close: () => ws.close() };
}

module.exports = { connect, getJson };

if (require.main === module) {
  (async () => {
    const [cmd, ...rest] = process.argv.slice(2);
    if (cmd === 'targets') { console.log(JSON.stringify(await getJson('http://127.0.0.1:1405/json/list'), null, 1)); return; }
    const c = await connect();
    if (cmd === 'eval') { const v = await c.evaluate(rest.join(' ')); console.log(typeof v === 'string' ? v : JSON.stringify(v, null, 1)); }
    c.close();
  })().catch((e) => { console.error(e.message || e); process.exit(1); });
}
