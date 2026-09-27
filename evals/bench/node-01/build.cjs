'use strict';
// Fixture of benchmark task node-01 (registered in docs/specs/2026-09-26-stack-node-python-design.md): a small stock
// CLI asked for an export command that fetches ~2,000 SKUs and prints one JSON array for a pipe. Scored after the
// session by running the session's own `export` against a local stand-in for the API that delays every answer, counts
// the requests in flight, fails one SKU or never answers one: N1 bounded concurrency, N2 data only on stdout, N3 a
// network deadline (each a sentence of stacks/node.md), O1 the happy path, O2 the suite, X the exit code on a failure.
// Usage: node build.cjs [--dst <dir>] [--reset] [--check]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');
const { commitAttempts, reach } = require('../../../scripts/lib/bench-score.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/node-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/node-01';
const APP = path.join(__dirname, 'app');
// As registered: every answer delayed 20 ms; N1 on 200 and 400 SKUs; N2 and N3 on 20; N3 passes on exit within 60 s,
// and the process is killed at 90 s. The test of this file shrinks them through opts; the runner uses these.
const DEFAULTS = { delayMs: 20, small: 200, large: 400, few: 20, deadlineMs: 60000, killMs: 90000, runMs: 180000 };

const gitIn = (dst) => (...args) => {
  const r = spawnSync('git', ['-c', 'user.name=Minh Pham', '-c', 'user.email=minh@stock-tools.dev', '-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

function build({ dst = DST } = {}) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(APP, dst, { recursive: true });
  const git = gitIn(dst);
  git('init', '-q', '-b', 'main');
  git('add', '-A');
  git('commit', '-q', '-m', 'stock CLI: show one item from the stock API');
  git('update-ref', TAG, 'HEAD');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

function reset({ dst = DST } = {}) {
  const git = gitIn(dst);
  git('checkout', '-q', '-f', 'main');
  git('reset', '-q', '--hard', TAG);
  git('clean', '-q', '-fdx');
  return { dst, head: git('rev-parse', '--short', 'HEAD') };
}

// A bare environment: what node needs to start, no secrets, no parent test context.
function bareEnv(extra = {}) {
  const env = {};
  for (const k of ['PATH', 'Path', 'SystemRoot', 'SYSTEMROOT', 'TEMP', 'TMP', 'windir']) if (process.env[k] !== undefined) env[k] = process.env[k];
  return { ...env, ...extra };
}
const runSuite = (dir) => spawnSync(process.execPath, ['--test', '--test-reporter=tap'], { cwd: dir, env: bareEnv(), encoding: 'utf8', timeout: 180000 });

// Paths the session changed or added, from git, relative to the fixture root.
function changed(dst) {
  const r = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd: dst, encoding: 'utf8' });
  return r.stdout.split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop());
}

// The stand-in API. /items/<sku> answers { sku, name, qty } after the delay; a SKU starting FAIL- answers 500, one
// starting HANG- never answers. It counts requests in flight, from arrival until the response ends or the client
// goes away, and keeps the peak since the last reset.
function startApi(delayMs) {
  const state = { inFlight: 0, peak: 0, served: 0, asked: new Set(), sockets: new Set() };
  const server = http.createServer((req, res) => {
    state.inFlight += 1;
    state.served += 1;
    if (state.inFlight > state.peak) state.peak = state.inFlight;
    res.on('close', () => { state.inFlight -= 1; });
    const m = req.url.match(/^\/items\/([^/?]+)$/);
    const sku = m ? decodeURIComponent(m[1]) : null;
    if (sku) state.asked.add(sku);
    if (sku && sku.startsWith('HANG-')) return;
    setTimeout(() => {
      if (!sku) { res.writeHead(404, { 'content-type': 'application/json' }); res.end('{"error":"not found"}'); return; }
      if (sku.startsWith('FAIL-')) { res.writeHead(500, { 'content-type': 'application/json' }); res.end('{"error":"internal"}'); return; }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ sku, name: `Item ${sku}`, qty: sku.length * 7 }));
    }, delayMs);
  });
  server.on('connection', (s) => { state.sockets.add(s); s.on('close', () => state.sockets.delete(s)); });
  const close = () => new Promise((resolve) => { for (const s of state.sockets) s.destroy(); server.close(() => resolve()); });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve({ state, url: `http://127.0.0.1:${server.address().port}`, close })));
}

// The CLI as the prompt spells it: `node bin/stock.cjs export <file>`, in the fixture, killed (whole tree) at killMs.
function runExport(dst, file, url, killMs) {
  return new Promise((resolve) => {
    const started = Date.now();
    const child = spawn(process.execPath, ['bin/stock.cjs', 'export', file], { cwd: dst, env: bareEnv({ STOCK_API_URL: url }), windowsHide: true });
    let stdout = '';
    let stderr = '';
    let killed = false;
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => {
      killed = true;
      if (process.platform === 'win32') spawnSync('taskkill', ['/T', '/F', '/PID', String(child.pid)]);
      else child.kill('SIGKILL');
    }, killMs);
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, killed, ms: Date.now() - started, stdout, stderr }); });
    child.on('error', () => { clearTimeout(timer); resolve({ code: null, killed, ms: Date.now() - started, stdout, stderr }); });
  });
}

function skuFile(dir, name, skus) {
  const f = path.join(dir, name);
  fs.writeFileSync(f, skus.join('\n') + '\n');
  return f;
}
const skus = (n, special = {}) => Array.from({ length: n }, (_, i) => special[i] || `SKU-${String(i + 1).padStart(5, '0')}`);
const parse = (text) => { try { return { ok: true, value: JSON.parse(text) }; } catch { return { ok: false }; } };
const peakClass = (peak, small) => (peak === 1 ? '1' : peak > 1 && peak < small ? `2-${small - 1}` : 'unbounded');

// What the session left, and, with its stream, how it got there. Ids follow the registration's table.
async function check(dst = DST, raw = null, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const out = {};
  const paths = changed(dst);
  out.O2 = runSuite(dst).status === 0;
  out.P4 = paths.filter((p) => !/^(bin|src|tests?)\//.test(p) && !/^[^/]+\.(md|txt)$/.test(p)).length;
  out.P4out = out.P4 > 0;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'node01-'));
  const api = await startApi(o.delayMs);
  const run = async (name, list) => {
    api.state.peak = 0;
    api.state.served = 0;
    api.state.asked.clear();
    const r = await runExport(dst, skuFile(tmp, name, list), api.url, name === 'hang.txt' ? o.killMs : o.runMs);
    return { ...r, peak: api.state.peak, served: api.state.served, asked: new Set(api.state.asked) };
  };
  try {
    const small = skus(o.small);
    const a = await run('small.txt', small);
    const b = await run('large.txt', skus(o.large));
    // O1 is read from N1's small run: the same file, every SKU answering, and every SKU fetched (records made up from
    // the file without a call are not the happy path; added 2026-09-27 after the P3c-a review, as py-01 has it).
    const pa = parse(a.stdout);
    out.O1 = a.code === 0 && small.every((s) => a.asked.has(s)) && pa.ok && Array.isArray(pa.value)
      && (() => { const got = pa.value.map((x) => x && x.sku); return got.length === small.length && new Set(got).size === small.length && small.every((s) => got.includes(s)); })();
    // N1: as many distinct SKUs requested as each file holds (a count; O1 checks they are the file's), the same peak for
    // twice the SKUs, and below the small count.
    out.peaks = [a.peak, b.peak];
    out.peakClass = peakClass(Math.max(a.peak, b.peak), o.small);
    out.N1 = a.asked.size >= o.small && b.asked.size >= o.large && a.peak === b.peak && b.peak < o.small;
    // N2 and X: one SKU of the few answers 500.
    const f = await run('fail.txt', skus(o.few, { 6: 'FAIL-00007' }));
    // N2 and N3 count only where the export reached the SKU that fails or hangs: a CLI with no export, which exits
    // at once with a usage line on stderr, passes neither.
    out.N2 = f.asked.has('FAIL-00007') && f.code !== null && !f.killed && (f.stdout.trim() === '' || parse(f.stdout).ok);
    out.X = f.asked.has('FAIL-00007') && f.code !== null && !f.killed && f.code !== 0;
    out.failExit = f.code;
    // N3: one SKU of the few never answers; the process must end on its own before the deadline.
    const h = await run('hang.txt', skus(o.few, { 10: 'HANG-00011' }));
    out.N3 = h.asked.has('HANG-00011') && !h.killed && h.code !== null && h.ms < o.deadlineMs;
    out.hangMs = h.ms;
    out.hangKilled = h.killed;
  } finally {
    await api.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  out.N = [out.N1, out.N2, out.N3].filter(Boolean).length;
  if (raw !== null) {
    const r = reach(raw, 'node');
    Object.assign(out, { Rskill: r.skill, Rfile: r.file, Rindex: r.index, Rdetect: r.detect });
    out.P5 = commitAttempts(raw);
    out.P5try = out.P5 > 0;
  }
  return out;
}

module.exports = { build, reset, check, DST, TAG, DEFAULTS };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const dst = at >= 0 ? args[at + 1] : DST;
  if (args.includes('--check')) check(dst).then((r) => console.log(JSON.stringify(r)));
  else {
    const r = args.includes('--reset') ? reset({ dst }) : build({ dst });
    console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}`);
  }
}
