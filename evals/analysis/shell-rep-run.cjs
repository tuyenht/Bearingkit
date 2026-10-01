// Driver for the second registration of shell-01 (docs/specs/2026-10-01-stack-shell-design.md, "Addendum 2"): the
// replication on another day (K-after against K-before, natural) and the comparison with the source read by both
// sides (the command variant of shell-01-src, K against the wrapped source). Adapted from shell-run.cjs, which stays
// as the record of the first run. Every branch runs from the main checkout; before each bench call the tree must be
// clean and the kit dirs equal the branch. Stops at the first failure or when the runner stops itself (quota).
// Appends one line per call to evals/results/shell-rep-log.txt (untracked, beside the results).
// Usage, from the repository root, on a day other than 2026-10-01:
//   node evals/analysis/shell-rep-run.cjs [fromRound=1] [rounds=4]
//     per round: K-before (p4d-shell-before) `shell-01 --branches K --runs 2`,
//                K-after (main)              `shell-01 --branches K --runs 2`,
//                both by command (main)      `shell-01-src --variants command --branches K,S --runs 2`
//     round 1 only: one natural `shell-01-src --branches S --runs 1`, the day's base for "source loaded"
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const LOG = path.join(ROOT, 'evals', 'results', 'shell-rep-log.txt');
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

// A replication on the day of the first run is not one: the local date must differ.
// Local and UTC (the runner names its directories by the UTC date).
const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
if (today === FIRST_RUN_DAY || now.toISOString().slice(0, 10) === FIRST_RUN_DAY) die(`today is ${today} (UTC ${now.toISOString().slice(0, 10)}), the day of the first run`);

const head = (b) => sh('git', ['rev-parse', b]).stdout.trim();
const EXPECT = { [BEFORE]: head(BEFORE), [AFTER]: head(AFTER) };
for (const b of [BEFORE, AFTER]) if (!/^[0-9a-f]{40}$/.test(EXPECT[b])) die(`branch ${b} does not exist`);
const same = (a, b) => { const r = sh('git', ['diff', a, b, '--', ...KIT_PATHS]); return r.status === 0 && !r.stdout.trim(); };
if (!same(KIT_BEFORE, BEFORE)) die(`${BEFORE} differs from ${KIT_BEFORE} under ${KIT_PATHS.join(', ')}`);
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

const from = Number(process.argv[2] || 1);
const rounds = Number(process.argv[3] || 4);
for (let i = from; i <= rounds; i++) {
  log(`${new Date().toISOString()} round ${i} of ${rounds} start`);
  // K-before first in odd rounds, K-after first in even ones, so neither always runs earlier.
  for (const b of i % 2 ? [BEFORE, AFTER] : [AFTER, BEFORE]) call('shell-01', b, 'K', 2);
  call('shell-01-src', AFTER, 'K,S', 2, 'command');
  // The day's unloaded base for the "source loaded" measure: one natural session with the wrapper installed.
  // Part of the proposed amendment: delete this line if the owner declines it.
  if (i === 1) call('shell-01-src', AFTER, 'S', 1);
  log(`${new Date().toISOString()} round ${i} of ${rounds} complete`);
}
sh('git', ['switch', '-q', AFTER]);
log(`${new Date().toISOString()} DONE`);
