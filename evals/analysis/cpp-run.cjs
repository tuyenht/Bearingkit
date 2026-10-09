// RECORD, DONE: the measurement ended on 2026-10-09 (the spec's "Result"); this file starts nothing any more and only
// --dry-run prints. To measure again is a new registration and a new driver.
// Driver for the measurement of cpp-01 (docs/specs/2026-10-08-stack-c-cpp-design.md, "Registered"), on the pattern of
// evals/analysis/shell-run.cjs. Every call runs from the main checkout with its branch checked out; before each the
// tree must be clean, and after each the call's meta.json must name that branch at the head pinned when the driver
// started, with dirty false, and the init of every session of the call must name the registered model and the host
// of the uncounted session. Stops at the first failure or when the runner stops itself (quota); it never re-runs a
// session. Appends two lines per call (its start and its end) to evals/results/cpp-log.txt (untracked, beside the results). It holds no bar.
// Usage, from the repository root, with stack-c-cpp checked out:
//   node evals/analysis/cpp-run.cjs uncounted    — one K-after session
//   node evals/analysis/cpp-run.cjs strial       — one S session
//   node evals/analysis/cpp-run.cjs probe        — two K-after sessions
//   node evals/analysis/cpp-run.cjs calibration  — three K-before sessions
//   node evals/analysis/cpp-run.cjs usable       — four rounds: K-before x2 and K-after x2 (K-before first in rounds 1
//                                                  and 3), then S x2, then F x2
//   node evals/analysis/cpp-run.cjs guard        — four rounds: K-after x2 and S x2 (K-after first in rounds 1 and 3)
//   node evals/analysis/cpp-run.cjs build-01     — eight K-after sessions of build-01, plain prompt
// After a call that stopped early, --from <n> starts at the step's call number n (1 is the first) and --runs <k>
// gives that call the k sessions it never started; a session that began is never run again.
// Add --dry-run to print the calls of a step without switching a branch or starting a session.
'use strict';
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { events } = require('../../scripts/lib/bench-score.cjs');
const ROOT = path.resolve(__dirname, '..', '..');
const RESULTS = path.join(ROOT, 'evals', 'results');
const LOG = path.join(RESULTS, 'cpp-log.txt');
const CFG = 'C:/Projects/Bearingkit/_build/profile/claude';
const MODEL = 'claude-sonnet-5-5';
const BEFORE = 'stack-c-cpp-before';
const AFTER = 'stack-c-cpp';
const THREE = ['skills/bk-build/SKILL.md', 'skills/bk-build/references/stacks/c-cpp.md', 'skills/bk-build/references/stacks/index.md'];

// The calls of each step: [task, branch checked out, runner branch, variant, runs].
const round = (i, usable) => {
  const before = ['cpp-01', BEFORE, 'K', 'command', 2];
  const after = ['cpp-01', AFTER, 'K', 'command', 2];
  const source = ['cpp-01', AFTER, 'S', 'command', 2];
  if (!usable) return i % 2 ? [after, source] : [source, after];
  return [...(i % 2 ? [before, after] : [after, before]), source, ['cpp-01', AFTER, 'F', 'natural', 2]];
};
const STEPS = {
  uncounted: [[['cpp-01', AFTER, 'K', 'command', 1]]],
  strial: [[['cpp-01', AFTER, 'S', 'command', 1]]],
  probe: [[['cpp-01', AFTER, 'K', 'command', 2]]],
  calibration: [[['cpp-01', BEFORE, 'K', 'command', 3]]],
  usable: [1, 2, 3, 4].map((i) => round(i, true)),
  guard: [1, 2, 3, 4].map((i) => round(i, false)),
  'build-01': [[['build-01', AFTER, 'K', 'natural', 8]]],
};

// The calls a command makes: all of a step's, in order, or from its call number `from` (1 is the first) when a call
// stopped early; `runs` then replaces the runs of that first call with the sessions it never started.
function plan(step, from = 1, runs = null) {
  const all = STEPS[step].flatMap((calls, i) => calls.map((c, j) => ({ call: c, round: i + 1, first: j === 0, last: j === calls.length - 1 })));
  if (!Number.isInteger(from) || from < 1 || from > all.length) throw new Error(`--from must be 1 to ${all.length} for ${step}`);
  const rest = all.slice(from - 1);
  if (runs !== null) {
    if (!Number.isInteger(runs) || runs < 1 || runs > rest[0].call[4]) throw new Error(`--runs must be 1 to ${rest[0].call[4]} for call ${from} of ${step}`);
    rest[0] = { ...rest[0], call: [...rest[0].call.slice(0, 4), runs] };
  }
  return rest;
}

// The first session of a call whose init does not name the registered model and the host of the uncounted session,
// or that has no init; null when all do. `host` is null for the uncounted session itself, which sets it.
function initFault(sessions, model, host) {
  for (const x of sessions) {
    if (!x.model || !x.host) return `${x.base}: no init`;
    if (x.model !== model) return `${x.base}: model ${x.model}, registered ${model}`;
    if (host !== null && x.host !== host) return `${x.base}: host ${x.host}, the uncounted session had ${host}`;
  }
  return null;
}

// The host of the uncounted session, from the driver's log; null when the log has none or more than one. A call that
// was cut or stopped sets none.
function hostOf(lines) {
  const seen = new Set(lines.map((l) => l.match(/^\S+ uncounted \S+ \S+ \S+ \S+ runs=1 exit=0 dir=\S+ \S+ dirty=false cut=0 sessions=1 model=\S+ host=(\S+)$/)).filter(Boolean).map((m) => m[1]));
  const one = [...seen][0];
  return seen.size === 1 && /^\d[\d.]*$/.test(one) ? one : null;
}

// True when the log holds a call of the step that made a directory: its sessions began, and are never run again.
function began(lines, step) {
  return lines.some((l) => new RegExp(`^\\S+ ${step} \\S+ \\S+ \\S+ \\S+ runs=\\d+ exit=\\S+ dir=[^?\\s]`).test(l));
}

// The lock: true since the measurement ended. A constant, not a sentence: the log check covers only steps that ran.
const MEASUREMENT_OVER = true;

if (require.main === module) {
  const step = process.argv[2];
  const dry = process.argv.includes('--dry-run');
  if (MEASUREMENT_OVER && !dry) {
    console.error('cpp-run.cjs: the measurement of cpp-01 ended on 2026-10-09 (docs/specs/2026-10-08-stack-c-cpp-design.md, "Result"). This driver is its record and starts no session; only --dry-run prints.');
    process.exit(1);
  }
  const arg = (name) => { const i = process.argv.indexOf(name); return i < 0 ? null : Number(process.argv[i + 1]); };
  const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
  const log = (s) => { if (!dry) { fs.mkdirSync(RESULTS, { recursive: true }); fs.appendFileSync(LOG, s + '\n'); } console.log(s); };
  // On a stop, go back to AFTER when the tree allows it, so the next command finds the branch the driver lives on.
  const die = (s) => {
    log('STOP ' + s);
    if (!dry && !sh('git', ['status', '--porcelain']).stdout.trim()) sh('git', ['switch', '-q', AFTER]);
    process.exit(1);
  };
  if (!STEPS[step]) die(`usage: cpp-run.cjs ${Object.keys(STEPS).join('|')} [--from <call> [--runs <n>]] [--dry-run]`);
  if (arg('--runs') !== null && arg('--from') === null) die('--runs needs --from');
  let todo;
  try { todo = plan(step, arg('--from') ?? 1, arg('--runs')); } catch (e) { die(e.message); }
  const logged = fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split('\n') : [];
  if (!dry && began(logged, step) && arg('--from') === null) die(`${step} already has sessions in the log; resume with --from <call> [--runs <k>]`);
  if (!dry && step === 'uncounted' && began(logged, step)) die('the uncounted session has run');

  // The commits measured: each branch's head when the driver starts must not move during the run.
  const head = (b) => sh('git', ['rev-parse', b]).stdout.trim();
  const EXPECT = { [BEFORE]: head(BEFORE), [AFTER]: head(AFTER) };
  for (const b of [BEFORE, AFTER]) if (!/^[0-9a-f]{40}$/.test(EXPECT[b])) die(`branch ${b} does not exist`);
  // K-before is K-after without the stack file and with the two count sentences as on main: three paths, no more.
  const names = sh('git', ['diff', '--name-only', BEFORE, AFTER]).stdout.split('\n').filter(Boolean).sort();
  if (JSON.stringify(names) !== JSON.stringify(THREE)) die(`${BEFORE} and ${AFTER} differ by ${names.join(', ') || 'nothing'}; expected ${THREE.join(', ')}`);
  // The heads are pinned in the log by the first command and every later command must find them unmoved.
  const pinLine = `PIN ${BEFORE}=${EXPECT[BEFORE]} ${AFTER}=${EXPECT[AFTER]}`;
  const pins = [...new Set(logged.filter((l) => l.startsWith('PIN ')))];
  if (!dry && step !== 'uncounted' && !pins.length) die('no heads pinned: the uncounted session comes first');
  if (!dry && pins.length && (pins.length !== 1 || pins[0] !== pinLine)) die(`heads moved: logged ${pins.join(' / ')}, now ${pinLine}`);
  if (!dry && !pins.length) log(pinLine);
  if (!dry && arg('--from') !== null) log(`${new Date().toISOString()} RESUME ${step} from=${arg('--from')} runs=${arg('--runs')}`);
  // Every session after the uncounted one must name its host.
  const HOST = step === 'uncounted' ? null : hostOf(logged);
  if (step !== 'uncounted' && HOST === null && !dry) die('the log holds no single host of an uncounted session');

  const run = ([task, branch, branches, variant, runs]) => {
    const line = `${step} ${task} ${branch} ${branches} ${variant} runs=${runs}`;
    if (dry) { console.log(`would run: ${line}`); return; }
    if (sh('git', ['status', '--porcelain']).stdout.trim()) die(`tree not clean before ${line}`);
    const sw = sh('git', ['switch', '-q', branch]);
    if (sw.status !== 0) die(`switch ${branch}: ${sw.stderr}`);
    if (head('HEAD') !== EXPECT[branch]) die(`${branch} moved since the driver started`);
    const before = new Set(fs.existsSync(RESULTS) ? fs.readdirSync(RESULTS) : []);
    log(`${new Date().toISOString()} START ${line}`);
    const r = sh('node', ['bin/bearingkit.cjs', 'bench', '--task', task, '--config-dir', CFG, '--model', MODEL, '--branches', branches, '--variants', variant, '--runs', String(runs)]);
    const made = fs.readdirSync(RESULTS).filter((d) => !before.has(d) && fs.statSync(path.join(RESULTS, d)).isDirectory());
    const dir = made[0] || '?';
    let kit = {};
    let stopped = null;
    let cut = [];
    try { const m = JSON.parse(fs.readFileSync(path.join(RESULTS, dir, 'meta.json'), 'utf8')); kit = m.kit || {}; stopped = m.stopped || null; cut = m.cut || []; } catch { /* reported below */ }
    // The init of every session of the call: its model and its host.
    const sessions = made.length ? fs.readdirSync(path.join(RESULTS, dir)).filter((n) => n.endsWith('.raw.jsonl')).sort().map((f) => {
      const init = events(fs.readFileSync(path.join(RESULTS, dir, f), 'utf8')).find((e) => e.type === 'system' && e.subtype === 'init') || {};
      return { base: f.replace('.raw.jsonl', ''), model: init.model || null, host: init.claude_code_version || null };
    }) : [];
    const set = (k) => [...new Set(sessions.map((x) => x[k] || 'none'))].join(',') || '?';
    log(`${new Date().toISOString()} ${line} exit=${r.status} dir=${dir} kit=${kit.branch}@${String(kit.commit || '').slice(0, 7)} dirty=${kit.dirty} cut=${cut.length} sessions=${sessions.length} model=${set('model')} host=${set('host')}${stopped ? ' STOPPED=' + stopped : ''}`);
    const fault = initFault(sessions, MODEL, HOST);
    if (fault) die(`init, nothing is judged and the owner decides: ${fault}`);
    if (r.status !== 0 || stopped || made.length !== 1 || kit.dirty !== false || kit.branch !== branch || kit.commit !== EXPECT[branch] || sessions.length !== runs) die(`call failed: ${(r.stdout + r.stderr).split('\n').slice(-4).join(' | ')}`);
  };

  const rounds = STEPS[step].length;
  todo.forEach(({ call, round, first, last }, i) => {
    if (rounds > 1 && (first || i === 0)) log(`${new Date().toISOString()} ${step} round ${round} of ${rounds} ${first ? 'start' : 'resumed'}`);
    run(call);
    if (rounds > 1 && last) log(`${new Date().toISOString()} ${step} round ${round} of ${rounds} complete`);
  });
  if (!dry) sh('git', ['switch', '-q', AFTER]);
  log(`${new Date().toISOString()} DONE ${step}`);
}

module.exports = { STEPS, BEFORE, AFTER, THREE, MODEL, MEASUREMENT_OVER, plan, initFault, hostOf, began };
