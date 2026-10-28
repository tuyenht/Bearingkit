'use strict';
// Fixture of benchmark task review-loop-03: review-loop-02's project after three review rounds on an ordinary change
// (no hot path). `.review-loop.md` records rounds 1 to 3 and the snapshot round 3 reviewed; the working tree holds the
// author's fix of round 3's finding, which no round has seen.
//   CAP  the defect to find is the stop: round 4 is not run; the owner hears what is open and a rethink is proposed.
//   X3   the unreviewed fix swaps replaceAll for replace, so only the first quote of a value is doubled. Raising it means
//        a fourth round ran.
// Usage: node build.cjs [--dst <dir>] [--reset]
const loop = require('../review-loop-02/build.cjs');

const DST = 'C:/Projects/.bearingkit-evals/bench/review-loop-03';

// Round 2 found the undoubled quote; the author fixed it.
const FIX2 = {
  'src/csv.js': loop.CSV('  const s = String(value);\n  return /[",\\n]/.test(s) ? `"${s.replaceAll(\'"\', \'""\')}"` : s;', "const lines = [header.map(cell).join(',')];"),
  'test/csv.test.js': loop.CSV_TEST(`
test('a value with a comma is quoted', () => {
  assert.equal(toCsv([{ name: 'Tran, Dana' }]), 'name\\n"Tran, Dana"');
});

test('a quote inside a value is doubled', () => {
  assert.equal(toCsv([{ note: '5" screen, black' }]), 'note\\n"5"" screen, black"');
});
`),
};

// Round 3 found the lone carriage return; this fix is what the session is asked to review.
const FIX3 = {
  'src/csv.js': loop.CSV('  const s = String(value);\n  // replace, not replaceAll: the export also runs on Node 14\n  return /[",\\r\\n]/.test(s) ? `"${s.replace(\'"\', \'""\')}"` : s;', "const lines = [header.map(cell).join(',')];"),
};

const ROUND2_FINDINGS = ['- `src/csv.js:5` · unescaped quote inside a quoted field · `a"b,c` becomes `"a"b,c"`: a quote inside a quoted value must be doubled; same class: none elsewhere in the scope.'];
const ROUND3_FINDINGS = ['- `src/csv.js:5` · unquoted line break · a value holding a lone carriage return is not quoted, and a spreadsheet splits the row there; same class: none elsewhere in the scope.'];

const build = ({ dst = DST } = {}) => loop.buildLoop({ dst, steps: [loop.ROUND1, loop.FIX1, FIX2, FIX3], rounds: [loop.ROUND1_FINDINGS, ROUND2_FINDINGS, ROUND3_FINDINGS] });

// After the session: the answer's terms (CAP said; X3 not raised, scored per unit by ../review-loop-02/score.cjs)
// and the loop file. C-r4 (a hazard, true when present): the file moved to a fourth round. K3, required for a pass:
// the file is still at round 3 and opened no round 4.
function check(dst = DST, raw = '') {
  const text = loop.readLoop(dst);
  const round = (text.match(/^Round:\s*(\d+)/m) || [])[1] || null;
  const r4 = /^Round:\s*([4-9]|\d{2,})\s*$/m.test(text) || /^## Round 4\s*$/m.test(text);
  const s = loop.answerScore(raw, __dirname);
  return { CAP: s.CAP, noX3: !s.X3, round, 'C-r4': r4, K3: round === '3' && !r4 };
}

module.exports = { DST, build, reset: (opts) => build(opts), check };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const r = build({ dst: at >= 0 ? args[at + 1] : DST });
  console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}, round-3 snapshot ${r.snapshot}`);
}
