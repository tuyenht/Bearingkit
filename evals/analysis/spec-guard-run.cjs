// Driver for the guard run of spec-01 (docs/specs/2026-10-02-bk-spec-design.md, "Calibration on the floor" and
// "The text, frozen for the guard path"). Modelled on shell-rep-run.cjs. Every branch runs from the main checkout;
// before each bench call the tree must be clean and the kit dirs equal the branch. Stops at the first failure or when
// the runner stops itself (quota), and then goes back to K-after's branch when the tree allows it.
// This file exists on p5a-bk-spec only: start it from that branch. Node holds the whole script in memory before the
// first switch, and nothing is required after it, so the file may vanish from the tree while K-before is checked out.
// Leave the checkout alone while it runs: it switches branches.
// Usage, from the repository root:
//   node evals/analysis/spec-guard-run.cjs [--dry] [--no-s] [fromRound=1] [lastRound=4]
//     Per round three bench calls of `spec-01 --runs 2`: K on p5a-bk-spec-before (K-before), K on p5a-bk-spec
//     (K-after), S on p5a-bk-spec (the sources; the task is the same on both branches). The order rotates: round 1
//     before, after, S; round 2 after, S, before; round 3 S, before, after; round 4 as round 1. Eight sessions a branch.
//     --no-s  drops the S call (the S trial session was refused by the host): two calls a round, before and after
//             swapping order every round.
//     --dry   prints the plan and runs every check before a call (clean tree, switch, kit dirs), runs no session and
//             writes nothing.
//     The two numbers are the first and the last round to run (`3 4` runs rounds 3 and 4). A round that stopped
//     halfway is run again whole when resumed, so its finished calls give extra sessions: which directories count is
//     then decided from the log and written in the spec, before any spec is read.
//     Log: evals/results/spec-guard-log.txt. Only the result directories named there go into the tally. A session the
//     runner cut at its time limit is logged (`cut=`) and counted with what it left, as registered.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const flags = process.argv.slice(2).filter((a) => a.startsWith('--'));
const nums = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const USAGE = 'usage: spec-guard-run.cjs [--dry] [--no-s] [fromRound=1] [lastRound=4]';
if (flags.some((f) => f !== '--dry' && f !== '--no-s') || nums.length > 2 || nums.some((n) => !/^[1-9]\d*$/.test(n))) { console.error(USAGE); process.exit(2); }
const DRY = flags.includes('--dry');
const NO_S = flags.includes('--no-s');
const RESULTS = path.join(ROOT, 'evals', 'results');
const LOG = path.join(RESULTS, 'spec-guard-log.txt');
const CFG = 'C:/Projects/Bearingkit/_build/profile/claude';
const TASK = 'spec-01';
const RUNS = 2;
const BENCH = ['bin/bearingkit.cjs', 'bench', '--task', TASK, '--config-dir', CFG, '--runs', String(RUNS)];
const BEFORE = 'p5a-bk-spec-before';
const AFTER = 'p5a-bk-spec';
// The frozen commit (K-after): nothing a session loads may differ from it (FROZEN_PATHS below).
const FROZEN = 'f2237b015e0589d5f28116e19611d8782a7e880d';
// The whole kit directories, not only scripts/detect-stack.cjs as the model checks.
const KIT_PATHS = ['skills', 'hooks', 'agents', 'scripts'];
// K-before and K-after differ in these seven files and, of what a session can reach, in nothing else.
const TEXT_PATHS = ['skills', 'NOTICE', 'upstream/sources.json'];
const SEVEN = ['NOTICE', 'skills/bk-spec/SKILL.md', 'skills/bk-spec/references/brainstorming.md', 'skills/bk-spec/references/domain-language.md', 'skills/bk-spec/references/module-design.md', 'skills/bk-spec/references/prototyping.md', 'upstream/sources.json'];
const SAME_PATHS = ['hooks', 'agents', 'scripts', 'bin', 'evals/bench/spec-01'];
// The owner's decision: the run starts only after the weekly limit reopens, 2026-10-07 10:00 in Vietnam.
const NOT_BEFORE = '2026-10-07T03:00:00Z';

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
if (!DRY && Date.now() < Date.parse(NOT_BEFORE)) { console.error(`it is ${new Date().toISOString()}, before ${NOT_BEFORE}: the run waits for the weekly limit to reopen (--dry runs the checks only)`); process.exit(2); }
if (!DRY) fs.mkdirSync(RESULTS, { recursive: true });
if (!clean()) die('tree not clean at the start');
const EXPECT = { [BEFORE]: head(BEFORE), [AFTER]: head(AFTER) };
for (const b of [BEFORE, AFTER]) if (!/^[0-9a-f]{40}$/.test(EXPECT[b])) die(`branch ${b} does not exist`);
if (head(FROZEN) !== FROZEN) die(`the frozen commit ${FROZEN} is not in this repository`);
const seven = diffNames(BEFORE, AFTER, TEXT_PATHS);
if (seven.join('\n') !== [...SEVEN].sort().join('\n')) die(`${BEFORE} and ${AFTER} differ under ${TEXT_PATHS.join(', ')} in [${seven.join(', ')}], not in the seven registered files`);
// Not skills/ alone: K-after is the frozen commit in everything a session loads, whatever was committed after it.
const FROZEN_PATHS = [...new Set([...KIT_PATHS, ...TEXT_PATHS, ...SAME_PATHS])];
const moved = diffNames(FROZEN, AFTER, FROZEN_PATHS);
if (moved.length) die(`${AFTER} differs from the frozen commit ${FROZEN.slice(0, 7)} under ${FROZEN_PATHS.join(', ')}: ${moved.join(', ')}`);
const drift = diffNames(BEFORE, AFTER, SAME_PATHS);
if (drift.length) die(`${BEFORE} and ${AFTER} differ outside the text: ${drift.join(', ')}`);

const from = Number(nums[0] || 1);
const rounds = Number(nums[1] || 4);
if (from > rounds) { console.error(USAGE); process.exit(2); }
const CALLS = { before: [BEFORE, 'K'], after: [AFTER, 'K'], S: [AFTER, 'S'] };
// Round i starts one place further along, so no branch always runs first.
const order = (i) => {
  const base = NO_S ? ['before', 'after'] : ['before', 'after', 'S'];
  const k = (i - 1) % base.length;
  return [...base.slice(k), ...base.slice(0, k)];
};

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
  // Every session asked for is there, scored; a check that threw leaves a file holding only its error.
  const checks = fs.readdirSync(path.join(RESULTS, dir)).filter((f) => f.endsWith('.check.json'));
  if (checks.length !== RUNS) die(`${dir}: ${checks.length} scored sessions, ${RUNS} expected`);
  for (const f of checks) {
    const c = JSON.parse(fs.readFileSync(path.join(RESULTS, dir, f), 'utf8'));
    if (c.error) die(`${dir}/${f}: the check failed: ${c.error}`);
  }
}

// What the runner itself refuses (sources not as released, memory files above the fixture) is found now, not after
// the first sessions: `--dry-run` returns before any session and writes nothing. It does not look at the profile.
if (!fs.existsSync(CFG)) die(`the profile ${CFG} does not exist`);
for (const b of NO_S ? ['K'] : ['K', 'S']) {
  const r = sh('node', [...BENCH, '--branches', b, '--dry-run']);
  if (r.status !== 0 || !new RegExp(`^${RUNS} sessions: `, 'm').test(r.stdout || '')) die(`the runner refuses branch ${b}: ${(r.stdout + r.stderr).trim().split('\n').slice(-4).join(' | ')}`);
}

console.log(`plan: rounds ${from} to ${rounds}${NO_S ? ', no S' : ''}${DRY ? ', dry' : ''}; K-before ${BEFORE}@${EXPECT[BEFORE].slice(0, 7)}, K-after ${AFTER}@${EXPECT[AFTER].slice(0, 7)} (text frozen at ${FROZEN.slice(0, 7)})`);
for (let i = from; i <= rounds; i++) console.log(`  round ${i}: ${order(i).join(', ')}`);
for (let i = from; i <= rounds; i++) {
  log(`${new Date().toISOString()} round ${i} of ${rounds} start${NO_S ? ' (no S)' : ''}`);
  for (const name of order(i)) call(name);
  log(`${new Date().toISOString()} round ${i} of ${rounds} complete`);
}
if (!clean()) die('tree not clean at the end');
sh('git', ['switch', '-q', AFTER]);
log(`${new Date().toISOString()} DONE guard${NO_S ? ' (no S)' : ''}`);
