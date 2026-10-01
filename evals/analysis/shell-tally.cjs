// Tally of the shell-01 measurement (docs/specs/2026-10-01-stack-shell-design.md). Read only.
// Takes the run's directories from evals/results/shell-log.txt, written by shell-run.cjs: the last complete occurrence
// of each round (a round that stopped part-way and was re-run counts once, from the re-run), plus the calibration
// directory given on the command line (its F sessions join the floor). For build-01, the last line followed by its
// DONE (a build-01 call that stopped is not counted; a later stop of another run does not void a finished one).
// Usage, from the repository root: node evals/analysis/shell-tally.cjs <calibration dir> [resultsDir]
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { permutationTest, median, events } = require('../../scripts/lib/bench-score.cjs');
const CALIB = process.argv[2];
const R = process.argv[3] || path.join(__dirname, '..', 'results');
if (!CALIB) { console.error('usage: shell-tally.cjs <calibration dir> [resultsDir]'); process.exit(2); }
const lines = fs.readFileSync(path.join(R, 'shell-log.txt'), 'utf8').split('\n');

const rounds = {}; let open = null; let build = null; let pending = null;
for (const l of lines) {
  let m;
  if ((m = l.match(/ round (\d+) of \d+ start$/))) open = { n: m[1], dirs: [] };
  else if ((m = l.match(/ round (\d+) of \d+ complete$/)) && open && open.n === m[1]) { rounds[m[1]] = open.dirs; open = null; }
  else if ((m = l.match(/ shell-01 \S+ \S+ runs=\d+ exit=0 dir=(\S+) .*dirty=false$/)) && open) open.dirs.push(m[1]);
  else if ((m = l.match(/ build-01 \S+ K runs=\d+ exit=0 dir=(\S+) .*dirty=false$/))) pending = m[1];
  else if (/ DONE build-01$/.test(l) && pending) { build = pending; pending = null; }
  else if (/^STOP /.test(l)) { open = null; pending = null; } // a stop right after a logged line voids that line
}
const IDS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const read = (dir) => {
  const meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8'));
  return fs.readdirSync(path.join(R, dir)).filter((n) => n.endsWith('.check.json')).sort().map((f) => {
    const c = JSON.parse(fs.readFileSync(path.join(R, dir, f), 'utf8'));
    const b = f.match(/natural-([A-Z])\d+/)[1];
    const label = b === 'S' ? 'S' : b === 'F' ? 'F' : meta.kit.branch === 'p4d-shell-before' ? 'K-before' : 'K-after';
    let cost = null; let model = '?'; let tools = 0; let refused = 0; const skills = [];
    for (const e of events(fs.readFileSync(path.join(R, dir, f.replace('.check.json', '.raw.jsonl')), 'utf8'))) {
      if (e.type === 'system' && e.subtype === 'init') model = e.model;
      if (e.type === 'result') { cost = e.total_cost_usd; refused = Array.isArray(e.permission_denials) ? e.permission_denials.length : 0; }
      for (const x of (e.message && Array.isArray(e.message.content) ? e.message.content : [])) {
        if (x.type !== 'tool_use') continue;
        tools++;
        if (x.name === 'Skill') skills.push(String((x.input || {}).skill || ''));
      }
    }
    return { dir, id: f.replace('.check.json', ''), label, commit: String(meta.kit.commit).slice(0, 7), dirty: meta.kit.dirty, c, H: IDS.filter((k) => c[k]).length, cost, model, tools, refused, skills };
  });
};

const all = [...read(CALIB).filter((s) => s.label === 'F'), ...Object.keys(rounds).sort().flatMap((n) => rounds[n].flatMap(read))];
console.log(`rounds counted: ${Object.keys(rounds).sort().join(', ') || 'none'}; calibration ${CALIB}; sessions ${all.length}`);
const by = (label) => all.filter((s) => s.label === label);
const n = (rows, k) => rows.filter((s) => s.c[k]).length;
for (const label of ['K-before', 'K-after', 'S', 'F']) {
  const rows = by(label);
  if (!rows.length) continue;
  const costs = rows.map((s) => s.cost).filter((x) => x !== null).sort((a, b) => a - b);
  console.log(`\n${label}: ${rows.length} sessions; commits ${[...new Set(rows.map((s) => s.commit))].join(',')}; dirty ${[...new Set(rows.map((s) => s.dirty))].join(',')}; models ${[...new Set(rows.map((s) => s.model))].join(',')}`);
  console.log(`  H per session: ${rows.map((s) => s.H).join(' ')}  median ${median(rows.map((s) => s.H))}  mean ${(rows.reduce((a, s) => a + s.H, 0) / rows.length).toFixed(3)}`);
  console.log(`  ${IDS.map((k) => `${k} ${n(rows, k)}`).join('  ')}  |  O1 ${n(rows, 'O1')}  O2 ${n(rows, 'O2')}  X ${n(rows, 'X')}  |  Rfile ${n(rows, 'Rfile')}  Rskill ${n(rows, 'Rskill')}  detect ${rows.filter((s) => s.c.Rdetect === 'ran').length}  P4 ${n(rows, 'P4out')}  P5 ${n(rows, 'P5try')}`);
  console.log(`  cost median ${costs.length ? median(costs).toFixed(3) : '?'} (${costs.length ? costs[0].toFixed(3) : '?'}-${costs.length ? costs[costs.length - 1].toFixed(3) : '?'})  tools ${Math.min(...rows.map((s) => s.tools))}-${Math.max(...rows.map((s) => s.tools))}  refused ${rows.reduce((a, s) => a + s.refused, 0)}  skills ${JSON.stringify(rows.map((s) => s.skills.join('+') || '-'))}`);
}
const Hs = (label) => by(label).map((s) => s.H);
const p = (a, b) => (Hs(a).length && Hs(b).length ? permutationTest(Hs(a), Hs(b)) : null);
console.log(`\nprimary, H K-after vs K-before: p = ${p('K-after', 'K-before')}`);
console.log(`H K-after vs S: p = ${p('K-after', 'S')}`);
console.log(`H K-after vs F: p = ${p('K-after', 'F')}   (no bar)`);
if (build) {
  const rows = read(build);
  console.log(`\nbuild-01 ${build}: ${rows.length} sessions; ${['O1', 'O2', 'O3', 'P1', 'P2', 'P3', 'P6'].map((k) => `${k} ${n(rows, k)}`).join('  ')}; commits ${[...new Set(rows.map((s) => s.commit))].join(',')}; refused ${rows.reduce((a, s) => a + s.refused, 0)}`);
}
