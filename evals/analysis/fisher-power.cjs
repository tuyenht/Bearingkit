'use strict';
// Exact power of the test the kit's registrations use for a pass/fail hazard: Fisher's exact test, two-sided, at
// 0.05, with the bar "the new text above the old one", two groups of n sessions each.
//   node evals/analysis/fisher-power.cjs            prints the table of docs/specs/2026-10-08-p5c-shared-code-design.md
//   node evals/analysis/fisher-power.cjs 0.5 0.8 32 prints the power for one pair of rates and one n
// It runs no session and reads no result. Before printing it checks itself against two registered figures of
// Step 0 (docs/handoff/2026-09-30-p4-step0-measured.md): 9/16 against 4/16 is p = 0.149, 5/8 against 1/8 is 0.119.
const lf = [0];
for (let i = 1; i <= 400; i++) lf[i] = lf[i - 1] + Math.log(i);
const lc = (n, k) => lf[n] - lf[k] - lf[n - k];
function binom(n, k, p) {
  if (p <= 0) return k === 0 ? 1 : 0;
  if (p >= 1) return k === n ? 1 : 0;
  return Math.exp(lc(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}
// Two-sided p of a passes in n against b passes in n, by the runner's own function (tested in tests/bench.test.cjs).
const { fisherExact } = require('../../scripts/lib/bench-score.cjs');
const fisher = (a, b, n) => fisherExact(a, n - a, b, n - b);
function power(n, before, after) {
  let w = 0;
  for (let a = 0; a <= n; a++) for (let b = 0; b <= n; b++) if (a > b && fisher(a, b, n) <= 0.05) w += binom(n, a, after) * binom(n, b, before);
  return w;
}
function selfCheck() {
  const got = [fisher(9, 4, 16).toFixed(3), fisher(5, 1, 8).toFixed(3)];
  if (got[0] !== '0.149' || got[1] !== '0.119') throw new Error(`self-check failed: ${got.join(', ')} (expected 0.149, 0.119)`);
}
if (require.main === module) {
  selfCheck();
  const [before, after, n] = process.argv.slice(2).map(Number);
  if (process.argv.length > 2) {
    if (!(before >= 0 && before <= 1 && after >= 0 && after <= 1 && Number.isInteger(n) && n > 0 && n <= 200)) { process.stderr.write('usage: fisher-power.cjs [<rate before> <rate after> <n per side>]\n'); process.exit(2); }
    process.stdout.write(`${power(n, before, after).toFixed(2)}\n`);
  } else {
    const NS = [16, 24, 32, 48];
    process.stdout.write(`| K-before passes of 16 | Rate before | Rate after (+0.30) | ${NS.map((x) => `n = ${x}`).join(' | ')} |\n|---|---|---|${NS.map(() => '---').join('|')}|\n`);
    for (let k = 0; k <= 11; k++) {
      const p0 = k / 16, p1 = p0 + 0.3;
      process.stdout.write(`| ${k} | ${p0.toFixed(3)} | ${p1.toFixed(3)} | ${NS.map((x) => power(x, p0, p1).toFixed(2)).join(' | ')} |\n`);
    }
  }
}
module.exports = { fisher, power };
