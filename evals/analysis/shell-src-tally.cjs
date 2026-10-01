// Tally of the shell-01-src run (docs/specs/2026-10-01-stack-shell-design.md, "Addendum: against the source"): one
// bench call, K (the kit) and S (the wrapped source of shell.md) interleaved. Read only.
// The primary test is H, K against S, exact two-sided permutation. "The source was read" counts the S sessions that
// invoked a skill of the wrapper through the Skill tool, or named one of its files in a Read, Grep or shell call.
// Usage, from the repository root: node evals/analysis/shell-src-tally.cjs <result dir name> [resultsDir]
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { permutationTest, median, events } = require('../../scripts/lib/bench-score.cjs');
const DIR = process.argv[2];
const R = process.argv[3] || path.join(__dirname, '..', 'results');
if (!DIR) { console.error('usage: shell-src-tally.cjs <result dir name> [resultsDir]'); process.exit(2); }
const WRAPPER = 'antigravity-core-shell';
const IDS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const meta = JSON.parse(fs.readFileSync(path.join(R, DIR, 'meta.json'), 'utf8'));
const rows = fs.readdirSync(path.join(R, DIR)).filter((n) => n.endsWith('.check.json')).sort().map((f) => {
  const c = JSON.parse(fs.readFileSync(path.join(R, DIR, f), 'utf8'));
  const branch = f.match(/natural-([A-Z])\d+/)[1];
  let cost = null; let model = '?'; let end = '?'; let tools = 0; let refused = 0; const skills = []; let viaSkill = false; let viaFile = false;
  for (const e of events(fs.readFileSync(path.join(R, DIR, f.replace('.check.json', '.raw.jsonl')), 'utf8'))) {
    if (e.type === 'system' && e.subtype === 'init') model = e.model;
    if (e.type === 'result') { cost = e.total_cost_usd; end = e.subtype; refused = Array.isArray(e.permission_denials) ? e.permission_denials.length : 0; }
    for (const x of (e.message && Array.isArray(e.message.content) ? e.message.content : [])) {
      if (x.type !== 'tool_use') continue;
      tools++;
      const input = JSON.stringify(x.input || {});
      if (x.name === 'Skill') { const s = String((x.input || {}).skill || ''); skills.push(s); if (s.includes(WRAPPER) || /(^|:)(bash-linux|powershell-windows)$/.test(s)) viaSkill = true; }
      else if (['Read', 'Grep', 'Bash', 'PowerShell'].includes(x.name) && input.includes(WRAPPER)) viaFile = true;
    }
  }
  return { id: f.replace('.check.json', ''), branch, c, H: IDS.filter((k) => c[k]).length, cost, model, end, tools, refused, skills, read: viaSkill || viaFile, viaSkill, viaFile };
});
console.log(`${DIR}: kit ${meta.kit && meta.kit.branch}@${String(meta.kit && meta.kit.commit).slice(0, 7)} dirty=${meta.kit && meta.kit.dirty}; cut ${JSON.stringify(meta.cut || [])}; stopped ${meta.stopped || 'no'}; sessions ${rows.length}`);
const n = (r, k) => r.filter((s) => s.c[k]).length;
for (const b of ['K', 'S']) {
  const r = rows.filter((s) => s.branch === b);
  if (!r.length) continue;
  const costs = r.map((s) => s.cost).filter((x) => x !== null).sort((a, b2) => a - b2);
  console.log(`\n${b}: ${r.length} sessions; models ${[...new Set(r.map((s) => s.model))].join(',')}; ends ${[...new Set(r.map((s) => s.end))].join(',')}`);
  console.log(`  H per session: ${r.map((s) => s.H).join(' ')}  median ${median(r.map((s) => s.H))}  mean ${(r.reduce((a, s) => a + s.H, 0) / r.length).toFixed(3)}`);
  console.log(`  ${IDS.map((k) => `${k} ${n(r, k)}`).join('  ')}  |  O1 ${n(r, 'O1')}  O2 ${n(r, 'O2')}  X ${n(r, 'X')}  |  shell.md ${n(r, 'Rfile')}  bk-build ${n(r, 'Rskill')}  P4 ${n(r, 'P4out')}  P5 ${n(r, 'P5try')}`);
  console.log(`  cost median ${costs.length ? median(costs).toFixed(3) : '?'} (${costs.length ? costs[0].toFixed(3) : '?'}-${costs.length ? costs[costs.length - 1].toFixed(3) : '?'})  tools ${Math.min(...r.map((s) => s.tools))}-${Math.max(...r.map((s) => s.tools))}  refused ${r.reduce((a, s) => a + s.refused, 0)}`);
  console.log(`  skills ${JSON.stringify(r.map((s) => s.skills.join('+') || '-'))}`);
  if (b === 'S') console.log(`  source read: ${r.filter((s) => s.read).length} of ${r.length} (through the Skill tool ${r.filter((s) => s.viaSkill).length}, a file named ${r.filter((s) => s.viaFile).length})`);
}
const H = (b) => rows.filter((s) => s.branch === b).map((s) => s.H);
console.log(`\nprimary, H K vs S (the wrapped source): p = ${H('K').length && H('S').length ? permutationTest(H('K'), H('S')) : null}`);
