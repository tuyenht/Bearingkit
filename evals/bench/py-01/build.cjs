'use strict';
// Fixture of benchmark task py-01 (registered in docs/specs/2026-09-26-stack-node-python-design.md): a small asyncio
// stock tool asked for an export command that fetches ~2,000 SKUs and prints one JSON array, each record with the time
// it was exported. Scored after the session by running the session's own `python -m stock export <file>` against a
// local stand-in for the API that delays every answer, counts the requests in flight, fails one SKU or never answers
// one: Y1 bounded fan-out, Y2 a deadline, Y3 a zone-aware timestamp (each a sentence of stacks/python.md), O1 the happy
// path, O2 the suite, X stdout still JSON on a failure (the control: python.md has no stdout rule).
// Python runs only as `python -m pytest` and `python -m stock` on this fixture (owner's exception, question 35 of
// docs/specs/2026-09-12-d5-owner-questions.md). The executable is process.env.BENCH_PYTHON, else `python` on the PATH.
// Usage: node build.cjs [--dst <dir>] [--reset] [--check]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const { spawn, spawnSync } = require('node:child_process');
const { commitAttempts, reach } = require('../../../scripts/lib/bench-score.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/py-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/py-01';
const APP = path.join(__dirname, 'app');
const PYTHON = process.env.BENCH_PYTHON || 'python';
// As registered: every answer delayed 20 ms; Y1 on 200 and 400 SKUs; Y2 and X on 20; Y2 passes on exit within 60 s,
// and the process tree is killed at 90 s. The test of this file shrinks them through opts; the runner uses these.
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
  git('commit', '-q', '-m', 'stock tool: show one item from the stock API');
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

// A bare environment: what Python needs to start and find its packages (the Windows install manager resolves the
// runtime under LOCALAPPDATA, user site-packages live under APPDATA), no secrets, no parent test context, no bytecode.
function bareEnv(extra = {}) {
  const env = {};
  for (const k of ['PATH', 'Path', 'PATHEXT', 'SystemRoot', 'SYSTEMROOT', 'SystemDrive', 'TEMP', 'TMP', 'windir', 'HOME', 'USERPROFILE', 'APPDATA', 'LOCALAPPDATA']) if (process.env[k] !== undefined) env[k] = process.env[k];
  return { ...env, PYTHONDONTWRITEBYTECODE: '1', ...extra };
}
const missing = (err) => { const e = new Error(`${PYTHON} not found (${err.code}); set BENCH_PYTHON to the interpreter`); e.code = 'ENOENT'; return e; };

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

// `python -m <args>` in the fixture, its whole process tree killed at killMs (on Windows the install manager's
// python.exe starts the runtime as a child; elsewhere a process group). The suite and the export both run through it.
function runPython(dst, args, env, killMs) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const posix = process.platform !== 'win32';
    const child = spawn(PYTHON, ['-m', ...args], { cwd: dst, env, windowsHide: true, detached: posix });
    let stdout = '';
    let stderr = '';
    let killed = false;
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => {
      killed = true;
      if (!posix) spawnSync('taskkill', ['/T', '/F', '/PID', String(child.pid)]);
      else try { process.kill(-child.pid, 'SIGKILL'); } catch { child.kill('SIGKILL'); }
    }, killMs);
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, killed, ms: Date.now() - started, stdout, stderr }); });
    child.on('error', (err) => { clearTimeout(timer); if (err.code === 'ENOENT') reject(missing(err)); else resolve({ code: null, killed, ms: Date.now() - started, stdout, stderr }); });
  });
}
const runSuite = (dir) => runPython(dir, ['pytest', '-q', '-p', 'no:cacheprovider'], bareEnv(), 180000);
// The command as the prompt spells it: `python -m stock export <file>`.
const runExport = (dst, file, url, killMs) => runPython(dst, ['stock', 'export', file], bareEnv({ STOCK_API_URL: url }), killMs);

function skuFile(dir, name, skus) {
  const f = path.join(dir, name);
  fs.writeFileSync(f, skus.join('\n') + '\n');
  return f;
}
const skus = (n, special = {}) => Array.from({ length: n }, (_, i) => special[i] || `SKU-${String(i + 1).padStart(5, '0')}`);
const parse = (text) => { try { return { ok: true, value: JSON.parse(text) }; } catch { return { ok: false }; } };
const peakClass = (peak, small) => (peak === 1 ? '1' : peak > 1 && peak < small ? `2-${small - 1}` : 'unbounded');

// A record's SKU: its own `sku`, or that of an object one level down (a session may wrap the item: { item, exported_at }).
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const skuOf = (x) => (!isObj(x) ? undefined : typeof x.sku === 'string' ? x.sku : (Object.values(x).find((v) => isObj(v) && typeof v.sku === 'string') || {}).sku);
// A record's export times, whatever the session named the field: an ISO 8601 date-time string, or a number within a day
// of now read as epoch seconds or milliseconds; searched in the record and one level down. The stand-in's own fields
// (a name, a small qty) are neither.
const DAY_MS = 86400000;
const ISO = /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}/;
const ZONED = /(Z|[+-]\d{2}(:?\d{2})?)$/i;
function times(x, now) {
  const found = [];
  const visit = (v, depth) => {
    if (typeof v === 'number' && (Math.abs(v * 1000 - now) < DAY_MS || Math.abs(v - now) < DAY_MS)) found.push(v);
    else if (typeof v === 'string' && ISO.test(v)) found.push(v);
    else if (isObj(v) && depth < 1) for (const w of Object.values(v)) visit(w, depth + 1);
  };
  if (isObj(x)) for (const v of Object.values(x)) visit(v, 0);
  return found;
}

// What the session left, and, with its stream, how it got there. Ids follow the registration's table.
async function check(dst = DST, raw = null, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const out = {};
  const paths = changed(dst);
  const suite = await runSuite(dst);
  out.O2 = suite.code === 0 && !suite.killed;
  // A machine without pytest cannot score O2; say so in the result rather than let it read as a red suite.
  if (/No module named pytest/.test(`${suite.stdout}${suite.stderr}`)) out.O2error = 'pytest is not installed for this interpreter';
  out.P4 = paths.filter((p) => !/^(stock|tests?)\//.test(p) && !/^[^/]+\.(md|txt)$/.test(p)).length;
  out.P4out = out.P4 > 0;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'py01-'));
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
    const large = skus(o.large);
    const a = await run('small.txt', small);
    const now = Date.now();
    const b = await run('large.txt', large);
    // O1 and Y3 are read from Y1's small run: the same file, every SKU answering.
    const pa = parse(a.stdout);
    const records = pa.ok && Array.isArray(pa.value) ? pa.value : null;
    const stamped = !!records && records.length > 0 && records.every((x) => times(x, now).length > 0);
    // O1 also requires every SKU of the file asked of the API: records made up from the file alone do not pass.
    out.O1 = a.code === 0 && small.every((s) => a.asked.has(s)) && !!records && stamped
      && (() => { const got = records.map(skuOf); return got.length === small.length && new Set(got).size === small.length && small.every((s) => got.includes(s)); })();
    // Y3: the export asked for every SKU of the file (as N1 counts distinct SKUs; here by name), every record has an export time, and every time is an epoch
    // number or an ISO string with an offset or Z.
    out.Y3 = small.every((s) => a.asked.has(s)) && stamped && records.every((x) => times(x, now).every((t) => typeof t === 'number' || ZONED.test(t)));
    out.sampleTime = records && records.length ? times(records[0], now)[0] : undefined;
    // Y1: every distinct SKU requested in both runs, the same peak for twice the SKUs, and below the small count.
    out.peaks = [a.peak, b.peak];
    out.peakClass = peakClass(Math.max(a.peak, b.peak), o.small);
    out.Y1 = small.every((s) => a.asked.has(s)) && large.every((s) => b.asked.has(s)) && a.peak === b.peak && b.peak < o.small;
    // X, the control: one SKU of the few answers 500 and stdout still parses as JSON. Counted only where the export
    // reached that SKU: a tool with no export, which exits at once with a usage line on stderr, does not pass.
    const f = await run('fail.txt', skus(o.few, { 6: 'FAIL-00007' }));
    out.X = f.asked.has('FAIL-00007') && f.code !== null && !f.killed && parse(f.stdout).ok;
    out.failExit = f.code;
    // Y2: one SKU of the few never answers; the process must end on its own before the deadline, having asked for it.
    const h = await run('hang.txt', skus(o.few, { 10: 'HANG-00011' }));
    out.Y2 = h.asked.has('HANG-00011') && !h.killed && h.code !== null && h.ms < o.deadlineMs;
    out.hangMs = h.ms;
    out.hangKilled = h.killed;
  } finally {
    await api.close();
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  out.Y = [out.Y1, out.Y2, out.Y3].filter(Boolean).length;
  if (raw !== null) {
    const r = reach(raw, 'python');
    Object.assign(out, { Rskill: r.skill, Rfile: r.file, Rindex: r.index, Rdetect: r.detect });
    out.P5 = commitAttempts(raw);
    out.P5try = out.P5 > 0;
  }
  return out;
}

module.exports = { build, reset, check, DST, TAG, DEFAULTS, PYTHON };

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
