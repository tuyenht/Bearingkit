// Driver of stage 2 of the bk-spec step (docs/specs/2026-10-08-bk-spec-stack-reach-design.md, "Planned registration,
// stage 2" and "Stage 2 registered"), on the pattern of evals/analysis/step0-run.cjs for the interleaved rounds and of
// evals/analysis/plan-run.cjs and cpp-run.cjs for the rotating order, the approval constant and the checks. Every call
// runs from the main checkout with its branch checked out; before each the tree must be clean, and after each the
// call's meta.json must name that branch at its pinned head, with dirty false, and the init of every session must
// name the registered model and the host of stage 2's uncounted session. Stops at the first failure or when the
// runner stops itself (quota); it never re-runs a session. Appends two lines per call to
// evals/results/bk-spec-reach-log.txt (untracked, beside the results). It holds no bar.
// Usage, from the repository root, with main checked out:
//   node evals/analysis/bk-spec-reach-run.cjs uncounted  — one K-after session of node-01, plain prompt
//   node evals/analysis/bk-spec-reach-run.cjs node-01    — twelve rounds of node-01
//   node evals/analysis/bk-spec-reach-run.cjs py-01      — twelve rounds of py-01
//   node evals/analysis/bk-spec-reach-run.cjs guard      — eight K-after sessions of build-01 (only once the spec
//                                                          records that bars 1 to 4 hold)
// The steps run in that order, each only after the one before it logged DONE; the counted steps also wait for a
// line of the spec that records the uncounted session read by hand, and the guard for the line that bars 1 to 4 hold.
// A round is K-before x2 and K-after x2, K-before first in odd rounds and K-after first in even ones; rounds 1, 4, 7
// and 10 add S x2 after the two K calls. --from <n> starts at call number n of the step (1 is the first) and --runs
// <k> gives that call the k sessions it never started; --to <n> stops after call n. A session that began is never run
// again. Add --dry-run to print the calls without switching a branch or starting a session.
'use strict';
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { events } = require('../../scripts/lib/bench-score.cjs');
const { initFault, hostOf } = require('./cpp-run.cjs');
const ROOT = path.resolve(__dirname, '..', '..');
const RESULTS = path.join(ROOT, 'evals', 'results');
const LOG = path.join(RESULTS, 'bk-spec-reach-log.txt');
const LOCK = path.join(RESULTS, 'bk-spec-reach-run.lock');
const SPEC = path.join(ROOT, 'docs', 'specs', '2026-10-08-bk-spec-stack-reach-design.md');
const CFG = 'C:/Projects/Bearingkit/_build/profile/claude';
const MODEL = 'claude-sonnet-5-5';
const BEFORE = 'bk-spec-reach-before';
const AFTER = 'bk-spec-reach';
const BEFORE_COMMIT = '7a461e4bffd168fa91fa05a4fdd2c217d08a96e7'; // stage 1's registered commit
const AFTER_COMMIT = 'dfdb3d5dae31dd2aad770374e1ba670da10d2862'; // the three edits, frozen by the probe (item 3)
const PATHS = ['skills', 'hooks', 'agents', 'scripts', 'NOTICE', 'upstream'];
const ONE = ['skills/bk-spec/SKILL.md'];
const LABEL = '"Duyệt giai đoạn 2 (Recommended)"'; // the owner's label, as the spec's "Stage 2 registered" copies it
const BARS_HELD = '**Bars 1 to 4 hold**'; // the guard's precondition, written into the spec through the gate
const UNCOUNTED_READ = '**Stage 2 uncounted session read**'; // the counted steps' precondition, likewise

// The approval constant: true from the commit that records the owner's label for stage 2 (2026-10-14).
const BARS_APPROVED = true;

// The calls of a round of one task: [task, branch checked out, runner branch, variant, runs].
function round(task, i) {
  const before = [task, BEFORE, 'K', 'natural', 2];
  const after = [task, AFTER, 'K', 'natural', 2];
  const k = i % 2 ? [before, after] : [after, before];
  return [1, 4, 7, 10].includes(i) ? [...k, [task, AFTER, 'S', 'natural', 2]] : k;
}
const rounds = (task) => Array.from({ length: 12 }, (_, i) => round(task, i + 1));
const STEPS = {
  uncounted: [[['node-01', AFTER, 'K', 'natural', 1]]],
  'node-01': rounds('node-01'),
  'py-01': rounds('py-01'),
  guard: [[['build-01', AFTER, 'K', 'natural', 8]]],
};

// The calls a command makes: a step's, from call number `from` to call number `to` (1 is the first); `runs` replaces
// the runs of the first call with the sessions it never started.
function plan(step, from = 1, runs = null, to = null) {
  const all = STEPS[step].flatMap((calls, i) => calls.map((c, j) => ({ call: c, round: i + 1, first: j === 0, last: j === calls.length - 1 })));
  if (!Number.isInteger(from) || from < 1 || from > all.length) throw new Error(`--from must be 1 to ${all.length} for ${step}`);
  const end = to === null ? all.length : to;
  if (!Number.isInteger(end) || end < from || end > all.length) throw new Error(`--to must be ${from} to ${all.length} for ${step}`);
  const rest = all.slice(from - 1, end);
  if (runs !== null) {
    if (!Number.isInteger(runs) || runs < 1 || runs > rest[0].call[4]) throw new Error(`--runs must be 1 to ${rest[0].call[4]} for call ${from} of ${step}`);
    rest[0] = { ...rest[0], call: [...rest[0].call.slice(0, 4), runs] };
  }
  return rest;
}

// The spec on main must hold the owner's label for stage 2; the counted steps, a line beginning with UNCOUNTED_READ
// (the uncounted session read by hand: completed, not cut, loaded with the marker); the guard, a line beginning with
// BARS_HELD. A quoted mention inside a sentence is not such a line.
function approvalFault(specText, step) {
  if (!BARS_APPROVED) return 'BARS_APPROVED is false';
  const i = specText.indexOf('## Stage 2 registered');
  if (i < 0 || !specText.slice(i).includes(LABEL)) return `the spec records no owner's label ${LABEL} under "Stage 2 registered"`;
  const lines = specText.slice(i).split('\n');
  if (step !== 'uncounted' && !lines.some((l) => l.startsWith(UNCOUNTED_READ))) return `${step} runs only once the spec has a line beginning ${UNCOUNTED_READ}`;
  if (step === 'guard' && !lines.some((l) => l.startsWith(BARS_HELD))) return `the guard runs only once the spec has a line beginning ${BARS_HELD}`;
  return null;
}

// The uncounted session sets the host only if it named the registered model.
const hostNamed = (lines) => hostOf(lines.filter((l) => l.includes(` model=${MODEL} host=`)));

// The sessions of a step that have begun, from the log: the sum of the sessions of its ended calls; null when a call
// has a START line and no end line (a crash or a power cut), whose folder the session counts by hand.
function begunOf(lines, step) {
  let open = false; let n = 0;
  for (const l of lines) {
    if (new RegExp(`^\\S+ START ${step} `).test(l)) { if (open) return null; open = true; continue; }
    const m = l.match(new RegExp(`^\\S+ ${step} \\S+ \\S+ \\S+ \\S+ runs=\\d+ exit=\\S+ dir=\\S+ .* sessions=(\\d+) `));
    if (m) { open = false; n += Number(m[1]); }
  }
  return open ? null : n;
}
// A command must start where the step's begun sessions end: --from and --runs must imply exactly that many.
function resumeFault(step, from, runs, begun) {
  if (begun === null) return `${step} has a call with a START and no end line: count its folders; the owner decides`;
  const all = STEPS[step].flat();
  const implied = all.slice(0, from - 1).reduce((s, c) => s + c[4], 0) + (runs === null ? 0 : all[from - 1][4] - runs);
  return implied === begun ? null : `${step}: ${begun} sessions have begun, --from ${from}${runs === null ? '' : ` --runs ${runs}`} implies ${implied}`;
}
// The steps that must be done first.
const NEED = { 'node-01': ['uncounted'], 'py-01': ['node-01'], guard: ['node-01', 'py-01'] };

if (require.main === module) {
  const step = process.argv[2];
  const dry = process.argv.includes('--dry-run');
  const arg = (name) => { const i = process.argv.indexOf(name); return i < 0 ? null : Number(process.argv[i + 1]); };
  const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
  const log = (s) => { if (!dry) { fs.mkdirSync(RESULTS, { recursive: true }); fs.appendFileSync(LOG, s + '\n'); } console.log(s); };
  // On a stop, the process that holds the lock and has moved the branch goes back to main when the tree allows it.
  let locked = false; let moved = false;
  const die = (s) => {
    log('STOP ' + s);
    if (!dry && locked && moved && !sh('git', ['status', '--porcelain']).stdout.trim()) sh('git', ['switch', '-q', 'main']);
    process.exit(1);
  };
  if (!STEPS[step]) die(`usage: bk-spec-reach-run.cjs ${Object.keys(STEPS).join('|')} [--from <call> [--runs <n>]] [--to <call>] [--dry-run]`);
  if (arg('--runs') !== null && arg('--from') === null) die('--runs needs --from');
  let todo;
  try { todo = plan(step, arg('--from') ?? 1, arg('--runs'), arg('--to')); } catch (e) { die(e.message); }
  // One driver at a time: the lock is taken before the spec and the log are read, and released on exit.
  if (!dry) {
    try { fs.mkdirSync(RESULTS, { recursive: true }); fs.closeSync(fs.openSync(LOCK, 'wx')); locked = true; }
    catch { die(`${LOCK} exists: another run is live, or one died; the owner removes it`); }
    process.on('exit', () => { try { fs.unlinkSync(LOCK); } catch { /* gone */ } });
  }
  const fault = approvalFault(fs.readFileSync(SPEC, 'utf8'), step);
  if (fault && dry) console.log(`(a real run would stop: ${fault})`);
  if (fault && !dry) die(fault);
  const logged = fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split(/\r?\n/) : [];
  const rf = resumeFault(step, arg('--from') ?? 1, arg('--runs'), begunOf(logged, step));
  if (rf && dry) console.log(`(a real run would stop: ${rf})`);
  if (!dry && rf) die(rf);
  const miss = (NEED[step] || []).find((s) => !logged.some((l) => new RegExp(`^\\S+ DONE ${s}$`).test(l)));
  if (miss && dry) console.log(`(a real run would stop: ${step} needs ${miss} done first)`);
  if (!dry && miss) die(`${step} needs ${miss} done first`);

  const head = (b) => sh('git', ['rev-parse', b]).stdout.trim();
  if (!dry && head('HEAD') !== head('main')) die('start from main: the driver lives there');
  // The two texts: pinned heads, and they differ by the one file over the registered paths.
  if (head(BEFORE) !== BEFORE_COMMIT) die(`${BEFORE} is ${head(BEFORE) || 'missing'}, registered ${BEFORE_COMMIT}`);
  if (head(AFTER) !== AFTER_COMMIT) die(`${AFTER} is ${head(AFTER) || 'missing'}, registered ${AFTER_COMMIT}`);
  const names = sh('git', ['diff', '--name-only', BEFORE, AFTER, '--', ...PATHS]).stdout.split('\n').filter(Boolean).sort();
  if (JSON.stringify(names) !== JSON.stringify(ONE)) die(`${BEFORE} and ${AFTER} differ by ${names.join(', ') || 'nothing'}; expected ${ONE.join(', ')}`);
  const all = sh('git', ['diff', '--name-only', BEFORE, AFTER]).stdout.split('\n').filter(Boolean).sort();
  if (JSON.stringify(all) !== JSON.stringify(ONE)) die(`${BEFORE} and ${AFTER} differ, over every path, by ${all.join(', ') || 'nothing'}; expected ${ONE.join(', ')}`);
  if (!dry && arg('--from') !== null) log(`${new Date().toISOString()} RESUME ${step} from=${arg('--from')} runs=${arg('--runs')} to=${arg('--to')}`);
  // Every session after the uncounted one must name its host.
  const HOST = step === 'uncounted' ? null : hostNamed(logged);
  if (step !== 'uncounted' && HOST === null && !dry) die('the log holds no single host of an uncounted session');
  const EXPECT = { [BEFORE]: BEFORE_COMMIT, [AFTER]: AFTER_COMMIT };

  const run = ([task, branch, branches, variant, runs]) => {
    const line = `${step} ${task} ${branch} ${branches} ${variant} runs=${runs}`;
    if (dry) { console.log(`would run: ${line}`); return; }
    if (sh('git', ['status', '--porcelain']).stdout.trim()) die(`tree not clean before ${line}`);
    moved = true;
    const sw = sh('git', ['switch', '-q', branch]);
    if (sw.status !== 0) die(`switch ${branch}: ${sw.stderr}`);
    if (head('HEAD') !== EXPECT[branch]) die(`${branch} moved`);
    const before = new Set(fs.existsSync(RESULTS) ? fs.readdirSync(RESULTS) : []);
    log(`${new Date().toISOString()} START ${line}`);
    const r = sh('node', ['bin/bearingkit.cjs', 'bench', '--task', task, '--config-dir', CFG, '--model', MODEL, '--branches', branches, '--variants', variant, '--runs', String(runs)]);
    const made = fs.readdirSync(RESULTS).filter((d) => !before.has(d) && fs.statSync(path.join(RESULTS, d)).isDirectory());
    const dir = made[0] || '?';
    let kit = {}; let stopped = null; let cut = [];
    try { const m = JSON.parse(fs.readFileSync(path.join(RESULTS, dir, 'meta.json'), 'utf8')); kit = m.kit || {}; stopped = m.stopped || null; cut = m.cut || []; } catch { /* reported below */ }
    const sessions = made.length ? fs.readdirSync(path.join(RESULTS, dir)).filter((n) => n.endsWith('.raw.jsonl')).sort().map((f) => {
      const init = events(fs.readFileSync(path.join(RESULTS, dir, f), 'utf8')).find((e) => e.type === 'system' && e.subtype === 'init') || {};
      return { base: f.replace('.raw.jsonl', ''), model: init.model || null, host: init.claude_code_version || null };
    }) : [];
    const set = (k) => [...new Set(sessions.map((x) => x[k] || 'none'))].join(',') || '?';
    log(`${new Date().toISOString()} ${line} exit=${r.status} dir=${dir} kit=${kit.branch}@${String(kit.commit || '').slice(0, 7)} dirty=${kit.dirty} cut=${cut.length} sessions=${sessions.length} model=${set('model')} host=${set('host')}${stopped ? ' STOPPED=' + stopped : ''}`);
    const f = initFault(sessions, MODEL, HOST);
    if (f) die(`init, nothing is judged and the owner decides: ${f}`);
    if (r.status !== 0 || stopped || made.length !== 1 || kit.dirty !== false || kit.branch !== branch || kit.commit !== EXPECT[branch] || sessions.length !== runs) die(`call failed: ${(r.stdout + r.stderr).split('\n').slice(-4).join(' | ')}`);
  };

  const n = STEPS[step].length;
  todo.forEach(({ call, round: rd, first, last }, i) => {
    if (n > 1 && (first || i === 0)) log(`${new Date().toISOString()} ${step} round ${rd} of ${n} ${first ? 'start' : 'resumed'}`);
    run(call);
    if (n > 1 && last) log(`${new Date().toISOString()} ${step} round ${rd} of ${n} complete`);
  });
  if (!dry && sh('git', ['switch', '-q', 'main']).status !== 0) die('switch back to main failed');
  const partial = arg('--to') !== null && arg('--to') < STEPS[step].flat().length;
  log(`${new Date().toISOString()} DONE ${step}${partial ? ` to=${arg('--to')}` : ''}`);
}

module.exports = { STEPS, SPEC, BEFORE, AFTER, BEFORE_COMMIT, AFTER_COMMIT, PATHS, ONE, MODEL, LABEL, BARS_HELD, UNCOUNTED_READ, BARS_APPROVED, NEED, round, plan, approvalFault, hostNamed, begunOf, resumeFault };
