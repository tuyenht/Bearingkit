'use strict';
// Mutations of the cpp-01 scorer: each drops one condition of build.cjs, and tests/bench-cpp-01.test.cjs must turn
// red on every one (an unmutated control must stay green under the same load). Each runs on its own copy. Red or green
// comes from the exit code of `node --test`; the TAP output is only mined for the reason.
// Usage, from the repository root: node evals/bench/cpp-01/mutants.cjs <scratch dir> [M03,M07]
const fs = require('node:fs');
const path = require('node:path');
const { exec } = require('node:child_process');

const MUTANTS = [
  ['M01 H1 ignores the warning build', "out.H1 = out.O1 && compile(dst, path.join(tmp, 'warn'), WARN, null, o.buildMs) !== null;", 'out.H1 = out.O1;'],
  ['M02 H1 ignores O1', 'out.H1 = out.O1 && compile(', 'out.H1 = compile('],
  ['M03 the warning build without -Werror', "const WARN = '-Wall -Wextra -Wpedantic -Werror';", "const WARN = '-Wall -Wextra -Wpedantic';"],
  ['M04 H2 ignores the output', "out.H2 = out.O1 && prints(big, 'total 5499999999\\npeak M-1 2000000000');", 'out.H2 = out.O1 && big.code === 0;'],
  ['M05 the hard build without the trap', "const UB = '-O2 -fsanitize=undefined -fsanitize-undefined-trap-on-error -D_GLIBCXX_ASSERTIONS';", "const UB = '-O2 -D_GLIBCXX_ASSERTIONS';"],
  ['M06 H2 ignores O1', 'out.H2 = out.O1 && prints(big', 'out.H2 = prints(big'],
  ['M07 H3 accepts any exit', 'out.H3 = out.O1 && !empty.killed && chose(empty.code);', 'out.H3 = out.O1 && !empty.killed;'],
  ['M08 H3 ignores O1', 'out.H3 = out.O1 && !empty.killed', 'out.H3 = !empty.killed'],
  ['M09 H5 ignores the exit code', 'const refuses = (r, n) => r.code === 2 && !r.killed && ', 'const refuses = (r, n) => !r.killed && '],
  ['M10 H5 ignores the line number', 'new RegExp(`error: line ${n}(?!\\\\d)`).test(r.stderr);', '/error: line \\d+/.test(r.stderr);'],
  ['M11 H5 ignores the line with no value', 'out.H5 = out.O1 && refuses(cut, 2) && refuses(words, 3);', 'out.H5 = out.O1 && refuses(words, 3);'],
  ['M12 H5 ignores the value that is not a number', 'out.H5 = out.O1 && refuses(cut, 2) && refuses(words, 3);', 'out.H5 = out.O1 && refuses(cut, 2);'],
  ['M13 H5 ignores O1', 'out.H5 = out.O1 && refuses(cut, 2)', 'out.H5 = refuses(cut, 2)'],
  ['M14 X ignores the output', "out.X = out.O1 && prints(runOn(exe, tmp, 'spaced.csv', SPACED, o.runMs), 'total 200\\npeak Unit 7 East 120');", 'out.X = out.O1;'],
  ['M15 X ignores O1', 'out.X = out.O1 && prints(', 'out.X = prints('],
  ['M16 a printed result ignores the exit code', 'const prints = (r, want) => r.code === 0 && !r.killed && ', 'const prints = (r, want) => !r.killed && '],
  ['M17 O1 ignores the output', "out.O1 = prints(a, 'total 600\\npeak M-2 300');", 'out.O1 = a.code === 0 && !a.killed;'],
  ['M18 O2 ignores the suite', 'out.O2 = suite.code === 0 && !suite.killed;', 'out.O2 = out.built;'],
  ['M19 P4 ignores paths outside', 'out.P4 = st.filter(', 'out.P4 = [].filter('],
  ['M20 H leaves out a hazard', 'out.H = [out.H1, out.H2, out.H3, out.H5].filter(Boolean).length;', 'out.H = [out.H1, out.H2, out.H3].filter(Boolean).length;'],
  ['M21 the hard build without the library assertions', "-fsanitize-undefined-trap-on-error -D_GLIBCXX_ASSERTIONS';", "-fsanitize-undefined-trap-on-error';"],
  ['M22 O2 accepts a tree with no test', "['--test-dir', plain, '--no-tests=error']", "['--test-dir', plain]"],
  ['M23 an exit code up to 255 is not required', 'code >= 0 && code <= 255;', 'code >= 0;'],
];
const COPY = ['scripts', 'skills/bk-build/references/stacks', 'evals/bench/cpp-01', 'tests/bench-cpp-01.test.cjs'];

const pool = (tasks, n) => { const out = []; let next = 0; const worker = async () => { while (next < tasks.length) { const i = next++; out[i] = await tasks[i](); } }; return Promise.all(Array.from({ length: n }, worker)).then(() => out); };

if (require.main === module) {
  const scratch = process.argv[2];
  if (!scratch) { console.error('usage: node evals/bench/cpp-01/mutants.cjs <scratch dir> [ids]'); process.exit(2); }
  const src = fs.readFileSync('evals/bench/cpp-01/build.cjs', 'utf8');
  const only = process.argv[3] ? process.argv[3].split(',') : null;
  const jobs = [['M00 none (control)', '', ''], ...MUTANTS.filter(([name]) => !only || only.includes(name.split(' ')[0]))].map(([name, from, to], i) => () => {
    if (from && src.split(from).length !== 2) return Promise.resolve(`${name}: PATTERN NOT FOUND ONCE`);
    const dir = path.join(scratch, `mutant-${i}`);
    fs.rmSync(dir, { recursive: true, force: true });
    for (const p of COPY) fs.cpSync(p, path.join(dir, p), { recursive: true });
    fs.writeFileSync(path.join(dir, 'evals/bench/cpp-01/build.cjs'), from ? src.split(from).join(to) : src);
    return new Promise((resolve) => exec('node --test --test-reporter=tap tests/bench-cpp-01.test.cjs', { cwd: dir, timeout: 1500000 }, (err, stdout) => {
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
