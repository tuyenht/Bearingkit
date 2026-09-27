'use strict';
// Mutations of the py-01 scorer: each drops one condition of build.cjs, and tests/bench-py-01.test.cjs must turn red
// on every one, at the assertion named for it (an unmutated control must stay green under the same load). Each runs
// on its own copy.
// Usage, from the repository root: node evals/bench/py-01/mutants.cjs <scratch dir>
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const MUTANTS = [
  ['M01 Y1 ignores equal peaks', ' && a.peak === b.peak && b.peak < o.small;', ' && b.peak < o.small;'],
  ['M02 Y1 ignores the bound below the small count', ' && a.peak === b.peak && b.peak < o.small;', ' && a.peak === b.peak;'],
  ['M03 Y1 ignores whether every SKU was asked', 'out.Y1 = small.every((s) => a.asked.has(s)) && large.every((s) => b.asked.has(s)) && ', 'out.Y1 = '],
  ['M04 Y2 ignores the deadline', ' && h.ms < o.deadlineMs;', ';'],
  ['M05 Y2 ignores whether the hang was reached', "out.Y2 = h.asked.has('HANG-00011') && ", 'out.Y2 = '],
  ['M06 Y3 ignores the zone', '|| ZONED.test(t)', '|| true'],
  ['M07 Y3 ignores whether a time is there', 'out.Y3 = small.every((s) => a.asked.has(s)) && stamped && ', 'out.Y3 = small.every((s) => a.asked.has(s)) && !!records && '],
  ['M08 Y3 ignores whether the export ran over the file', 'out.Y3 = small.every((s) => a.asked.has(s)) && ', 'out.Y3 = '],
  ['M09 X ignores stdout', ' && parse(f.stdout).ok;', ';'],
  ['M10 X ignores whether the failing SKU was reached', "out.X = f.asked.has('FAIL-00007') && ", 'out.X = '],
  ['M11 O1 ignores the sku set', 'return got.length === small.length && new Set(got).size === small.length && small.every((s) => got.includes(s));', 'return true;'],
  ['M12 O1 ignores the export time', '!!records && stamped\n', '!!records\n'],
  ['M13 O1 ignores the exit code', 'out.O1 = a.code === 0 && ', 'out.O1 = '],
  ['M14 O2 ignores the suite', 'out.O2 = suite.code === 0 && !suite.killed;', 'out.O2 = true;'],
  ['M15 P4 ignores paths outside', 'out.P4 = paths.filter(', 'out.P4 = [].filter('],
  ['M16 O1 ignores whether every SKU was asked', 'out.O1 = a.code === 0 && small.every((s) => a.asked.has(s)) && ', 'out.O1 = a.code === 0 && '],
];
const COPY = ['scripts', 'skills/bk-build/references/stacks', 'evals/bench/py-01', 'tests/bench-py-01.test.cjs'];

const scratch = process.argv[2];
if (!scratch) { console.error('usage: node evals/bench/py-01/mutants.cjs <scratch dir>'); process.exit(2); }
const src = fs.readFileSync('evals/bench/py-01/build.cjs', 'utf8');
// At most four at once: under heavier load a timing assertion can fail for the load, not for the mutation.
const pool = (tasks, n) => { const out = []; let next = 0; const worker = async () => { while (next < tasks.length) { const i = next++; out[i] = await tasks[i](); } }; return Promise.all(Array.from({ length: n }, worker)).then(() => out); };
const jobs = [['M00 none (control)', '', ''], ...MUTANTS].map(([name, from, to], i) => () => {
  if (from && !src.includes(from)) return Promise.resolve(`${name}: PATTERN NOT FOUND`);
  const dir = path.join(scratch, `mutant-${i}`);
  fs.rmSync(dir, { recursive: true, force: true });
  for (const p of COPY) fs.cpSync(p, path.join(dir, p), { recursive: true });
  fs.writeFileSync(path.join(dir, 'evals/bench/py-01/build.cjs'), from ? src.split(from).join(to) : src);
  return new Promise((resolve) => exec('node --test tests/bench-py-01.test.cjs', { cwd: dir, timeout: 500000 }, (err, stdout) => {
    const fails = (stdout.match(/# fail (\d+)/) || [])[1];
    const skips = (stdout.match(/# SKIP (.*)$/m) || [])[1];
    const lines = stdout.split('\n');
    const at = lines.findIndex((l) => /error: /.test(l));
    const why = at < 0 ? '' : (lines[at].includes('|-') ? lines[at + 1] : lines[at]).trim().slice(0, 110);
    fs.rmSync(dir, { recursive: true, force: true });
    resolve(`${name}: ${fails && fails !== '0' ? 'RED' : 'GREEN'} ${why}${skips ? ` [skip: ${skips}]` : ''}`);
  }));
});
pool(jobs, 4).then((r) => console.log(r.join('\n')));
