// Tally of a plan-01 run (docs/specs/2026-10-03-bk-plan-design.md, "Step 5": PROPOSED until the owner approves its
// bars). Modelled on spec-tally.cjs, which is bound to spec-01. Read only.
// Each session's branch is its file's letter (K, S, F) and, for K, the kit branch recorded in the directory's
// meta.json: a branch whose name ends in "-before" is K-before, any other is K-after. The hazards, the form of the
// questions and their count are the two readers' (plan-readers.cjs: a mark holds when both give it); O1, O2 and the
// reach are the fixture check's. There is no rule-based scorer for plans, so the readings are required.
// Prints, per branch: P per session, each hazard, the form items, the outcomes, the reach with each session's clock
// time, cost and tools, the skills launched, and for S the "source read" count; then the tests (exact two-sided
// permutation on P), each reader alone, and the readers' agreement.
// Usage, from the repository root:
//   node evals/analysis/plan-tally.cjs --readings <key file> <reading A> <reading B> <result dir name> [...]
//     --root <dir>  reads the result directories under <dir> instead of evals/results. For the test only: the
//                   evidence copied into the repository holds no raw stream, so no run is tallied again from it.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { permutationTest, median, events } = require('../../scripts/lib/bench-score.cjs');
const { reading, both, HAZARDS } = require('./plan-readers.cjs');
const R = path.join(__dirname, '..', 'results');
const REFS = ['writing-plans', 'vertical-slices'];
// The primary is not concluded with fewer plans than this in either kit branch.
const MIN_PLANS = 6;
// The skills bk-plan was distilled from; a session of S read its source when one of them was launched with its text
// arriving, or one of their SKILL.md files was read without an error.
const SOURCE_SKILL = /^(superpowers:writing-plans|mattpocock-skills:to-tickets)$/;
const SOURCE_FILE = /skills\/(writing-plans|engineering\/to-tickets)\/SKILL\.md/;

// K-before or K-after from the kit branch the runner recorded; S and F are their letter.
function label(letter, kitBranch) {
  if (letter !== 'K') return letter;
  return /-before$/.test(String(kitBranch)) ? 'K-before' : 'K-after';
}

const content = (e) => (e.message && Array.isArray(e.message.content) ? e.message.content : []);

// What a session's stream shows: model, cost, how it ended, tool calls, refusals, the skills launched, and whether a
// source skill was read (launched with its text arriving, or its SKILL.md read or printed without an error).
function stream(ev) {
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
  const out = { cost: null, model: '?', initTools: null, end: 'no result event', tools: 0, refused: null, skills: [], viaSkill: false, viaFile: false, refusedSkill: false };
  for (const e of ev) {
    // The number of tools the session started with: cost and token figures compare only between equal counts.
    if (e.type === 'system' && e.subtype === 'init') { out.model = e.model; out.initTools = Array.isArray(e.tools) ? e.tools.length : null; }
    if (e.type === 'result') { out.cost = e.total_cost_usd; out.end = e.subtype; out.refused = Array.isArray(e.permission_denials) ? e.permission_denials.length : 0; if ((e.permission_denials || []).some((d) => d.tool_name === 'Skill')) out.refusedSkill = true; }
    for (const x of content(e)) {
      if (x.type !== 'tool_use') continue;
      out.tools++;
      const r = results[x.id];
      const ok = !!r && !r.is_error;
      if (x.name === 'Skill') { const s = String((x.input || {}).skill || ''); out.skills.push(s); if (SOURCE_SKILL.test(s) && ok && arrived[x.id]) out.viaSkill = true; }
      else if (ok && ((x.name === 'Read' && SOURCE_FILE.test(String((x.input || {}).file_path || '').replace(/\\/g, '/'))) || (x.name === 'Bash' && /^\s*(cat|head|tail)\b/.test(String((x.input || {}).command || '')) && SOURCE_FILE.test(String(x.input.command).replace(/\\/g, '/'))))) out.viaFile = true;
    }
  }
  out.read = out.viaSkill || out.viaFile;
  return out;
}

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
// Met: p <= 0.05 with the first group's mean above.
const met = (a, b) => a.length > 0 && b.length > 0 && permutationTest(a, b) <= 0.05 && mean(a) > mean(b);

// The cost of branch a against branch b: a ratio of the two medians when every session of both started with the same
// number of tools, the two medians labelled not comparable when they did not, a dash when a median is missing.
function costRatio(medA, medB, toolsA, toolsB) {
  if (medA === null || medB === null || !medB) return '-';
  const counts = new Set([...toolsA, ...toolsB]);
  if (counts.size !== 1 || counts.has(null)) return `${medA.toFixed(3)} and ${medB.toFixed(3)}, not comparable (different tools)`;
  return (medA / medB).toFixed(2);
}

// The main program: prints the tables and returns the exit status (0; 1 when a plan was not read by both readers, a
// kit branch has too few plans, or the readers agree on under 90%; 2 on a bad command line).
function main(args) {
  const argv = args.slice();
  const rt = argv.indexOf('--root');
  const root = rt >= 0 ? argv.splice(rt, 2)[1] : R;
  let code = 0;
  const at = argv.indexOf('--readings');
  const readings = at >= 0 ? argv.splice(at, 4).slice(1) : null;
  const dirs = argv;
  if (!root || !dirs.length || !readings || readings.length !== 3) { console.error('usage: plan-tally.cjs [--root <dir>] --readings <key file> <reading A> <reading B> <result dir name> [...]'); return 2; }
  const key = JSON.parse(fs.readFileSync(readings[0], 'utf8'));
  const [A, B] = [readings[1], readings[2]].map(reading);
  // As plan-readers.cjs merge: a reading that marks a plan the key does not hold is refused, not passed over.
  for (const [who, r] of [['A', A], ['B', B]]) for (const name of Object.keys(r)) if (!key[name]) { console.error(`reading ${who} marks ${name}, which is not in the key`); return 1; }
  const merged = {};
  for (const [name, id] of Object.entries(key)) if (A[name] && B[name]) merged[id] = { ...both(A[name], B[name]), A: A[name], B: B[name] };
  const none = Object.fromEntries([...HAZARDS, 'C1', 'numbered', 'recommended'].map((k) => [k, false]));

  const rows = [];
  for (const dir of dirs) {
    const meta = JSON.parse(fs.readFileSync(path.join(root, dir, 'meta.json'), 'utf8'));
    console.log(`${dir}: kit ${meta.kit && meta.kit.branch}@${String(meta.kit && meta.kit.commit).slice(0, 7)} dirty=${meta.kit && meta.kit.dirty}; cut ${JSON.stringify(meta.cut || [])}; stopped ${meta.stopped || 'no'}`);
    const files = fs.readdirSync(path.join(root, dir));
    for (const f of files.filter((n) => n.endsWith('.check.json')).sort()) {
      const base = f.replace('.check.json', '');
      const id = `${dir}/${base}`;
      const c = JSON.parse(fs.readFileSync(path.join(root, dir, f), 'utf8'));
      const m = merged[id];
      // A session with no plan (O1 false) was given to no reader and has no P; one with a plan and no reading is an
      // error of the run, said aloud.
      if (c.O1 && !m) { console.error(`NOT READ by both readers: ${id}; no figure is printed until every plan has two readings`); return 1; }
      const marks = m ? m : { ...none, questions: 0, P: null, G1: null, G2: null, disagree: [], A: none, B: none };
      const rawFile = path.join(root, dir, `${base}.raw.jsonl`);
      const s = stream(events(fs.readFileSync(rawFile, 'utf8')));
      const letter = f.match(/-(?:natural|command)-([A-Z])\d+/)[1];
      rows.push({ id, label: label(letter, meta.kit && meta.kit.branch), c, m: marks, noPlan: !c.O1, cut: (meta.cut || []).includes(base), at: fs.statSync(rawFile).mtime.toISOString(), PA: HAZARDS.filter((k) => marks.A[k]).length, PB: HAZARDS.filter((k) => marks.B[k]).length, ...s });
    }
    // A session the runner did not check (it outlived its kill) has a stream and no check file: named, never dropped.
    const unchecked = files.filter((n) => n.endsWith('.raw.jsonl') && !files.includes(n.replace('.raw.jsonl', '.check.json')));
    if (unchecked.length) console.log(`  NOT CHECKED (no check file): ${unchecked.join(', ')}`);
  }

  const by = (l) => rows.filter((s) => s.label === l);
  // P of the sessions that left a plan; a session with no plan has no P and is counted under O1 only.
  const P = (l, k = 'P') => by(l).filter((s) => !s.noPlan).map((s) => (k === 'P' ? s.m.P : s[k]));
  const n = (r, f) => r.filter(f).length;
  for (const l of ['F', 'K-before', 'K-after', 'S']) {
    const r = by(l);
    if (!r.length) continue;
    const read = r.filter((s) => !s.noPlan);
    const costs = r.map((s) => s.cost).filter((x) => x !== null && x !== undefined).sort((a, b) => a - b);
    console.log(`\n${l}: ${r.length} sessions (${read.length} with a plan${n(r, (s) => s.cut) ? `, ${n(r, (s) => s.cut)} cut` : ''}); models ${[...new Set(r.map((s) => s.model))].join(',')}; ends ${[...new Set(r.map((s) => s.end))].join(',')}`);
    console.log(`  P per session: ${read.map((s) => s.m.P).join(' ')}  median ${read.length ? median(read.map((s) => s.m.P)) : '-'}  mean ${read.length ? mean(read.map((s) => s.m.P)).toFixed(3) : '-'}`);
    console.log(`  ${HAZARDS.map((k) => `${k} ${n(read, (s) => s.m[k])}`).join('  ')}  |  C1 ${n(read, (s) => s.m.C1)}  |  O1 ${n(r, (s) => s.c.O1)}  O2 ${n(r, (s) => s.c.O2)}  |  G1 ${n(read, (s) => s.m.G1 === true)} (no question: ${n(read, (s) => s.m.G1 === null)})  G2 ${n(read, (s) => s.m.G2)}`);
    console.log(`  questions per plan ${JSON.stringify(read.map((s) => s.m.questions))}`);
    console.log(`  reach: bk-plan ${n(r, (s) => s.c.Rskill)}  ${REFS.map((k) => `${k} ${n(r, (s) => s.c[`R_${k}`])}`).join('  ')}`);
    // In clock order (the time the session's stream was last written), so a reach that stops midway shows.
    console.log(`  reach in clock order: ${[...r].sort((a, b) => (a.at < b.at ? -1 : 1)).map((s) => `${s.at.slice(11, 16)}Z ${s.c.Rskill ? 'S' : '-'}${REFS.map((k) => (s.c[`R_${k}`] ? k[0].toUpperCase() : '-')).join('')}`).join('  ')}`);
    console.log(`  cost median ${costs.length ? median(costs).toFixed(3) : '?'} (${costs.length ? costs[0].toFixed(3) : '?'}-${costs.length ? costs[costs.length - 1].toFixed(3) : '?'}, ${costs.length} sessions)  tool calls ${Math.min(...r.map((s) => s.tools))}-${Math.max(...r.map((s) => s.tools))}  tools in init ${[...new Set(r.map((s) => s.initTools))].join(',')}  refused ${r.reduce((a, s) => a + (s.refused || 0), 0)}${r.some((s) => s.refused === null) ? ' (some not recorded)' : ''}`);
    console.log(`  skills ${JSON.stringify(r.map((s) => s.skills.join('+') || '-'))}`);
    if (l === 'S') console.log(`  source read: ${n(r, (s) => s.read)} of ${r.length} (a source skill launched with its text ${n(r, (s) => s.viaSkill)}, a source SKILL.md read ${n(r, (s) => s.viaFile)}); Skill calls refused in ${n(r, (s) => s.refusedSkill)} sessions`);
  }

  const p = (a, b, k) => (P(a, k).length && P(b, k).length ? permutationTest(P(a, k), P(b, k)) : null);
  for (const k of ['PA', 'PB']) { const [a, b] = [P('K-after', k), P('K-before', k)]; console.log(`\nreader ${k[1]} alone: K-after ${a.join(' ')} (mean ${mean(a).toFixed(3)}) | K-before ${b.join(' ')} (mean ${mean(b).toFixed(3)}) | p = ${p('K-after', 'K-before', k)} | ${met(a, b) ? 'met' : 'not met'}`); }
  console.log(`primary on both readers' marks: ${met(P('K-after'), P('K-before')) ? 'met' : 'not met'}; bars 1 and 2 need all three met`);
  // What the text adds: plans passing P1 plus plans passing P3, K-after against K-before.
  const added = (l) => by(l).filter((s) => !s.noPlan).reduce((a, s) => a + (s.m.P1 ? 1 : 0) + (s.m.P3 ? 1 : 0), 0);
  console.log(`P1 + P3 passes: K-after ${added('K-after')} | K-before ${added('K-before')} | ${added('K-after') > added('K-before') ? 'K-after above' : 'K-after not above'}`);
  // The primary needs at least six plans a side.
  for (const l of ['K-after', 'K-before']) if (by(l).length && P(l).length < MIN_PLANS) { console.log(`NOT CONCLUDED: ${l} has ${P(l).length} plans, fewer than the ${MIN_PLANS} the primary needs; "met" above does not stand`); code = 1; }
  const noPlan = rows.filter((s) => s.noPlan);
  if (noPlan.length) console.log(`NO PLAN (no P, counted under O1 only): ${noPlan.map((s) => `${s.id} [${s.label}]`).join(', ')}`);
  // Cost: a ratio of medians only between two branches whose sessions all started with the same number of tools.
  const med = (l) => { const c = by(l).map((s) => s.cost).filter((x) => x !== null && x !== undefined); return c.length ? median(c) : null; };
  const pair = (a, b) => `${a} / ${b} ${costRatio(med(a), med(b), by(a).map((s) => s.initTools), by(b).map((s) => s.initTools))}`;
  console.log(`cost: ${pair('K-after', 'K-before')}   ${pair('K-after', 'F')}   ${pair('K-after', 'S')}`);
  // Agreement on the hazard marks of the plans that were read.
  const read = rows.filter((s) => !s.noPlan);
  const split = read.reduce((a, s) => a + s.m.disagree.filter((k) => HAZARDS.includes(k)).length, 0);
  const cells = read.length * HAZARDS.length;
  const agree = cells ? 1 - split / cells : 1;
  console.log(`readers agree on ${cells - split} of ${cells} hazard marks (${(100 * agree).toFixed(1)}%)${agree < 0.9 ? ': BELOW 90%, the reading is not to be used' : ''}`);
  if (agree < 0.9) code = 1;
  const dis = read.filter((s) => s.m.disagree.length);
  console.log(`readers disagree in ${dis.length} of ${read.length} plans${dis.length ? ': ' + dis.map((s) => `${s.id} (${s.m.disagree.join(' ')})`).join('; ') : ''}`);
  console.log(`\nprimary, P K-after vs K-before: p = ${p('K-after', 'K-before')}`);
  console.log(`sources, P K-after vs S: p = ${p('K-after', 'S')}`);
  console.log(`described, P K-after vs F: p = ${p('K-after', 'F')}   K-before vs F: p = ${p('K-before', 'F')}   (no bar)`);
  return code;
}

module.exports = { label, stream, met, mean, costRatio, main, SOURCE_SKILL, SOURCE_FILE, MIN_PLANS };

if (require.main === module) process.exitCode = main(process.argv.slice(2));
