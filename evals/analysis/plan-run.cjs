// Driver for the interleaved run of plan-01 (docs/specs/2026-10-03-bk-plan-design.md, "Step 5": PROPOSED until the
// owner approves its bars; this driver runs no session before that). Modelled on spec-guard-run.cjs, with a fourth
// branch: the floor runs interleaved with the others, since only branches run side by side compare.
// Every branch runs from the main checkout; before each bench call the tree must be clean and the kit dirs equal the
// branch. Stops at the first failure or when the runner stops itself (quota), and then goes back to K-after's branch
// when the tree allows it. It runs from the branch p5b-bk-plan only: start it there. Node holds the whole script in
// memory before the first switch, and nothing is required after it, so the file may vanish from the tree while
// K-before is checked out. Leave the checkout alone while it runs: it switches branches.
// Usage, from the repository root:
//   node evals/analysis/plan-run.cjs [--dry] [--no-s] [fromRound=1] [lastRound=4]
//     Per round four bench calls of `plan-01 --runs 2`: K on p5b-bk-plan-before (K-before), K on p5b-bk-plan
//     (K-after), S on p5b-bk-plan (the sources), F on p5b-bk-plan (no plugin). The order rotates by one place a
//     round, so in four rounds every branch runs first, second, third and last once. Eight sessions a branch.
//     --no-s  drops the S call (the S trial session was refused by the host): three calls a round; over four rounds
//             the rotation then repeats, so one branch runs first twice.
//     --dry   prints the plan and runs every check before a call (clean tree, switch, kit dirs), runs no session and
//             writes nothing.
//     The two numbers are the first and the last round to run. A round that stopped halfway is run again whole when
//     resumed, so its finished calls give extra sessions: which directories count is then decided from the log and
//     written in the spec, before any plan is read.
//     Log: evals/results/plan-run-2-log.txt, the second run's own (the first run's is evals/results/plan-run-log.txt,
//     copied to evals/bench/plan-01/run-2026-10-06/). Only the result directories named there go into the tally. A
//     session the runner cut at its time limit is logged (`cut=`).
'use strict';
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const USAGE = 'usage: plan-run.cjs [--dry] [--no-s] [fromRound=1] [lastRound=4]';
const RESULTS = path.join(ROOT, 'evals', 'results');
const LOG = path.join(RESULTS, 'plan-run-2-log.txt');
const CFG = 'C:/Projects/Bearingkit/_build/profile/claude';
const TASK = 'plan-01';
const RUNS = 2;
const BENCH = ['bin/bearingkit.cjs', 'bench', '--task', TASK, '--config-dir', CFG, '--runs', String(RUNS)];
const BEFORE = 'p5b-bk-plan-before';
const AFTER = 'p5b-bk-plan';
// The frozen commit (K-after): nothing a session loads may differ from it (FROZEN_PATHS below).
// The second freeze of the text (the spec, "Second freeze of the text"); the second run measures it.
const FROZEN = 'afa1a463bc8986e797f13455202c19c4e89eec0f';
// The first freeze, which the first run measured. The second differs from it, in everything a session loads, in the
// one file the second freeze edited: the fixture, the rubric, the gate's plans and the kit's code are the first run's.
const FIRST_FROZEN = '789662576f52db8d14ed6f337301f7c35852689b';
const SECOND_FREEZE = ['skills/bk-plan/SKILL.md'];
// K-before is the parent of the first freeze, the same commit as in the first run; its branch is local only, so the
// driver holds it to this commit.
const BEFORE_COMMIT = '531ad2c3fefcf4f516da8ad55d22704fe1622d0d';
// The whole kit directories, not only scripts/detect-stack.cjs.
const KIT_PATHS = ['skills', 'hooks', 'agents', 'scripts', '.claude-plugin'];
// K-before and K-after differ in these seven files and, of what a session can reach, in nothing else.
const TEXT_PATHS = ['skills', 'NOTICE', 'upstream/sources.json'];
const SEVEN = ['NOTICE', 'skills/bk-plan/SKILL.md', 'skills/bk-plan/references/vertical-slices.md', 'skills/bk-plan/references/writing-plans.md', 'skills/bk-plan/tests/01-plan-tree-with-evidence-per-step.md', 'skills/bk-plan/tests/04-phases-are-slices-not-layers.md', 'upstream/sources.json'];
// Of the task, everything registered as frozen: the fixture, its check, the task file, the rubric, the gate's plans
// and their expected marks. The evidence beside them (keys, readings, calibration-*) is a record and may grow.
const GATE_FILES = ['expected.json', ...Array.from({ length: 14 }, (_, i) => `g${String(i + 1).padStart(2, '0')}.md`)];
const SAME_PATHS = ['hooks', 'agents', 'scripts', '.claude-plugin', 'bin', ...['app', 'build.cjs', 'task.json', 'rubric.md', ...GATE_FILES.map((f) => 'gate/' + f)].map((p) => 'evals/bench/plan-01/' + p)];
const CALLS = { before: [BEFORE, 'K'], after: [AFTER, 'K'], S: [AFTER, 'S'], F: [AFTER, 'F'] };
// The registration of the run is PROPOSED in the spec until the owner approves its bars. Until this is set to true
// in a commit that names the owner's approval, only --dry runs: no session can start by accident.
const BARS_APPROVED = true;

// Round i starts one place further along, so no branch always runs first.
function order(i, noS = false) {
  const base = noS ? ['before', 'after', 'F'] : ['before', 'after', 'S', 'F'];
  const k = (i - 1) % base.length;
  return [...base.slice(k), ...base.slice(0, k)];
}

// The command line: flags and at most two round numbers, none above the four rounds of the run; null when it is not
// one this driver takes.
function parse(argv) {
  const flags = argv.filter((a) => a.startsWith('--'));
  const nums = argv.filter((a) => !a.startsWith('--'));
  if (flags.some((f) => f !== '--dry' && f !== '--no-s') || nums.length > 2 || nums.some((n) => !/^[1-9]\d*$/.test(n))) return null;
  const from = Number(nums[0] || 1);
  const last = Number(nums[1] || 4);
  if (from > last || last > 4) return null;
  return { dry: flags.includes('--dry'), noS: flags.includes('--no-s'), from, last };
}

module.exports = { order, parse, CALLS, SEVEN, SAME_PATHS, KIT_PATHS, FROZEN, FIRST_FROZEN, SECOND_FREEZE, BEFORE_COMMIT, BEFORE, AFTER, RUNS, BARS_APPROVED };

function main(opts) {
  const { dry: DRY, noS: NO_S, from, last: rounds } = opts;
  const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
  const log = (s) => { if (!DRY) fs.appendFileSync(LOG, s + '\n'); console.log(s); };
  const clean = () => { const r = sh('git', ['status', '--porcelain']); return r.status === 0 && !r.stdout.trim(); };
  // On a stop, go back to AFTER when the tree allows it.
  const die = (s) => {
    log('STOP ' + s);
    if (clean()) sh('git', ['switch', '-q', AFTER]);
    process.exit(1);
  };
  // Anything thrown (a directory that cannot be read, a file gone) stops the run the same way, with its line in the log.
  process.on('uncaughtException', (e) => die(`unexpected error: ${e && e.message || e}`));
  const head = (b) => sh('git', ['rev-parse', '--verify', '-q', b + '^{commit}']).stdout.trim();
  // An empty diff counts only when git itself succeeded.
  const diffNames = (a, b, paths) => {
    const r = sh('git', ['diff', '--name-only', a, b, '--', ...paths]);
    if (r.status !== 0) die(`git diff ${a} ${b}: ${r.stderr.trim()}`);
    return r.stdout.split('\n').map((l) => l.trim()).filter(Boolean).sort();
  };

  // Checks made once, before anything is switched.
  const start = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']).stdout.trim();
  if (start !== AFTER) { console.error(`start this driver from ${AFTER}; the checkout is on ${start}`); process.exit(2); }
  if (!DRY) fs.mkdirSync(RESULTS, { recursive: true });
  if (!clean()) die('tree not clean at the start');
  const EXPECT = { [BEFORE]: head(BEFORE), [AFTER]: head(AFTER) };
  for (const b of [BEFORE, AFTER]) if (!/^[0-9a-f]{40}$/.test(EXPECT[b])) die(`branch ${b} does not exist`);
  if (head(FROZEN) !== FROZEN) die(`the frozen commit ${FROZEN} is not in this repository`);
  if (EXPECT[BEFORE] !== BEFORE_COMMIT) die(`${BEFORE} is at ${EXPECT[BEFORE]}, not at the registered K-before ${BEFORE_COMMIT}`);
  const seven = diffNames(BEFORE, AFTER, TEXT_PATHS);
  if (seven.join('\n') !== [...SEVEN].sort().join('\n')) die(`${BEFORE} and ${AFTER} differ under ${TEXT_PATHS.join(', ')} in [${seven.join(', ')}], not in the seven registered files`);
  // Not skills/ alone: K-after is the frozen commit in everything a session loads, whatever was committed after it.
  const FROZEN_PATHS = [...new Set([...KIT_PATHS, ...TEXT_PATHS, ...SAME_PATHS])];
  const moved = diffNames(FROZEN, AFTER, FROZEN_PATHS);
  if (moved.length) die(`${AFTER} differs from the frozen commit ${FROZEN.slice(0, 7)} under ${FROZEN_PATHS.join(', ')}: ${moved.join(', ')}`);
  if (head(FIRST_FROZEN) !== FIRST_FROZEN) die(`the first frozen commit ${FIRST_FROZEN} is not in this repository`);
  const second = diffNames(FIRST_FROZEN, FROZEN, FROZEN_PATHS);
  if (second.join('\n') !== [...SECOND_FREEZE].sort().join('\n')) die(`the second freeze ${FROZEN.slice(0, 7)} differs from the first ${FIRST_FROZEN.slice(0, 7)} in [${second.join(', ')}], not in ${SECOND_FREEZE.join(', ')} alone`);
  const drift = diffNames(BEFORE, AFTER, SAME_PATHS);
  if (drift.length) die(`${BEFORE} and ${AFTER} differ outside the text: ${drift.join(', ')}`);

  function call(name) {
    const [branch, branches] = CALLS[name];
    if (!clean()) die(`tree not clean before ${name}`);
    const sw = sh('git', ['switch', '-q', branch]);
    if (sw.status !== 0) die(`switch ${branch}: ${sw.stderr.trim()}`);
    if (head('HEAD') !== EXPECT[branch]) die(`${branch} moved since the start: ${head('HEAD')} is not ${EXPECT[branch]}`);
    // The working tree against the branch: tracked files by the diff, untracked ones by the status.
    const diff = sh('git', ['diff', '--name-only', branch, '--', ...KIT_PATHS]);
    if (diff.status !== 0 || diff.stdout.trim() || !clean()) die(`kit dirs differ from ${branch}`);
    if (DRY) { console.log(`  dry: ${name}: ${branch}@${EXPECT[branch].slice(0, 7)} clean, kit dirs equal; would run bench --task ${TASK} --branches ${branches} --runs ${RUNS}`); return; }
    const r = sh('node', [...BENCH, '--branches', branches]);
    // The runner names its directory in its last line; an empty directory left from before is reused by it, so a
    // listing of what appeared would miss it.
    const named = /^results: (.+)[\\/]results\.md\s*$/m.exec(r.stdout || '');
    const dir = named ? path.basename(named[1]) : '?';
    let kit = {};
    let stopped = null;
    let cut = [];
    try { const m = JSON.parse(fs.readFileSync(path.join(RESULTS, dir, 'meta.json'), 'utf8')); kit = m.kit || {}; stopped = m.stopped || null; cut = m.cut || []; } catch { /* reported below */ }
    log(`${new Date().toISOString()} ${TASK} natural ${name} ${branch} ${branches} runs=${RUNS} exit=${r.status} dir=${dir} kit=${kit.branch}@${String(kit.commit || '').slice(0, 7)} dirty=${kit.dirty}${cut.length ? ' cut=' + cut.join(',') : ''}${stopped ? ' STOPPED=' + stopped : ''}`);
    if (!named || path.resolve(path.dirname(named[1])).toLowerCase() !== RESULTS.toLowerCase()) die(`the runner named no result directory under evals/results: ${(r.stdout + r.stderr).split('\n').slice(-4).join(' | ')}`);
    if (r.status !== 0 || stopped || kit.dirty !== false || kit.branch !== branch || kit.commit !== EXPECT[branch]) die(`call failed: ${(r.stdout + r.stderr).split('\n').slice(-4).join(' | ')}`);
    // Every session asked for is there, with its check; a check that threw leaves a file holding only its error.
    const checks = fs.readdirSync(path.join(RESULTS, dir)).filter((f) => f.endsWith('.check.json'));
    if (checks.length !== RUNS) die(`${dir}: ${checks.length} checked sessions, ${RUNS} expected`);
    for (const f of checks) {
      const c = JSON.parse(fs.readFileSync(path.join(RESULTS, dir, f), 'utf8'));
      if (c.error) die(`${dir}/${f}: the check failed: ${c.error}`);
    }
  }

  // What the runner itself refuses (sources not as released, memory files above the fixture) is found now, not after
  // the first sessions: `--dry-run` returns before any session and writes nothing. It does not look at the profile.
  if (!fs.existsSync(CFG)) die(`the profile ${CFG} does not exist`);
  for (const b of NO_S ? ['K', 'F'] : ['K', 'S', 'F']) {
    const r = sh('node', [...BENCH, '--branches', b, '--dry-run']);
    if (r.status !== 0 || !new RegExp(`^${RUNS} sessions: `, 'm').test(r.stdout || '')) die(`the runner refuses branch ${b}: ${(r.stdout + r.stderr).trim().split('\n').slice(-4).join(' | ')}`);
  }

  console.log(`plan: rounds ${from} to ${rounds}${NO_S ? ', no S' : ''}${DRY ? ', dry' : ''}; K-before ${BEFORE}@${EXPECT[BEFORE].slice(0, 7)}, K-after ${AFTER}@${EXPECT[AFTER].slice(0, 7)} (text frozen at ${FROZEN.slice(0, 7)})`);
  for (let i = from; i <= rounds; i++) console.log(`  round ${i}: ${order(i, NO_S).join(', ')}`);
  for (let i = from; i <= rounds; i++) {
    log(`${new Date().toISOString()} round ${i} of ${rounds} start${NO_S ? ' (no S)' : ''}`);
    for (const name of order(i, NO_S)) call(name);
    log(`${new Date().toISOString()} round ${i} of ${rounds} complete`);
  }
  if (!clean()) die('tree not clean at the end');
  sh('git', ['switch', '-q', AFTER]);
  log(`${new Date().toISOString()} DONE plan-run${NO_S ? ' (no S)' : ''}`);
}

if (require.main === module) {
  const opts = parse(process.argv.slice(2));
  if (!opts) { console.error(USAGE); process.exit(2); }
  if (!opts.dry && !BARS_APPROVED) { console.error('the bars of this run are not approved yet (BARS_APPROVED is false): only --dry runs'); process.exit(2); }
  main(opts);
}
