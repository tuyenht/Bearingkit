// Driver for the second registration of shell-01 (docs/specs/2026-10-01-stack-shell-design.md, "Addendum 2" and
// "Audit of 2026-10-02"). Adapted from shell-run.cjs, which stays as the record of the first run. Every branch runs
// from the main checkout; before each bench call the tree must be clean and the kit dirs equal the branch. Stops at
// the first failure or when the runner stops itself (quota). Start it from `main`, and leave the checkout alone while
// it runs: it switches branches.
// Usage, from the repository root:
//   node evals/analysis/shell-rep-run.cjs replicate [fromRound=1] [rounds=4]
//     The replication, on a day other than 2026-10-01. Per round: K-before (p4d-shell-before) and K-after (main),
//     each `shell-01 --branches K --runs 2`, the two swapping order every round. Sixteen sessions.
//     Log: evals/results/shell-rep-log.txt.
//   node evals/analysis/shell-rep-run.cjs source [fromRound=1] [rounds=4]
//     The source by slash command (proposal A of the spec). Per round, on main:
//     `shell-01-src --variants command --branches K,S --runs 2`; in round 1 also one natural
//     `shell-01-src --branches S --runs 1`, the day's base for "source loaded". Seventeen sessions.
//     Log: evals/results/shell-src-log.txt.
//     NOT to be used as things stand: the registered gate for this comparison failed in the trial, and the rule that
//     would replace it is only proposed. Run it only after the owner's decision is written in the spec.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const mode = process.argv[2];
if (mode !== 'replicate' && mode !== 'source') { console.error('usage: shell-rep-run.cjs replicate|source [fromRound] [rounds]'); process.exit(2); }
const LOG = path.join(ROOT, 'evals', 'results', mode === 'replicate' ? 'shell-rep-log.txt' : 'shell-src-log.txt');
const CFG = 'C:\\Projects\\Bearingkit\\_build\\profile\\claude';
const BEFORE = 'p4d-shell-before';
const AFTER = 'main';
// The kit K-before must equal (main before shell.md) and the kit K-after must still equal (the merge of shell.md).
const KIT_BEFORE = 'fb45272';
const KIT_AFTER = 'ffa9b91';
const KIT_PATHS = ['skills', 'hooks', 'agents', 'scripts/detect-stack.cjs'];
const FIRST_RUN_DAY = '2026-10-01';
const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const log = (s) => { fs.appendFileSync(LOG, s + '\n'); console.log(s); };
// On a stop, go back to AFTER when the tree allows it.
const die = (s) => {
  log('STOP ' + s);
  if (!sh('git', ['status', '--porcelain']).stdout.trim()) sh('git', ['switch', '-q', AFTER]);
  process.exit(1);
};

// A replication on the day of the first run is not one: the date must differ, local and UTC (the runner names its
// directories by the UTC date).
if (mode === 'replicate') {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  if (today === FIRST_RUN_DAY || now.toISOString().slice(0, 10) === FIRST_RUN_DAY) die(`today is ${today} (UTC ${now.toISOString().slice(0, 10)}), the day of the first run`);
}

const head = (b) => sh('git', ['rev-parse', b]).stdout.trim();
const BRANCHES = mode === 'replicate' ? [BEFORE, AFTER] : [AFTER];
const EXPECT = Object.fromEntries(BRANCHES.map((b) => [b, head(b)]));
for (const b of BRANCHES) if (!/^[0-9a-f]{40}$/.test(EXPECT[b])) die(`branch ${b} does not exist`);
const same = (a, b) => { const r = sh('git', ['diff', a, b, '--', ...KIT_PATHS]); return r.status === 0 && !r.stdout.trim(); };
if (mode === 'replicate' && !same(KIT_BEFORE, BEFORE)) die(`${BEFORE} differs from ${KIT_BEFORE} under ${KIT_PATHS.join(', ')}`);
if (!same(KIT_AFTER, AFTER)) die(`${AFTER} differs from ${KIT_AFTER} under ${KIT_PATHS.join(', ')}: the kit changed since shell.md merged, register K-after again`);

function call(task, branch, branches, runs, variant = 'natural') {
  if (sh('git', ['status', '--porcelain']).stdout.trim()) die(`tree not clean before ${task} ${branch}`);
  const sw = sh('git', ['switch', '-q', branch]);
  if (sw.status !== 0) die(`switch ${branch}: ${sw.stderr}`);
  const diff = sh('git', ['diff', branch, '--', 'skills/', 'hooks/', 'agents/', 'scripts/']).stdout;
  if (diff.trim()) die(`kit dirs differ from ${branch}`);
  // A branch with no command for the variant is dropped by the runner without an error: refuse before it runs.
  if (variant === 'command') {
    const commands = JSON.parse(fs.readFileSync(path.join(ROOT, 'evals', 'bench', task, 'task.json'), 'utf8')).commands || {};
    for (const b of branches.split(',')) if (!commands[b]) die(`${task} has no command for branch ${b} on ${branch}`);
  }
  const before = new Set(fs.readdirSync(path.join(ROOT, 'evals/results')));
  const r = sh('node', ['bin/bearingkit.cjs', 'bench', '--task', task, '--config-dir', CFG, '--branches', branches, '--runs', String(runs), '--variants', variant]);
  const made = fs.readdirSync(path.join(ROOT, 'evals/results')).filter((d) => !before.has(d) && fs.statSync(path.join(ROOT, 'evals/results', d)).isDirectory());
  const dir = made[0] || '?';
  let kit = {};
  let stopped = null;
  try { const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'evals/results', dir, 'meta.json'), 'utf8')); kit = m.kit || {}; stopped = m.stopped || null; } catch { /* reported below */ }
  log(`${new Date().toISOString()} ${task} ${variant} ${branch} ${branches} runs=${runs} exit=${r.status} dir=${dir} kit=${kit.branch}@${String(kit.commit || '').slice(0, 7)} dirty=${kit.dirty}${stopped ? ' STOPPED=' + stopped : ''}`);
  if (r.status !== 0 || stopped || kit.dirty !== false || kit.branch !== branch || kit.commit !== EXPECT[branch]) die(`call failed: ${(r.stdout + r.stderr).split('\n').slice(-4).join(' | ')}`);
  // Every session asked for is there, scored.
  const want = runs * branches.split(',').length;
  const got = fs.readdirSync(path.join(ROOT, 'evals/results', dir)).filter((f) => f.endsWith('.check.json')).length;
  if (got !== want) die(`${dir}: ${got} scored sessions, ${want} expected`);
}

const from = Number(process.argv[3] || 1);
const rounds = Number(process.argv[4] || 4);
for (let i = from; i <= rounds; i++) {
  log(`${new Date().toISOString()} round ${i} of ${rounds} start`);
  if (mode === 'replicate') {
    // K-before first in odd rounds, K-after first in even ones, so neither always runs earlier.
    for (const b of i % 2 ? [BEFORE, AFTER] : [AFTER, BEFORE]) call('shell-01', b, 'K', 2);
  } else {
    call('shell-01-src', AFTER, 'K,S', 2, 'command');
    // The day's unloaded base for the "source loaded" measure: one natural session with the wrapper installed.
    if (i === 1) call('shell-01-src', AFTER, 'S', 1);
  }
  log(`${new Date().toISOString()} round ${i} of ${rounds} complete`);
}
sh('git', ['switch', '-q', AFTER]);
log(`${new Date().toISOString()} DONE ${mode}`);
