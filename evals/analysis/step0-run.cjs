// Step 0 measurement driver, run on 2026-09-30 from the session scratchpad with absolute paths; this copy has the
// paths made relative and was not re-run (kept for the record and as the pattern for interleaved K rounds) (docs/specs/2026-09-28-stack-rule-timing.md, registration as corrected in d45c61b).
// Usage, from the repository root: node evals/analysis/step0-run.cjs <task> [rounds=4]   — node-01 or py-01: K-old (main) and K-new+S (p4-step0-scope)
//        node evals/analysis/step0-run.cjs build-01            — eight K-new sessions (p4-step0-scope)
// Every branch runs from the main checkout; before each round the tree must be clean and the kit dirs equal the branch.
// Stops at the first failure or when the runner stops itself (quota). Appends one line per round to evals/results/step0-log.txt.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '..', '..');
const LOG = path.join(ROOT, 'evals', 'results', 'step0-log.txt'); // untracked, beside the results
const CFG = 'C:\\Projects\\Bearingkit\\_build\\profile\\claude';
const sh = (cmd, args) => spawnSync(cmd, args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 });
const log = (s) => { fs.appendFileSync(LOG, s + '\n'); console.log(s); };
const die = (s) => { log('STOP ' + s); process.exit(1); };

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
  if (r.status !== 0 || stopped || kit.dirty !== false || kit.branch !== branch) die(`round failed: ${(r.stdout + r.stderr).split('\n').slice(-4).join(' | ')}`);
}

const task = process.argv[2];
if (task === 'build-01') round('build-01', 'p4-step0-scope', 'K', 8);
else {
  const rounds = Number(process.argv[3] || 4);
  for (let i = 1; i <= rounds; i++) {
    round(task, 'main', 'K', 2);
    round(task, 'p4-step0-scope', 'K,S', 2);
  }
}
sh('git', ['switch', '-q', 'main']);
log(`${new Date().toISOString()} DONE ${task}`);
