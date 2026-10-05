// Readers of plan-01 (docs/specs/2026-10-03-bk-plan-design.md, "Calibration"). The readers are sub-agents; this
// script only prepares what they read and compares what they return. spec-readers.cjs is bound to spec-01 and stays
// as it is; this file is its counterpart for plans.
//   blind-gate  node evals/analysis/plan-readers.cjs blind-gate <out dir> <key file> <seed>
//           copies the gate plans (evals/bench/plan-01/gate/g*.md) and the rubric to <out dir>, the plans under
//           neutral names in an order shuffled by the seed, and writes the key (neutral name -> gate file).
//   gate    node evals/analysis/plan-readers.cjs gate <key file> <reading A .jsonl> <reading B .jsonl>
//           compares two readings of the gate plans with expected.json and with each other, and says PASS or FAIL by
//           the registered rule. There is no rule-based scorer for plan-01 to print beside them.
//   blind   node evals/analysis/plan-readers.cjs blind <out dir> <key file> <seed> <result dir name> [...]
//           copies each session's plan (the `plan` field of its check file, where O1 holds) and the rubric to
//           <out dir>, the plans under neutral names (p01.md, …) in an order shuffled by the seed, and writes the key
//           (neutral name -> result dir/session).
//   merge   node evals/analysis/plan-readers.cjs merge <key file> <reading A .jsonl> <reading B .jsonl>
//           prints, per session, the marks both readers gave, P, O1 and O2 from its check file, whether the runner
//           cut it, and every disagreement; a session of those result directories that left no plan is named; then
//           the readers' agreement on the hazard cells.
// <out dir> must not exist or must be empty, and <key file> must lie outside it: a reader is given the directory and
// never the key. A reading is a .jsonl file, one line per plan.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const R = path.join(__dirname, '..', 'results');
const TASK = path.join(__dirname, '..', 'bench', 'plan-01');
const HAZARDS = ['P1', 'P2', 'P3', 'P4', 'P5'];
const REPORTED = ['C1'];
const FORM = ['numbered', 'recommended'];
const MARKS = [...HAZARDS, ...REPORTED, ...FORM];
const GATE = path.join(TASK, 'gate');
// The gate's rule, per reader (registered in the spec, "Step 3", before any gate reading): at most one plan marked
// wrong on any one hazard or form item across the gate plans, and the count of questions exact on all but two plans.
const GATED = [...HAZARDS, ...FORM];
const GATE_RULE = { perItem: 1, countMisses: 2 };

// A reading: one JSON object per line, keyed by the plan's file name. A line that is not JSON, lacks a key or marks a
// plan a second time is refused, not skipped.
function reading(file) {
  const out = {};
  for (const [i, line] of fs.readFileSync(file, 'utf8').split('\n').entries()) {
    if (!line.trim()) continue;
    let o; try { o = JSON.parse(line); } catch { throw new Error(`${file}:${i + 1}: not JSON`); }
    if (!o || typeof o !== 'object' || typeof o.plan !== 'string' || !o.plan || out[o.plan]) throw new Error(`${file}:${i + 1}: no plan name, or a plan marked twice`);
    for (const k of MARKS) if (typeof o[k] !== 'boolean') throw new Error(`${file}:${i + 1}: ${k} is not true or false`);
    if (!Number.isInteger(o.questions) || o.questions < 0) throw new Error(`${file}:${i + 1}: questions is not a count`);
    out[o.plan] = o;
  }
  return out;
}

// Both readers together: a mark holds when both give it; the questions are the larger count (the cap is a cap).
function both(a, b) {
  const out = {};
  for (const k of MARKS) out[k] = a[k] && b[k];
  out.questions = Math.max(a.questions, b.questions);
  out.P = HAZARDS.filter((k) => out[k]).length;
  // G1: every question numbered and recommended; a plan that leaves none is reported apart (null), not failed.
  out.G1 = out.questions === 0 ? null : out.numbered && out.recommended;
  out.G2 = out.questions <= 4;
  out.disagree = [...MARKS, 'questions'].filter((k) => a[k] !== b[k]);
  return out;
}

// A deterministic shuffle: the same seed gives the same order.
function shuffle(list, seed) {
  let s = 0;
  for (const c of String(seed)) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  const next = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(next() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

// The plans of the named result directories: one item per check file where O1 holds, in directory then file order.
function plans(dirs, root = R) {
  const items = [];
  for (const dir of dirs) for (const f of fs.readdirSync(path.join(root, dir)).filter((n) => n.endsWith('.check.json')).sort()) {
    const c = JSON.parse(fs.readFileSync(path.join(root, dir, f), 'utf8'));
    if (c.O1 && typeof c.plan === 'string') items.push({ id: `${dir}/${f.replace('.check.json', '')}`, text: c.plan });
  }
  return items;
}

// Writes the items ({ id, text }) to outDir as p01.md, p02.md, … in shuffled order, the rubric beside them, and the
// key to keyFile. Refuses a directory that already holds files and a key inside the directory.
function writeBlind(outDir, keyFile, seed, items) {
  const rel = path.relative(path.resolve(outDir), path.resolve(keyFile));
  if (!rel.startsWith('..') && !path.isAbsolute(rel)) throw new Error('the key file must lie outside the out dir');
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) throw new Error(`${outDir} is not empty`);
  fs.mkdirSync(outDir, { recursive: true });
  const key = {};
  shuffle(items, seed).forEach((s, i) => { const name = `p${String(i + 1).padStart(2, '0')}.md`; fs.writeFileSync(path.join(outDir, name), s.text); key[name] = s.id; });
  fs.copyFileSync(path.join(TASK, 'rubric.md'), path.join(outDir, 'rubric.md'));
  fs.mkdirSync(path.dirname(path.resolve(keyFile)), { recursive: true });
  fs.writeFileSync(keyFile, JSON.stringify(key, null, 2) + '\n');
  return key;
}

// Two readings against the key: per session the marks both gave, with O1, O2 and the runner's cut flag from the
// result directory; and the agreement on the hazard cells (cells both readers marked alike, of all hazard cells of
// the plans both read). A session of the same result directories that left no plan (O1 false, so it was never handed
// to the readers) is listed too, with no marks and no P. A reading that marks a plan the key does not hold, and a key
// entry whose check file is missing, are refused.
function merge(key, A, B, root = R) {
  for (const [who, r] of [['A', A], ['B', B]]) for (const name of Object.keys(r)) if (!key[name]) throw new Error(`reading ${who} marks ${name}, which is not in the key`);
  const split = (id) => ({ dir: id.slice(0, id.lastIndexOf('/')), base: id.slice(id.lastIndexOf('/') + 1) });
  const outcomeOf = (id) => {
    const { dir, base } = split(id);
    const c = JSON.parse(fs.readFileSync(path.join(root, dir, `${base}.check.json`), 'utf8'));
    const metaFile = path.join(root, dir, 'meta.json');
    const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};
    return { O1: c.O1 === true, O2: c.O2 === true, cut: (meta.cut || []).includes(base) };
  };
  const rows = [];
  let same = 0;
  let cells = 0;
  for (const [name, id] of Object.entries(key)) {
    const { dir, base } = split(id);
    if (!fs.existsSync(path.join(root, dir, `${base}.check.json`))) throw new Error(`${id}: no check file under ${root}`);
    const outcome = outcomeOf(id);
    if (!A[name] || !B[name]) { rows.push({ id, name, notRead: `${!A[name] ? 'A' : ''}${!B[name] ? 'B' : ''}`, ...outcome }); continue; }
    for (const k of HAZARDS) { cells++; if (A[name][k] === B[name][k]) same++; }
    rows.push({ id, name, ...both(A[name], B[name]), ...outcome });
  }
  const inKey = new Set(Object.values(key));
  for (const dir of [...new Set(Object.values(key).map((id) => split(id).dir))]) for (const f of fs.readdirSync(path.join(root, dir)).filter((n) => n.endsWith('.check.json')).sort()) {
    const id = `${dir}/${f.replace('.check.json', '')}`;
    if (!inKey.has(id)) rows.push({ id, noPlan: true, ...outcomeOf(id) });
  }
  return { rows, agreement: { same, cells, rate: cells ? same / cells : null } };
}

// The gate plans (evals/bench/plan-01/gate/g*.md), as items for writeBlind.
function gatePlans(dir = GATE) {
  return fs.readdirSync(dir).filter((n) => /^g\d+\.md$/.test(n)).sort().map((n) => ({ id: n, text: fs.readFileSync(path.join(dir, n), 'utf8') }));
}

// The gate: each reading against the expected marks, by the rule above. `key` maps the neutral names to gate files.
// C1 is reported in the expected marks and is not part of the rule.
function gate(key, A, B, expected, rule = GATE_RULE) {
  const names = Object.keys(key);
  const report = (r) => {
    const missing = names.filter((n) => !r[n]);
    if (missing.length) return { pass: false, missing, wrong: {}, counts: [] };
    const wrong = {};
    for (const k of MARKS) wrong[k] = names.filter((n) => r[n][k] !== expected[key[n]][k]).map((n) => key[n]);
    const counts = names.filter((n) => r[n].questions !== expected[key[n]].questions).map((n) => key[n]);
    return { pass: GATED.every((k) => wrong[k].length <= rule.perItem) && counts.length <= rule.countMisses, missing, wrong, counts };
  };
  return { A: report(A), B: report(B) };
}

module.exports = { reading, both, shuffle, plans, writeBlind, merge, gatePlans, gate, GATE_RULE, GATED, HAZARDS, REPORTED, FORM, MARKS };

if (require.main === module) {
  const [cmd, ...args] = process.argv.slice(2);
  const usage = () => { console.error('usage: plan-readers.cjs blind-gate <out dir> <key file> <seed> | gate <key file> <A> <B> | blind <out dir> <key file> <seed> <result dir name> [...] | merge <key file> <A> <B>'); process.exit(2); };
  if (cmd === 'blind') {
    const [outDir, keyFile, seed, ...dirs] = args;
    if (!outDir || !keyFile || !seed || !dirs.length) usage();
    const items = plans(dirs);
    writeBlind(outDir, keyFile, seed, items);
    console.log(`${items.length} plans and the rubric written to ${outDir}; key at ${keyFile}`);
  } else if (cmd === 'blind-gate') {
    const [outDir, keyFile, seed] = args;
    if (!outDir || !keyFile || !seed) usage();
    const items = gatePlans();
    writeBlind(outDir, keyFile, seed, items);
    console.log(`${items.length} gate plans and the rubric written to ${outDir}; key at ${keyFile}`);
  } else if (cmd === 'gate') {
    const [keyFile, a, b] = args;
    if (!keyFile || !a || !b) usage();
    const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(path.join(GATE, 'expected.json'), 'utf8'));
    const [A, B] = [a, b].map(reading);
    const g = gate(key, A, B, expected);
    const names = Object.keys(key);
    for (const [who, r, mine] of [['A', g.A, A], ['B', g.B, B]]) {
      const n = (ks) => ks.reduce((s, k) => s + (r.wrong[k] || []).length, 0);
      console.log(`reader ${who}: ${r.pass ? 'PASS' : 'FAIL'}; hazard marks ${names.length * HAZARDS.length - n(HAZARDS)} of ${names.length * HAZARDS.length}, form marks ${names.length * FORM.length - n(FORM)} of ${names.length * FORM.length}, question counts ${names.length - r.counts.length} of ${names.length}, C1 (not gated) ${names.length - n(REPORTED)} of ${names.length}${r.missing.length ? `; NOT READ: ${r.missing.join(' ')}` : ''}`);
      for (const k of MARKS) if ((r.wrong[k] || []).length) console.log(`  ${k} wrong on ${r.wrong[k].join(' ')}`);
      if (r.counts.length) console.log(`  question count differs on ${r.counts.map((f) => `${f} (${mine[names.find((x) => key[x] === f)].questions}, expected ${expected[f].questions})`).join(' ')}`);
    }
    const dis = names.filter((nm) => A[nm] && B[nm] && both(A[nm], B[nm]).disagree.length).map((nm) => `${key[nm]} (${both(A[nm], B[nm]).disagree.join(' ')})`);
    console.log(`the readers disagree on ${dis.length ? dis.join('; ') : 'nothing'}`);
    console.log(`gate: ${g.A.pass && g.B.pass ? 'PASS' : 'FAIL'}`);
    if (!(g.A.pass && g.B.pass)) process.exitCode = 1;
  } else if (cmd === 'merge') {
    const [keyFile, a, b] = args;
    if (!keyFile || !a || !b) usage();
    const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    const m = merge(key, reading(a), reading(b));
    for (const r of m.rows) {
      if (r.noPlan) { console.log(`${r.id}: NO PLAN (O1 ${r.O1}, O2 ${r.O2}${r.cut ? ', cut' : ''}); not read, no P`); continue; }
      if (r.notRead) { console.log(`${r.id}: NOT READ by ${r.notRead}`); process.exitCode = 1; continue; }
      const { name, ...row } = r;
      console.log(JSON.stringify(row));
    }
    const g = m.agreement;
    console.log(`agreement on the hazard cells: ${g.same} of ${g.cells}${g.cells ? ` (${(g.rate * 100).toFixed(1)}%)` : ''}`);
  } else usage();
}
