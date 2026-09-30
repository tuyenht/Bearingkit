// Tally of the Step 0 runs of 2026-09-30, branches labelled by meta.json `kit` (K on main = K-old,
// K on p4-step0-scope = K-new, S = sources). Usage, from the repository root: node evals/analysis/step0-tally.cjs
const fs = require('node:fs');
const path = require('node:path');
const { fisherExact, permutationTest, median, events } = require('../../scripts/lib/bench-score.cjs');
const R = path.join(__dirname, '..', 'results');
const rows = [];
for (const dir of fs.readdirSync(R).filter((d) => /^2026-09-30-bench-(node-01|py-01|build-01)-natural/.test(d)).sort()) {
  const meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8'));
  const task = dir.match(/bench-(node-01|py-01|build-01)/)[1];
  for (const f of fs.readdirSync(path.join(R, dir)).filter((n) => n.endsWith('.check.json'))) {
    const c = JSON.parse(fs.readFileSync(path.join(R, dir, f), 'utf8'));
    const b = f.match(/natural-([A-Z])\d+/)[1];
    const branch = b === 'S' ? 'S' : meta.kit.branch === 'main' ? 'K-old' : 'K-new';
    const raw = fs.readFileSync(path.join(R, dir, f.replace('.check.json', '.raw.jsonl')), 'utf8');
    let args = null;
    for (const e of events(raw)) if (e.type === 'assistant') for (const x of (e.message.content || [])) if (x.type === 'tool_use' && x.name === 'Skill' && args === null) args = Boolean((x.input || {}).args);
    const res = events(raw).filter((e) => e.type === 'result').pop() || {};
    rows.push({ task, branch, dir, f, c, args, cost: res.total_cost_usd });
  }
}
const DL = (r) => ('N3' in r.c ? r.c.N3 : r.c.Y2);
const H = (r) => ('N' in r.c ? r.c.N : r.c.Y);
const cnt = (g, fn) => `${g.filter(fn).length}/${g.length}`;
for (const task of ['node-01', 'py-01']) {
  const t = rows.filter((r) => r.task === task);
  if (!t.length) continue;
  console.log(`\n${task}`);
  for (const b of ['K-old', 'K-new', 'S']) {
    const g = t.filter((r) => r.branch === b);
    console.log(`  ${b.padEnd(6)} n=${g.length} deadline ${cnt(g, DL)} O1 ${cnt(g, (r) => r.c.O1)} O2 ${cnt(g, (r) => r.c.O2)} file ${cnt(g, (r) => r.c.Rfile)} bk-build ${cnt(g, (r) => r.c.Rskill)} H ${g.map(H).join(',')} args ${cnt(g, (r) => r.args)} cost med ${median(g.map((r) => r.cost).filter((x) => x != null)).toFixed(3)}`);
  }
  const [o, n, s] = ['K-old', 'K-new', 'S'].map((b) => t.filter((r) => r.branch === b));
  const f = (a, b) => fisherExact(a.filter(DL).length, a.length - a.filter(DL).length, b.filter(DL).length, b.length - b.filter(DL).length).toFixed(4);
  console.log(`  deadline K-new vs K-old p=${f(n, o)}; K-new vs S p=${f(n, s)}; H K-new vs K-old p=${permutationTest(n.map(H), o.map(H)).toFixed(4)}`);
}
const all = (b) => rows.filter((r) => r.branch === b && r.task !== 'build-01');
const [O, N, S] = ['K-old', 'K-new', 'S'].map(all);
if (O.length && N.length) {
  const p = (a, b) => fisherExact(a.filter(DL).length, a.length - a.filter(DL).length, b.filter(DL).length, b.length - b.filter(DL).length).toFixed(4);
  console.log(`\nPOOLED deadline: K-new ${cnt(N, DL)} K-old ${cnt(O, DL)} S ${cnt(S, DL)} | primary p(K-new vs K-old)=${p(N, O)} | vs sources p(K-new vs S)=${p(N, S)}`);
}
const bd = rows.filter((r) => r.task === 'build-01');
if (bd.length) console.log(`\nbuild-01 K-new n=${bd.length} O1 ${cnt(bd, (r) => r.c.O1)} O2 ${cnt(bd, (r) => r.c.O2)} O3 ${cnt(bd, (r) => r.c.O3)} P3 ${cnt(bd, (r) => r.c.P3)}`);
