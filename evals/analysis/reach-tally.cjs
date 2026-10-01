// Tally of the bk-build stack-reach measurement (docs/specs/2026-10-01-bk-build-stack-reach-design.md). Read only.
// Takes the run's directories from evals/results/reach-log.txt, written by reach-run.cjs: for php-01, the last
// complete occurrence of each round (a round that stopped part-way and was re-run counts once, from the re-run);
// for build-01, the last successful build-01 line. Usage, from the repository root: node evals/analysis/reach-tally.cjs [resultsDir]
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { fisherExact, permutationTest, median } = require('../../scripts/lib/bench-score.cjs');
const R = process.argv[2] || path.join(__dirname, '..', 'results');
const lines = fs.readFileSync(path.join(R, 'reach-log.txt'), 'utf8').split('\n');

const rounds = {}; let open = null; let build = null;
for (const l of lines) {
  let m;
  if ((m = l.match(/ round (\d+) of \d+ start$/))) open = { n: m[1], dirs: [] };
  else if ((m = l.match(/ round (\d+) of \d+ complete$/)) && open && open.n === m[1]) { rounds[m[1]] = open.dirs; open = null; }
  else if ((m = l.match(/ php-01 \S+ \S+ exit=0 dir=(\S+) .*dirty=false$/)) && open) open.dirs.push(m[1]);
  else if ((m = l.match(/ build-01 \S+ K exit=0 dir=(\S+) .*dirty=false$/))) build = m[1];
  else if (/^STOP /.test(l)) { open = null; build = null; } // a stop right after a logged line voids that line
}
const read = (dir) => {
  const meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8'));
  return fs.readdirSync(path.join(R, dir)).filter((n) => n.endsWith('.check.json')).sort().map((f) => {
    const c = JSON.parse(fs.readFileSync(path.join(R, dir, f), 'utf8'));
    const b = f.match(/natural-([A-Z])\d+/)[1];
    const label = b === 'S' ? 'S' : meta.kit.branch === 'p4a-php' ? 'K-before' : 'K-after';
    return { dir, id: f.replace('.check.json', ''), label, commit: String(meta.kit.commit).slice(0, 7), c, H: (c.H1 ? 1 : 0) + (c.H2 ? 1 : 0) + (c.H3 ? 1 : 0) };
  });
};

const all = Object.keys(rounds).sort().flatMap((k) => rounds[k].flatMap(read));
const by = (l) => all.filter((s) => s.label === l);
const n = (xs, k) => xs.filter((s) => s.c[k]).length;
console.log(`php-01 rounds counted: ${Object.keys(rounds).sort().join(', ') || 'none'}`);
for (const l of ['K-before', 'K-after', 'S']) {
  const xs = by(l);
  if (!xs.length) continue;
  const cls = {}; for (const s of xs) cls[s.c.H1class] = (cls[s.c.H1class] || 0) + 1;
  console.log(`${l} (n=${xs.length}; commits ${[...new Set(xs.map((s) => s.commit))].join(',')}): H ${xs.map((s) => s.H).join(' ')} median ${median(xs.map((s) => s.H))}; H1 ${n(xs, 'H1')} H2 ${n(xs, 'H2')} H3 ${n(xs, 'H3')} O1 ${n(xs, 'O1')} O2 ${n(xs, 'O2')} X ${n(xs, 'X')} Rfile ${n(xs, 'Rfile')} Rdetect ${xs.filter((s) => s.c.Rdetect === 'ran').length}; H1 class ${JSON.stringify(cls)}`);
}
const kb = by('K-before'); const ka = by('K-after'); const s = by('S');
if (kb.length && ka.length) {
  const a = n(ka, 'Rfile'); const b = n(kb, 'Rfile');
  const p = fisherExact(a, ka.length - a, b, kb.length - b);
  if (ka.length !== 8 || kb.length !== 8) console.log(`\nR and G are registered on 8 sessions each; counted K-after ${ka.length}, K-before ${kb.length}`);
  console.log(`\nR: opened K-after ${a}/${ka.length} vs K-before ${b}/${kb.length}, two-sided Fisher p = ${p.toFixed(4)}: ${a > b && p <= 0.05}`);
  const hMed = median(ka.map((x) => x.H));
  const g = ka.length === 8 && a >= 4 && n(ka, 'O1') >= 7 && n(ka, 'O2') >= 7 && hMed >= 2;
  console.log(`G (needs 8 K-after sessions): opened ${a}/${ka.length} (>= 4), O1 ${n(ka, 'O1')}/${ka.length} (>= 7), O2 ${n(ka, 'O2')}/${ka.length} (>= 7), H median ${hMed} (>= 2): ${g}`);
}
if (ka.length && s.length) {
  const mean = (xs) => xs.reduce((t, x) => t + x.H, 0) / xs.length;
  console.log(`Against the sources: H mean K-after ${mean(ka).toFixed(3)} vs S ${mean(s).toFixed(3)}, exact two-sided permutation p = ${permutationTest(ka.map((x) => x.H), s.map((x) => x.H)).toFixed(4)}`);
}
if (build) {
  const xs = read(build).filter((x) => x.label === 'K-after');
  const ok = n(xs, 'O1') === 8 && n(xs, 'O2') >= 7 && n(xs, 'O3') >= 7 && n(xs, 'P3') >= 7;
  console.log(`\nB (build-01 ${build}, n=${xs.length}): O1 ${n(xs, 'O1')}/8 (= 8), O2 ${n(xs, 'O2')}/8, O3 ${n(xs, 'O3')}/8, P3 ${n(xs, 'P3')}/8 (each >= 7): ${xs.length === 8 && ok}`);
}
