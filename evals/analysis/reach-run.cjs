// Driver for the bk-build stack-reach measurement (docs/specs/2026-10-01-bk-build-stack-reach-design.md), adapted
// from evals/analysis/step0-run.cjs. Every branch runs from the main checkout; before each round the tree must be
// clean and the kit dirs equal the branch. Stops at the first failure or when the runner stops itself (quota).
// Appends one line per round to evals/results/reach-log.txt (untracked, beside the results).
// Usage, from the repository root:
//   node evals/analysis/reach-run.cjs php-01 [fromRound=1] [rounds=4]  — per round: K-before (p4a-php) K x2,
//                                                                        then K-after and S (p4c-build-reach) x2
//   node evals/analysis/reach-run.cjs build-01                         — eight K-after sessions (p4c-build-reach)
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const LOG = path.join(ROOT, 'evals', 'results', 'reach-log.txt');
const CFG = 'C:\\Projects\\Bearingkit\\_build\\profile\\claude';
const BEFORE = 'p4a-php';
const AFTER = 'p4c-build-reach';
const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const log = (s) => { fs.appendFileSync(LOG, s + '\n'); console.log(s); };
// On a stop, go back to AFTER when the tree allows it: this driver exists only on that branch, so the resume command
// needs it checked out.
const die = (s) => {
  log('STOP ' + s);
  if (!sh('git', ['status', '--porcelain']).stdout.trim()) sh('git', ['switch', '-q', AFTER]);
  process.exit(1);
};

// The commits the registration measured: each branch's head when the driver starts must not move during the run.
const head = (b) => sh('git', ['rev-parse', b]).stdout.trim();
const EXPECT = { [BEFORE]: head(BEFORE), [AFTER]: head(AFTER) };

function round(task, branch, branches, runs) {
  if (sh('git', ['status', '--porcelain']).stdout.trim()) die(`tree not clean before ${task} ${branch}`);
  const sw = sh('git', ['switch', '-q', branch]);
  if (sw.status !== 0) die(`switch ${branch}: ${sw.stderr}`);
  const diff = sh('git', ['diff', branch, '--', 'skills/', 'hooks/', 'agents/', 'scripts/']).stdout;
  if (diff.trim()) die(`kit dirs differ from ${branch}`);
  const before = new Set(fs.readdirSync(path.join(ROOT, 'evals/results')));
  const r = sh('node', ['bin/bearingkit.cjs', 'bench', '--task', task, '--config-dir', CFG, '--branches', branches, '--runs', String(runs)]);
  const made = fs.readdirSync(path.join(ROOT, 'evals/results')).filter((d) => !before.has(d));
  const dir = made[0] || '?';
  let kit = {};
  let stopped = null;
  try { const m = JSON.parse(fs.readFileSync(path.join(ROOT, 'evals/results', dir, 'meta.json'), 'utf8')); kit = m.kit || {}; stopped = m.stopped || null; } catch { /* reported below */ }
  log(`${new Date().toISOString()} ${task} ${branch} ${branches} exit=${r.status} dir=${dir} kit=${kit.branch}@${String(kit.commit || '').slice(0, 7)} dirty=${kit.dirty}${stopped ? ' STOPPED=' + stopped : ''}`);
  if (r.status !== 0 || stopped || kit.dirty !== false || kit.branch !== branch || kit.commit !== EXPECT[branch]) die(`round failed: ${(r.stdout + r.stderr).split('\n').slice(-4).join(' | ')}`);
}

const task = process.argv[2];
if (task === 'build-01') round('build-01', AFTER, 'K', 8);
else if (task === 'php-01') {
  const from = Number(process.argv[3] || 1);
  const rounds = Number(process.argv[4] || 4);
  for (let i = from; i <= rounds; i++) {
    log(`${new Date().toISOString()} round ${i} of ${rounds} start`);
    round(task, BEFORE, 'K', 2);
    round(task, AFTER, 'K,S', 2);
    log(`${new Date().toISOString()} round ${i} of ${rounds} complete`);
  }
} else die('usage: reach-run.cjs php-01 [fromRound] [rounds] | build-01');
sh('git', ['switch', '-q', AFTER]);
log(`${new Date().toISOString()} DONE ${task}`);
