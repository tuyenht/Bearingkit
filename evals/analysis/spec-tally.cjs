// Tally of the spec-01 runs (docs/specs/2026-10-02-bk-spec-design.md, "Measurement, registered before any session").
// Reads result directories; each session's branch is its file's letter (K, S, F) and, for K, the kit branch recorded in
// the directory's meta.json: a branch whose name ends in "-before" is K-before, any other is K-after. Read only.
// Prints, per group: H per session, each hazard, the decoys, the form of the questions, the outcomes, the reach, and
// for S the registered "source read" count; then the two registered tests (exact two-sided permutation on H).
// Usage, from the repository root: node evals/analysis/spec-tally.cjs <result dir name> [<result dir name> ...]
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { permutationTest, median, events } = require('../../scripts/lib/bench-score.cjs');
const R = path.join(__dirname, '..', 'results');
// With `--readings <key file> <reading A> <reading B>` the hazards, the decoys and the form of the questions are the
// two readers' (spec-readers.cjs: a mark counts when both give it), which is the registered measure; without it they
// are the rule-based scorer's, a cross-check known to be unreliable. O1, O2 and the reach are the code's either way.
const argv = process.argv.slice(2);
const at = argv.indexOf('--readings');
const readings = at >= 0 ? argv.splice(at, 4).slice(1) : null;
const dirs = argv;
if (!dirs.length || (readings && readings.length !== 3)) { console.error('usage: spec-tally.cjs [--readings <key file> <reading A> <reading B>] <result dir name> [...]'); process.exit(2); }
const merged = {};
if (readings) {
  const { reading, both } = require('./spec-readers.cjs');
  const key = JSON.parse(fs.readFileSync(readings[0], 'utf8'));
  const [A, B] = [readings[1], readings[2]].map(reading);
  for (const [name, id] of Object.entries(key)) if (A[name] && B[name]) merged[id] = { ...both(A[name], B[name]), A: A[name], B: B[name] };
}
console.log(readings ? 'marks: the two readers (both must give a mark)' : 'marks: the rule-based scorer (cross-check only; not the registered measure)');
const IDS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'];
const REFS = ['brainstorming', 'domain-language', 'module-design', 'prototyping'];
// The skills bk-spec was distilled from; a session of S read its source when one of them was launched with its text
// arriving, or one of their SKILL.md files was read without an error.
const SOURCE_SKILL = /^(superpowers:brainstorming|mattpocock-skills:(grilling|domain-modeling|codebase-design|prototype))$/;
const SOURCE_FILE = /skills\/(brainstorming|productivity\/grilling|engineering\/(domain-modeling|codebase-design|prototype))\/SKILL\.md/;

const content = (e) => (e.message && Array.isArray(e.message.content) ? e.message.content : []);
function session(dir, f, meta) {
  const c = JSON.parse(fs.readFileSync(path.join(R, dir, f), 'utf8'));
  const m = merged[`${dir}/${f.replace('.check.json', '')}`];
  // A session with no spec (O1 false) was given to no reader and scores nothing; one with a spec and no reading is
  // an error of the run, said aloud.
  if (readings && c.O1 && !m) { console.error(`NOT READ by both readers: ${dir}/${f}; no figure is printed until every spec has two readings`); process.exit(1); }
  if (readings) Object.assign(c, m ? { H1: m.H1, H2: m.H2, H3: m.H3, H4: m.H4, H5: m.H5, H6: m.H6, H7: m.H7, D: m.D, decoys: ['D1', 'D2', 'D3'].filter((k) => m[k]), questions: m.questions, G1: m.G1, G2: m.G2, disagree: m.disagree, HA: IDS.filter((k) => m.A[k]).length, HB: IDS.filter((k) => m.B[k]).length } : { H1: false, H2: false, H3: false, H4: false, H5: false, H6: false, H7: false, D: 0, decoys: [], questions: 0, G1: false, G2: false, disagree: [], HA: 0, HB: 0 });
  const letter = f.match(/-(?:natural|command)-([A-Z])\d+/)[1];
  const label = letter === 'K' ? (/-before$/.test(String(meta.kit && meta.kit.branch)) ? 'K-before' : 'K-after') : letter;
  const ev = events(fs.readFileSync(path.join(R, dir, f.replace('.check.json', '.raw.jsonl')), 'utf8'));
  const results = {};
  // A launched skill's text arrives as a user turn of its own right after the call's result ("Base directory for this
  // skill: <dir>"); `arrived` holds, per Skill call, whether that turn came before any other tool call.
  const arrived = {};
  let last = null;
  for (const e of ev) {
    if (e.type === 'assistant') for (const x of content(e)) if (x.type === 'tool_use') last = x.name === 'Skill' ? x.id : null;
    if (e.type !== 'user') continue;
    for (const x of content(e)) {
      if (x.type === 'tool_result') results[x.tool_use_id] = x;
      if (x.type === 'text' && /^Base directory for this skill:/.test(x.text || '') && last) arrived[last] = true;
    }
  }
  let cost = null; let model = '?'; let end = 'no result event'; let tools = 0; let refused = null; const skills = []; let viaSkill = false; let viaFile = false; let refusedSkill = false;
  for (const e of ev) {
    if (e.type === 'system' && e.subtype === 'init') model = e.model;
    if (e.type === 'result') { cost = e.total_cost_usd; end = e.subtype; refused = Array.isArray(e.permission_denials) ? e.permission_denials.length : 0; if ((e.permission_denials || []).some((d) => d.tool_name === 'Skill')) refusedSkill = true; }
    for (const x of content(e)) {
      if (x.type !== 'tool_use') continue;
      tools++;
      const r = results[x.id];
      const ok = !!r && !r.is_error;
      if (x.name === 'Skill') { const s = String((x.input || {}).skill || ''); skills.push(s); if (SOURCE_SKILL.test(s) && ok && arrived[x.id]) viaSkill = true; }
      // A source SKILL.md read by the Read tool, or printed by cat, head or tail, with no error.
      else if (ok && ((x.name === 'Read' && SOURCE_FILE.test(String((x.input || {}).file_path || '').replace(/\\/g, '/'))) || (x.name === 'Bash' && /^\s*(cat|head|tail)\b/.test(String((x.input || {}).command || '')) && SOURCE_FILE.test(String(x.input.command).replace(/\\/g, '/'))))) viaFile = true;
    }
  }
  return { id: `${dir}/${f.replace('.check.json', '')}`, label, c, H: IDS.filter((k) => c[k]).length, cost, model, end, tools, refused, skills, read: viaSkill || viaFile, viaSkill, viaFile, refusedSkill };
}

const rows = [];
for (const dir of dirs) {
  const meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8'));
  console.log(`${dir}: kit ${meta.kit && meta.kit.branch}@${String(meta.kit && meta.kit.commit).slice(0, 7)} dirty=${meta.kit && meta.kit.dirty}; cut ${JSON.stringify(meta.cut || [])}; stopped ${meta.stopped || 'no'}`);
  const files = fs.readdirSync(path.join(R, dir));
  for (const f of files.filter((n) => n.endsWith('.check.json')).sort()) rows.push(session(dir, f, meta));
  // A session the runner did not score (it outlived its kill) has a stream and no check file: named, never dropped.
  const unscored = files.filter((n) => n.endsWith('.raw.jsonl') && !files.includes(n.replace('.raw.jsonl', '.check.json')));
  if (unscored.length) console.log(`  NOT SCORED (no check file): ${unscored.join(', ')}`);
}
const n = (r, k) => r.filter((s) => s.c[k]).length;
const by = (label) => rows.filter((s) => s.label === label);
for (const label of ['F', 'K-before', 'K-after', 'S']) {
  const r = by(label);
  if (!r.length) continue;
  const costs = r.map((s) => s.cost).filter((x) => x !== null && x !== undefined).sort((a, b) => a - b);
  console.log(`\n${label}: ${r.length} sessions; models ${[...new Set(r.map((s) => s.model))].join(',')}; ends ${[...new Set(r.map((s) => s.end))].join(',')}`);
  console.log(`  H per session: ${r.map((s) => s.H).join(' ')}  median ${median(r.map((s) => s.H))}  mean ${(r.reduce((a, s) => a + s.H, 0) / r.length).toFixed(3)}`);
  console.log(`  ${IDS.map((k) => `${k} ${n(r, k)}`).join('  ')}  |  O1 ${n(r, 'O1')}  O2 ${n(r, 'O2')}  |  G1 ${n(r, 'G1')}  G2 ${n(r, 'G2')}  |  C ${n(r, 'C')}  P5 ${n(r, 'P5try')}  glossary changed ${n(r, 'glossaryChanged')}`);
  console.log(`  D sum ${r.reduce((a, s) => a + (s.c.D || 0), 0)} ${JSON.stringify(r.map((s) => (s.c.decoys || []).join('+') || '-'))}  |  open questions per spec ${JSON.stringify(r.map((s) => s.c.questions ?? '-'))}`);
  console.log(`  reach: bk-spec ${n(r, 'Rskill')}  ${REFS.map((k) => `${k} ${n(r, `R_${k}`)}`).join('  ')}`);
  console.log(`  cost median ${costs.length ? median(costs).toFixed(3) : '?'} (${costs.length ? costs[0].toFixed(3) : '?'}-${costs.length ? costs[costs.length - 1].toFixed(3) : '?'}, ${costs.length} sessions)  tools ${Math.min(...r.map((s) => s.tools))}-${Math.max(...r.map((s) => s.tools))}  refused ${r.reduce((a, s) => a + (s.refused || 0), 0)}${r.some((s) => s.refused === null) ? ' (some not recorded)' : ''}`);
  console.log(`  skills ${JSON.stringify(r.map((s) => s.skills.join('+') || '-'))}`);
  if (label === 'S') console.log(`  source read: ${r.filter((s) => s.read).length} of ${r.length} (a source skill launched with its text ${r.filter((s) => s.viaSkill).length}, a source SKILL.md read ${r.filter((s) => s.viaFile).length}); Skill calls refused in ${r.filter((s) => s.refusedSkill).length} sessions`);
}
const H = (label) => by(label).map((s) => s.H);
const p = (a, b) => (H(a).length && H(b).length ? permutationTest(H(a), H(b)) : null);
if (readings) {
  // Each reader alone, for the registered safeguard: the primary test must fall on the same side under either.
  const alone = (k) => (label) => by(label).map((s) => s.c[k]);
  const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
  // Met: p <= 0.05 with K-after's mean above. The registered safeguard needs it under each reader alone as well.
  const met = (a, b) => a.length > 0 && b.length > 0 && permutationTest(a, b) <= 0.05 && mean(a) > mean(b);
  for (const k of ['HA', 'HB']) { const g = alone(k); const [a, b] = [g('K-after'), g('K-before')]; console.log(`\nreader ${k[1]} alone: K-after ${a.join(' ')} (mean ${mean(a).toFixed(3)}) | K-before ${b.join(' ')} (mean ${mean(b).toFixed(3)}) | p = ${a.length && b.length ? permutationTest(a, b) : null} | ${met(a, b) ? 'met' : 'not met'}`); }
  console.log(`primary on both readers' marks: ${met(by('K-after').map((s) => s.H), by('K-before').map((s) => s.H)) ? 'met' : 'not met'}; the bar needs all three met`);
  // Agreement on the hazard marks of the specs that were read (the registered floor is 90%).
  const read = rows.filter((s) => s.c.O1);
  const split = read.reduce((a, s) => a + (s.c.disagree || []).filter((k) => IDS.includes(k)).length, 0);
  const agree = read.length ? 1 - split / (read.length * 7) : 1;
  console.log(`readers agree on ${read.length * 7 - split} of ${read.length * 7} hazard marks (${(100 * agree).toFixed(1)}%)${agree < 0.9 ? ': BELOW THE REGISTERED 90%, the reading is not to be used' : ''}`);
  if (agree < 0.9) process.exitCode = 1;
  const dis = rows.filter((s) => (s.c.disagree || []).length);
  console.log(`readers disagree in ${dis.length} of ${rows.length} sessions${dis.length ? ': ' + dis.map((s) => `${s.id} (${s.c.disagree.join(' ')})`).join('; ') : ''}`);
}
console.log(`\nprimary, H K-after vs K-before: p = ${p('K-after', 'K-before')}`);
console.log(`sources, H K-after vs S: p = ${p('K-after', 'S')}`);
console.log(`described, H K-after vs F: p = ${p('K-after', 'F')}   K-before vs F: p = ${p('K-before', 'F')}   (no bar)`);
