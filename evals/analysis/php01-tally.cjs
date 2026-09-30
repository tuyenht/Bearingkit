// Tally of the php-01 runs of 2026-09-30 (docs/specs/2026-09-28-stack-php-laravel-design.md, "Results"): the guard
// (K and S, one bench call), the F calibration, and the K reach probes. Read only; evals/results is untracked.
// Usage, from the repository root: node evals/analysis/php01-tally.cjs <guard dir> <calibration dir> [probe dirs...]
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { permutationTest, median, events } = require('../../scripts/lib/bench-score.cjs');
const R = path.join(__dirname, '..', 'results');
const [guard, calib, ...probes] = process.argv.slice(2);
if (!guard || !calib) { console.error('usage: php01-tally.cjs <guard dir> <calibration dir> [probe dirs...]'); process.exit(2); }

function sessions(dir) {
  const meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8'));
  return fs.readdirSync(path.join(R, dir)).filter((n) => n.endsWith('.check.json')).sort().map((f) => {
    const c = JSON.parse(fs.readFileSync(path.join(R, dir, f), 'utf8'));
    const raw = fs.readFileSync(path.join(R, dir, f.replace('.check.json', '.raw.jsonl')), 'utf8');
    let model = '?'; let cost = null; let tools = 0; let refused = 0; const skills = []; let args = null;
    for (const e of events(raw)) {
      if (e.type === 'system' && e.subtype === 'init') model = e.model;
      if (e.type === 'result') cost = e.total_cost_usd;
      for (const x of (e.message && Array.isArray(e.message.content) ? e.message.content : [])) {
        if (x.type === 'tool_use') {
          tools++;
          if (x.name === 'Skill') { skills.push(String((x.input || {}).skill || '')); if (args === null) args = Boolean((x.input || {}).args); }
        }
        const body = typeof x.content === 'string' ? x.content : (x.content || []).map((y) => (y && y.text) || '').join('\n');
        if (x.type === 'tool_result' && x.is_error && !/^\s*Exit code \d+/.test(body)) refused++;
      }
    }
    const H = (c.H1 ? 1 : 0) + (c.H2 ? 1 : 0) + (c.H3 ? 1 : 0);
    return { dir, kit: meta.kit, id: f.replace('.check.json', ''), branch: f.match(/natural-([A-Z])\d+/)[1], c, H, model, cost, tools, refused, skills, args };
  });
}

const n = (xs, k) => xs.filter((s) => s.c[k]).length;
const show = (label, xs) => {
  if (!xs.length) return;
  const costs = xs.map((s) => s.cost).filter((v) => v != null).sort((a, b) => a - b);
  const cls = {}; for (const s of xs) cls[s.c.H1class] = (cls[s.c.H1class] || 0) + 1;
  const sk = {}; for (const s of xs) { const k = s.skills.join('>') || '-'; sk[k] = (sk[k] || 0) + 1; }
  console.log(`${label} (n=${xs.length}; ${[...new Set(xs.map((s) => s.model))].join(',')}; kit ${[...new Set(xs.map((s) => `${s.kit.branch}@${String(s.kit.commit).slice(0, 7)} dirty=${s.kit.dirty}`))].join(',')})`);
  console.log(`  H per session ${xs.map((s) => s.H).join(' ')}; median ${median(xs.map((s) => s.H))}`);
  console.log(`  H1 ${n(xs, 'H1')}  H2 ${n(xs, 'H2')}  H3 ${n(xs, 'H3')}  O1 ${n(xs, 'O1')}  O2 ${n(xs, 'O2')}  X ${n(xs, 'X')}  Rfile ${n(xs, 'Rfile')}  Rindex ${n(xs, 'Rindex')}  P4>0 ${xs.filter((s) => s.c.P4).length}  P5>0 ${xs.filter((s) => s.c.P5).length}`);
  console.log(`  H1 class ${JSON.stringify(cls)}; seed/refuse errors ${xs.filter((s) => s.c.seedError || s.c.refuseError).length}`);
  console.log(`  skills ${JSON.stringify(sk)}; first Skill call with args ${xs.filter((s) => s.args).length}/${xs.filter((s) => s.args !== null).length}`);
  console.log(`  cost USD ${costs.length ? `median ${median(costs).toFixed(3)} range ${costs[0].toFixed(3)}-${costs[costs.length - 1].toFixed(3)}` : "n/a"}; tool calls ${xs.map((s) => s.tools).join(' ')}; tool errors other than a non-zero exit (refusals and others) ${xs.map((s) => s.refused).join(' ')}`);
};

const g = sessions(guard);
const K = g.filter((s) => s.branch === 'K');
const S = g.filter((s) => s.branch === 'S');
const F = sessions(calib).filter((s) => s.branch === 'F');
show('K-after (guard)', K);
show('S (guard)', S);
show('F (calibration)', F);
for (const d of probes) show(`K probe ${d}`, sessions(d).filter((s) => s.branch === 'K'));

const fMed = median(F.map((s) => s.H));
console.log('\nGuard bar, K-after only:');
console.log(`  O1 ${n(K, 'O1')}/8 (>= 7): ${n(K, 'O1') >= 7}`);
console.log(`  O2 ${n(K, 'O2')}/8 (>= 7): ${n(K, 'O2') >= 7}`);
console.log(`  H median ${median(K.map((s) => s.H))} not below F calibration median ${fMed}: ${median(K.map((s) => s.H)) >= fMed}`);
console.log(`  file opened ${n(K, 'Rfile')}/8 (>= 4): ${n(K, 'Rfile') >= 4}`);
const p = permutationTest(K.map((s) => s.H), S.map((s) => s.H));
const mean = (xs) => xs.reduce((a, s) => a + s.H, 0) / xs.length;
console.log(`Against the sources: H mean K ${mean(K).toFixed(3)} vs S ${mean(S).toFixed(3)}, exact two-sided permutation p = ${p.toFixed(4)}`);
console.log('\nPer session:');
for (const s of [...g, ...F]) console.log(`  ${s.dir.slice(11)} ${s.id} H=${s.H} ${['H1', 'H2', 'H3', 'O1', 'O2', 'X', 'Rfile'].map((k) => `${k}=${s.c[k] ? 1 : 0}`).join(' ')} class=${s.c.H1class} skills=${s.skills.join('>') || '-'} added=${(s.c.added || []).join(',')}`);
