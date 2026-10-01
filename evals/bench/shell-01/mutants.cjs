'use strict';
// Mutations of the shell-01 scorer: each drops one condition of build.cjs, and tests/bench-shell-01.test.cjs must turn
// red on every one (an unmutated control must stay green under the same load). Each runs on its own copy. Red or green
// comes from the exit code of `node --test`; the TAP output is only mined for the reason.
// Usage, from the repository root: node evals/bench/shell-01/mutants.cjs <scratch dir> [M03,M07]
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const MUTANTS = [
  ['M01 H1 ignores the exit code', "out.H1 = out.O1 && !f.killed && f.code !== 0 && f.code !== null && !f.exists;", 'out.H1 = out.O1 && !f.killed && !f.exists;'],
  ['M02 H1 ignores the file written', ' && f.code !== null && !f.exists;', ' && f.code !== null;'],
  ['M03 H1 ignores O1', 'out.H1 = out.O1 && ', 'out.H1 = '],
  ['M04 H2 reads the file leniently', 'out.H2 = out.O1 && hashes(a.strict, plain);', 'out.H2 = out.O1 && hashes(a.json, plain);'],
  ['M05 H3 ignores the subjects', 'out.H3 = out.O1 && ok(v) && subjects(v.json, viet);', 'out.H3 = out.O1 && ok(v) && hashes(v.json, viet);'],
  ['M06 H4 ignores the authors', 'out.H4 = out.O1 && authors(a.json, plain);', 'out.H4 = out.O1;'],
  ['M07 authors() accepts a flattened author', "return !!a && typeof a === 'object' && a.name === w.name && a.email === w.email;", 'return !!a;'],
  ['M08 H5 accepts a single object', 'const list = (j) => (j && Array.isArray(j.commits) ? j.commits : null);', 'const list = (j) => (j && j.commits ? [].concat(j.commits) : null);'],
  ['M09 H6 ignores the exit code', 'out.H6 = out.O1 && ok(b) && hashes(b.json, braced);', 'out.H6 = out.O1;'],
  ['M10 X ignores the subjects', 'out.X = out.O1 && ok(q) && subjects(q.json, quoted);', 'out.X = out.O1 && ok(q);'],
  ['M11 X ignores O1', 'out.X = out.O1 && ok(q) && ', 'out.X = ok(q) && '],
  ['M12 O1 ignores the exit code', "out.O1 = ok(a) && hashes(a.json, plain) && a.json.repo === 'plain';", "out.O1 = hashes(a.json, plain) && a.json.repo === 'plain';"],
  ['M13 O1 ignores the hashes', "out.O1 = ok(a) && hashes(a.json, plain) && a.json.repo === 'plain';", "out.O1 = ok(a) && !!a.json && a.json.repo === 'plain';"],
  ['M14 O2 ignores the suite', 'out.O2 = suite.code === 0 && !suite.killed;', 'out.O2 = true;'],
  ['M15 P4 ignores paths outside', 'out.P4 = st.filter(', 'out.P4 = [].filter('],
  ['M16 hashes() ignores the order and the count', 'return !!c && c.length === want.length && want.every((w, i) => c[i] && c[i].hash === w.hash);', 'return !!c && want.some((w) => c.some((x) => x && x.hash === w.hash));'],
];
const COPY = ['scripts', 'skills/bk-build/references/stacks', 'evals/bench/shell-01', 'tests/bench-shell-01.test.cjs'];

const pool = (tasks, n) => { const out = []; let next = 0; const worker = async () => { while (next < tasks.length) { const i = next++; out[i] = await tasks[i](); } }; return Promise.all(Array.from({ length: n }, worker)).then(() => out); };

if (require.main === module) {
  const scratch = process.argv[2];
  if (!scratch) { console.error('usage: node evals/bench/shell-01/mutants.cjs <scratch dir> [ids]'); process.exit(2); }
  const src = fs.readFileSync('evals/bench/shell-01/build.cjs', 'utf8');
  const only = process.argv[3] ? process.argv[3].split(',') : null;
  const jobs = [['M00 none (control)', '', ''], ...MUTANTS.filter(([name]) => !only || only.includes(name.split(' ')[0]))].map(([name, from, to], i) => () => {
    if (from && src.split(from).length !== 2) return Promise.resolve(`${name}: PATTERN NOT FOUND ONCE`);
    const dir = path.join(scratch, `mutant-${i}`);
    fs.rmSync(dir, { recursive: true, force: true });
    for (const p of COPY) fs.cpSync(p, path.join(dir, p), { recursive: true });
    fs.writeFileSync(path.join(dir, 'evals/bench/shell-01/build.cjs'), from ? src.split(from).join(to) : src);
    return new Promise((resolve) => exec('node --test --test-reporter=tap tests/bench-shell-01.test.cjs', { cwd: dir, timeout: 900000 }, (err, stdout) => {
      const lines = stdout.split('\n');
      const at = lines.findIndex((l) => /error: /.test(l));
      const why = at < 0 ? '' : (lines[at].includes('|-') ? lines[at + 1] : lines[at]).trim().slice(0, 110);
      fs.rmSync(dir, { recursive: true, force: true });
      resolve(`${name}: ${err && err.killed ? 'NO RESULT (killed)' : err ? 'RED' : 'GREEN'} ${why}`);
    }));
  });
  // At most three at once: under heavier load a run can time out for the load, not for the mutation.
  pool(jobs, 3).then((r) => console.log(r.join('\n')));
}

module.exports = { MUTANTS };
