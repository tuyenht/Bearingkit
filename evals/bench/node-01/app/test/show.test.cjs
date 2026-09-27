'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const path = require('node:path');
const { execFile } = require('node:child_process');

const BIN = path.join(__dirname, '..', 'bin', 'stock.cjs');
const ITEMS = {
  'A-100': { sku: 'A-100', name: 'Hex bolt M8', qty: 420 },
  'B-220': { sku: 'B-220', name: 'Washer 8 mm', qty: 1300 },
};

// A local stand-in for the stock API.
function startApi() {
  const server = http.createServer((req, res) => {
    const m = req.url.match(/^\/items\/([^/?]+)$/);
    const item = m && ITEMS[decodeURIComponent(m[1])];
    if (!item) { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{"error":"not found"}'); return; }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify(item));
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

function stock(args, api) {
  const env = { ...process.env, STOCK_API_URL: `http://127.0.0.1:${api.address().port}` };
  return new Promise((resolve) => {
    execFile(process.execPath, [BIN, ...args], { env }, (err, stdout, stderr) => resolve({ code: err ? err.code : 0, stdout, stderr }));
  });
}

test('show prints one item as JSON', async (t) => {
  const api = await startApi();
  t.after(() => api.close());
  const r = await stock(['show', 'A-100'], api);
  assert.equal(r.code, 0);
  assert.deepEqual(JSON.parse(r.stdout), ITEMS['A-100']);
});

test('show on an unknown SKU fails with the status on stderr', async (t) => {
  const api = await startApi();
  t.after(() => api.close());
  const r = await stock(['show', 'Z-999'], api);
  assert.equal(r.code, 1);
  assert.equal(r.stdout, '');
  assert.match(r.stderr, /404/);
});

test('no command prints the usage', async (t) => {
  const api = await startApi();
  t.after(() => api.close());
  const r = await stock([], api);
  assert.equal(r.code, 2);
  assert.match(r.stderr, /usage/);
});
