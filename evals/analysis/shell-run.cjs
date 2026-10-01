// Driver for the usable path of shell-01 (docs/specs/2026-10-01-stack-shell-design.md), adapted from
// evals/analysis/reach-run.cjs. Every branch runs from the main checkout; before each bench call the tree must be
// clean and the kit dirs equal the branch. Stops at the first failure or when the runner stops itself (quota).
// Appends one line per call to evals/results/shell-log.txt (untracked, beside the results).
// Usage, from the repository root:
//   node evals/analysis/shell-run.cjs shell-01 [fromRound=1] [rounds=4]  — per round: K-before (p4d-shell-before) K x2,
//       then K-after and S (p4d-shell) x2, with the floor in the same call: F x2 in rounds 1 and 2, F x1 in round 3
//       (five new F sessions, added to the three of the calibration)
//   node evals/analysis/shell-run.cjs build-01                           — eight K-after sessions (p4d-shell)
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const LOG = path.join(ROOT, 'evals', 'results', 'shell-log.txt');
const CFG = 'C:\\Projects\\Bearingkit\\_build\\profile\\claude';
const BEFORE = 'p4d-shell-before';
const AFTER = 'p4d-shell';
const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const log = (s) => { fs.appendFileSync(LOG, s + '\n'); console.log(s); };
// On a stop, go back to AFTER when the tree allows it, so the resume command finds the branch it was started from.
const die = (s) => {
  log('STOP ' + s);
  if (!sh('git', ['status', '--porcelain']).stdout.trim()) sh('git', ['switch', '-q', AFTER]);
  process.exit(1);
};

// The commits measured: each branch's head when the driver starts must not move during the run.
const head = (b) => sh('git', ['rev-parse', b]).stdout.trim();
const EXPECT = { [BEFORE]: head(BEFORE), [AFTER]: head(AFTER) };
// K-before must be what the registration says: the kit as on main (no shell.md, no profile for a bare tree).
if (!/^[0-9a-f]{40}$/.test(EXPECT[BEFORE])) die(`branch ${BEFORE} does not exist`);
const kitDiff = sh('git', ['diff', 'main', BEFORE, '--', 'skills', 'hooks', 'agents', 'scripts/detect-stack.cjs']);
if (kitDiff.status !== 0 || kitDiff.stdout.trim()) die(`${BEFORE} differs from main under skills, hooks, agents or scripts/detect-stack.cjs`);

function call(task, branch, branches, runs) {
  if (sh('git', ['status', '--porcelain']).stdout.trim()) die(`tree not clean before ${task} ${branch}`);
  const sw = sh('git', ['switch', '-q', branch]);
  if (sw.status !== 0) die(`switch ${branch}: ${sw.stderr}`);
  const diff = sh('git', ['diff', branch, '--', 'skills/', 'hooks/', 'agents/', 'scripts/']).stdout;
  if (diff.trim()) die(`kit dirs differ from ${branch}`);
  const before = new Set(fs.readdirSync(path.join(ROOT, 'evals/results')));
  const r = sh('node', ['bin/bearingkit.cjs', 'bench', '--task', task, '--config-dir', CFG, '--branches', branches, '--runs', String(runs)]);
  const made = fs.readdirSync(path.join(ROOT, 'evals/results')).filter((d) => !before.has(d) && fs.statSync(path.join(ROOT, 'evals/results', d)).isDirectory());
  const dir = made[0] || '?';
  let kit = {};
  let stopped = null;
  try { const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'evals/results', dir, 'meta.json'), 'utf8')); kit = m.kit || {}; stopped = m.stopped || null; } catch { /* reported below */ }
  log(`${new Date().toISOString()} ${task} ${branch} ${branches} runs=${runs} exit=${r.status} dir=${dir} kit=${kit.branch}@${String(kit.commit || '').slice(0, 7)} dirty=${kit.dirty}${stopped ? ' STOPPED=' + stopped : ''}`);
  if (r.status !== 0 || stopped || kit.dirty !== false || kit.branch !== branch || kit.commit !== EXPECT[branch]) die(`call failed: ${(r.stdout + r.stderr).split('\n').slice(-4).join(' | ')}`);
}

// New floor sessions per round: 2, 2, 1, 0.
const FLOOR = { 1: 2, 2: 2, 3: 1, 4: 0 };
const task = process.argv[2];
if (task === 'build-01') call('build-01', AFTER, 'K', 8);
else if (task === 'shell-01') {
  const from = Number(process.argv[3] || 1);
  const rounds = Number(process.argv[4] || 4);
  for (let i = from; i <= rounds; i++) {
    log(`${new Date().toISOString()} round ${i} of ${rounds} start`);
    call(task, BEFORE, 'K', 2);
    call(task, AFTER, 'K,S', 2);
    if (FLOOR[i]) call(task, AFTER, 'F', FLOOR[i]);
    log(`${new Date().toISOString()} round ${i} of ${rounds} complete`);
  }
} else die('usage: shell-run.cjs shell-01 [fromRound] [rounds] | build-01');
sh('git', ['switch', '-q', AFTER]);
log(`${new Date().toISOString()} DONE ${task}`);
