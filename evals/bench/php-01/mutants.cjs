'use strict';
// Mutations of the php-01 scorer: each drops one condition of build.cjs, and tests/bench-php-01.test.cjs must turn red
// on every one, at the assertion named for it (an unmutated control must stay green under the same load). Each runs
// on its own copy. The test's output is read as TAP (--test-reporter=tap): Node 25's default reporter prints no
// "# fail N" line.
// Usage, from the repository root: node evals/bench/php-01/mutants.cjs <scratch dir> [M10,M11]
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const MUTANTS = [
  ['M01 H1 ignores the declaration', 'out.H1 = added.length > 0 && ok === added.length;', 'out.H1 = added.length > 0;'],
  ['M02 H1 ignores whether a file was added', 'out.H1 = added.length > 0 && ok === added.length;', 'out.H1 = ok === added.length;'],
  ['M03 H1 accepts some files declared', 'out.H1 = added.length > 0 && ok === added.length;', 'out.H1 = added.length > 0 && ok > 0;'],
  ['M04 H2 ignores the rows moved', " && moved(q.after, 'SKU-1', 'Main', \"O'Hare\", 5);", ';'],
  ['M05 H2 ignores the exit code', 'out.H2 = !q.seedError && q.code === 0 && ', 'out.H2 = !q.seedError && '],
  ['M06 H3 ignores the source refusing', ' && same(s) && same(d);', ' && same(d);'],
  ['M07 H3 ignores the destination refusing', ' && same(s) && same(d);', ' && same(s);'],
  ['M08 H3 ignores O1', 'out.H3 = out.O1 && ', 'out.H3 = '],
  ['M09 no-change ignores tables the run created', '[...new Set([...Object.keys(r.before), ...Object.keys(r.after)])]', 'Object.keys(r.before)'],
  ['M10 X ignores whether rows changed', ' && !x.killed && same(x);', ' && !x.killed;'],
  ['M11 X ignores the exit code', 'x.code !== 0 && ', ''],
  ['M12 X ignores O1', 'out.X = out.O1 && ', 'out.X = '],
  ['M13 O1 ignores the exit code', 'out.O1 = !a.seedError && a.code === 0 && ', 'out.O1 = !a.seedError && '],
  ['M14 O1 ignores the rows moved', " && moved(a.after, 'SKU-1', 'Main', 'North', 5);", ';'],
  ['M15 O2 ignores the suite', 'out.O2 = suite.code === 0 && !suite.killed;', 'out.O2 = true;'],
  ['M16 P4 ignores paths outside', 'out.P4 = st.filter(', 'out.P4 = [].filter('],
  ['M17 a seed failure is not reported', 'if (seeded.status !== 0) return', 'if (false) return'],
  ['M18 moved() ignores extra stock rows', "((tables && tables.stock) || []).length === SEED.length && SEED.every(", 'SEED.every('],
];
const COPY = ['scripts', 'skills/bk-build/references/stacks', 'evals/bench/php-01', 'tests/bench-php-01.test.cjs'];

const scratch = process.argv[2];
if (!scratch) { console.error('usage: node evals/bench/php-01/mutants.cjs <scratch dir>'); process.exit(2); }
const src = fs.readFileSync('evals/bench/php-01/build.cjs', 'utf8');
// At most four at once: under heavier load a run can time out for the load, not for the mutation.
const pool = (tasks, n) => { const out = []; let next = 0; const worker = async () => { while (next < tasks.length) { const i = next++; out[i] = await tasks[i](); } }; return Promise.all(Array.from({ length: n }, worker)).then(() => out); };
// An optional comma-separated list of ids (M10,M11) runs only those, with the control.
const only = process.argv[3] ? process.argv[3].split(',') : null;
const jobs = [['M00 none (control)', '', ''], ...MUTANTS.filter(([name]) => !only || only.includes(name.split(' ')[0]))].map(([name, from, to], i) => () => {
  if (from && !src.includes(from)) return Promise.resolve(`${name}: PATTERN NOT FOUND`);
  const dir = path.join(scratch, `mutant-${i}`);
  fs.rmSync(dir, { recursive: true, force: true });
  for (const p of COPY) fs.cpSync(p, path.join(dir, p), { recursive: true });
  fs.writeFileSync(path.join(dir, 'evals/bench/php-01/build.cjs'), from ? src.split(from).join(to) : src);
  return new Promise((resolve) => exec('node --test --test-reporter=tap tests/bench-php-01.test.cjs', { cwd: dir, timeout: 900000 }, (err, stdout) => {
    const fails = (stdout.match(/# fail (\d+)/) || [])[1];
    const lines = stdout.split('\n');
    const at = lines.findIndex((l) => /error: /.test(l));
    const why = at < 0 ? '' : (lines[at].includes('|-') ? lines[at + 1] : lines[at]).trim().slice(0, 110);
    fs.rmSync(dir, { recursive: true, force: true });
    resolve(`${name}: ${fails === undefined ? 'NO RESULT' : fails !== '0' ? 'RED' : 'GREEN'} ${why}`);
  }));
});
pool(jobs, 4).then((r) => console.log(r.join('\n')));
