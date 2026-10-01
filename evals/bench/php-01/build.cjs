'use strict';
// Fixture of benchmark task php-01 (registered in docs/specs/2026-09-28-stack-php-laravel-design.md): a small plain-PHP
// stock tool on SQLite asked for a transfer command that moves a quantity between two warehouses. Scored after the
// session by running its own `php bin/stock.php transfer <sku> <from> <to> <qty>` on fresh databases built from its
// final schema.sql by db.php (which stays with the scorer): H1 strict types in the PHP files it added, H2 bound SQL
// parameters (a quote in a warehouse name), H3 one transaction (a write refused by a trigger, on either side), each a
// sentence of stacks/php-laravel.md; O1 the happy path, O2 the suite, X a refused over-transfer (the control).
// The executable is process.env.BENCH_PHP, else `php` on the PATH.
// Usage: node build.cjs [--dst <dir>] [--reset] [--check]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { commitAttempts, reach } = require('../../../scripts/lib/bench-score.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/php-01';
// A ref outside refs/tags, so `git log --decorate` in the session does not name the benchmark.
const TAG = 'refs/bench/php-01';
const APP = path.join(__dirname, 'app');
const DB = path.join(__dirname, 'db.php');
const PHP = process.env.BENCH_PHP || 'php';
// Each run killed at runMs; the suite at suiteMs.
const DEFAULTS = { runMs: 60000, suiteMs: 180000 };

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
  git('commit', '-q', '-m', 'stock tool: show quantities per warehouse');
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

// What the session left, from git: [status, path] relative to the fixture root.
function status(dst) {
  const r = spawnSync('git', ['status', '--porcelain', '-uall'], { cwd: dst, encoding: 'utf8' });
  return r.stdout.split('\n').filter(Boolean).map((l) => [l.slice(0, 2), l.slice(3).replace(/^"|"$/g, '').split(' -> ').pop()]);
}

// A bare environment: what PHP needs to start on Windows, no secrets, no parent test context.
function bareEnv(extra = {}) {
  const env = {};
  for (const k of ['PATH', 'Path', 'PATHEXT', 'SystemRoot', 'SYSTEMROOT', 'SystemDrive', 'TEMP', 'TMP', 'windir', 'HOME', 'USERPROFILE']) if (process.env[k] !== undefined) env[k] = process.env[k];
  return { ...env, ...extra };
}
const missing = (err) => { const e = new Error(`${PHP} not found (${err.code}); set BENCH_PHP to the interpreter`); e.code = 'ENOENT'; return e; };

// `php <script> <args>` in dir, killed at killMs. Arguments go straight to argv, no shell, so a quote reaches the program
// intact. Spelled `php -f <script> -- <args>`, which gives the script the same $argv: under `node --test` on the owner's
// machine, spawning php with a file as its first argument fails with EPERM while `-f` runs (cause not found).
function runPhp(dir, script, args, env, killMs) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const child = spawn(PHP, ['-f', script, '--', ...args], { cwd: dir, env, windowsHide: true });
    let stdout = '';
    let stderr = '';
    let killed = false;
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    const timer = setTimeout(() => { killed = true; child.kill('SIGKILL'); }, killMs);
    child.on('close', (code) => { clearTimeout(timer); resolve({ code, killed, ms: Date.now() - started, stdout, stderr }); });
    child.on('error', (err) => { clearTimeout(timer); if (err.code === 'ENOENT') reject(missing(err)); else resolve({ code: null, killed, ms: Date.now() - started, stdout, stderr }); });
  });
}
const helper = (args) => {
  const r = spawnSync(PHP, ['-f', DB, '--', ...args], { encoding: 'utf8', env: bareEnv(), windowsHide: true });
  if (r.error && r.error.code === 'ENOENT') throw missing(r.error);
  return r;
};
const dump = (db) => { const r = helper(['dump', db]); try { return JSON.parse(r.stdout); } catch { return null; } };
const qty = (tables, sku, warehouse) => {
  const row = ((tables && tables.stock) || []).map((j) => JSON.parse(j)).find((x) => x.sku === sku && x.warehouse === warehouse);
  return row ? Number(row.qty) : undefined;
};
// The seeded stock rows, as db.php writes them; a run passes a check only if every other row stayed as seeded.
const SEED = [['SKU-1', 'Main', 40], ['SKU-1', 'North', 12], ['SKU-1', "O'Hare", 7], ['SKU-2', 'Main', 100], ['SKU-2', 'North', 30]];
// The stock table holds the seeded rows and no other; another table (a transfer log) may gain rows.
const moved = (tables, sku, from, to, n) => ((tables && tables.stock) || []).length === SEED.length && SEED.every(([s, w, q]) => qty(tables, s, w) === (s === sku && w === from ? q - n : s === sku && w === to ? q + n : q));

// What the session left, and, with its stream, how it got there. Ids follow the registration's table.
async function check(dst = DST, raw = null, opts = {}) {
  const o = { ...DEFAULTS, ...opts };
  const out = {};
  const st = status(dst);
  const suite = await runPhp(dst, 'tests/run.php', [], bareEnv(), o.suiteMs);
  out.O2 = suite.code === 0 && !suite.killed;
  out.P4 = st.filter(([, p]) => !/^(bin|src|tests)\//.test(p) && p !== 'schema.sql' && !/^[^/]+\.(md|txt)$/.test(p)).length;
  out.P4out = out.P4 > 0;
  // H1: every PHP file the session added starts with the declaration, and there is at least one.
  const added = st.filter(([s, p]) => (s === '??' || s[0] === 'A') && p.endsWith('.php')).map(([, p]) => p);
  const strict = added.length ? JSON.parse(helper(['strict', ...added.map((p) => path.join(dst, p))]).stdout || '{}') : {};
  const ok = Object.values(strict).filter(Boolean).length;
  out.added = added;
  out.H1class = !added.length ? 'none-added' : ok === added.length ? 'all' : ok === 0 ? 'none' : 'some';
  out.H1 = added.length > 0 && ok === added.length;
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'php01-'));
  const schema = path.join(dst, 'schema.sql');
  // One transfer on a fresh seeded database, a warehouse optionally refusing writes; the tables read back after.
  let n = 0;
  const transfer = async (args, refuse = null) => {
    const db = path.join(tmp, `run-${++n}.sqlite`);
    const seeded = helper(['seed', db, schema]);
    if (seeded.status !== 0) return { seedError: (seeded.stderr || seeded.stdout).trim().slice(0, 300) };
    const before = dump(db);
    if (refuse) {
      const refused = helper(['refuse', db, refuse]);
      if (refused.status !== 0) return { refuseError: (refused.stderr || refused.stdout).trim().slice(0, 300) };
    }
    const r = await runPhp(dst, 'bin/stock.php', ['transfer', ...args], bareEnv({ STOCK_DB: db }), o.runMs);
    return { ...r, before, after: dump(db) };
  };
  // Every table's rows as before; a table the run created (a log the session creates on first use) must be empty.
  const same = (r) => !!r.before && !!r.after && [...new Set([...Object.keys(r.before), ...Object.keys(r.after)])]
    .every((t) => JSON.stringify(r.before[t] || []) === JSON.stringify(r.after[t] || []));
  try {
    const a = await transfer(['SKU-1', 'Main', 'North', '5']);
    if (a.seedError) out.seedError = a.seedError;
    out.O1 = !a.seedError && a.code === 0 && !a.killed && moved(a.after, 'SKU-1', 'Main', 'North', 5);
    const q = await transfer(['SKU-1', 'Main', "O'Hare", '5']);
    out.H2 = !q.seedError && q.code === 0 && !q.killed && moved(q.after, 'SKU-1', 'Main', "O'Hare", 5);
    // H3: the source refusing, then the destination; neither run may leave a row changed. Counted only where O1 holds,
    // so a transfer that never writes does not pass.
    const s = await transfer(['SKU-1', 'Main', 'North', '5'], 'Main');
    const d = await transfer(['SKU-1', 'Main', 'North', '5'], 'North');
    // A refusal the helper could not install scores nothing and is reported, not read as a pass.
    if (s.refuseError || d.refuseError) out.refuseError = s.refuseError || d.refuseError;
    out.H3runs = [same(s), same(d)];
    out.H3 = out.O1 && !s.killed && !d.killed && same(s) && same(d);
    // X, the control: more than North holds (12) must exit non-zero and change nothing. Counted only where O1 holds:
    // the untouched tool, which has no transfer, exits 2 at once and changes nothing too.
    const x = await transfer(['SKU-1', 'North', 'Main', '50']);
    out.X = out.O1 && !x.seedError && x.code !== 0 && x.code !== null && !x.killed && same(x);
    out.overExit = x.code;
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  out.H = [out.H1, out.H2, out.H3].filter(Boolean).length;
  if (raw !== null) {
    const r = reach(raw, 'php-laravel');
    Object.assign(out, { Rskill: r.skill, Rfile: r.file, Rindex: r.index, Rdetect: r.detect });
    out.P5 = commitAttempts(raw);
    out.P5try = out.P5 > 0;
  }
  return out;
}

module.exports = { build, reset, check, DST, TAG, DEFAULTS, PHP };

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
