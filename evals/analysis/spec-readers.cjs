// Readers of spec-01 (docs/specs/2026-10-02-bk-spec-design.md, "Addendum: scoring by blind reading"). The readers are
// sub-agents; this script only prepares what they read and compares what they return.
//   blind-gate  node evals/analysis/spec-readers.cjs blind-gate <out dir> <key file> <seed>
//               copies the gate specs (evals/bench/spec-01/gate/g*.md) and the rubric to <out dir>, the specs under
//               neutral names in an order shuffled by the seed, and writes the key (neutral name -> gate file).
//   gate        node evals/analysis/spec-readers.cjs gate <key file> <reading A .jsonl> <reading B .jsonl>
//               compares two readings of the gate specs with expected.json and with each other, prints the rule-based
//               scorer's marks on the same specs beside them, and says PASS or FAIL by the registered rule.
//   blind       node evals/analysis/spec-readers.cjs blind <out dir> <key file> <seed> <result dir name> [...]
//               the same for a run: each scored session's spec (the `spec` field of its check file).
//   merge       node evals/analysis/spec-readers.cjs merge <key file> <reading A .jsonl> <reading B .jsonl>
//               prints, per session, the marks both readers gave and every disagreement.
// <out dir> must not exist or must be empty, and <key file> must lie outside it: a reader is given the directory and
// never the key.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const R = path.join(__dirname, '..', 'results');
const TASK = path.join(__dirname, '..', 'bench', 'spec-01');
const GATE = path.join(TASK, 'gate');
const HAZARDS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'];
const DECOYS = ['D1', 'D2', 'D3'];
const FORM = ['numbered', 'recommended'];
// The gate's rule, per reader: at most one wrong mark on any one hazard, decoy or form item across the gate specs,
// and the count of questions exact on all but two specs.
const GATE_RULE = { perItem: 1, countMisses: 2 };

// A reading: one JSON object per line, keyed by the spec's file name. Lines that are not JSON are refused, not skipped.
function reading(file) {
  const out = {};
  for (const [i, line] of fs.readFileSync(file, 'utf8').split('\n').entries()) {
    if (!line.trim()) continue;
    let o; try { o = JSON.parse(line); } catch { throw new Error(`${file}:${i + 1}: not JSON`); }
    if (!o.spec || out[o.spec]) throw new Error(`${file}:${i + 1}: no spec name, or a spec marked twice`);
    for (const k of [...HAZARDS, ...DECOYS, ...FORM]) if (typeof o[k] !== 'boolean') throw new Error(`${file}:${i + 1}: ${k} is not true or false`);
    if (!Number.isInteger(o.questions) || o.questions < 0) throw new Error(`${file}:${i + 1}: questions is not a count`);
    out[o.spec] = o;
  }
  return out;
}

// Both readers together: a mark holds when both give it; the questions are the larger count (the cap is a cap).
function both(a, b) {
  const out = {};
  for (const k of [...HAZARDS, ...DECOYS, ...FORM]) out[k] = a[k] && b[k];
  out.questions = Math.max(a.questions, b.questions);
  out.H = HAZARDS.filter((k) => out[k]).length;
  out.D = DECOYS.filter((k) => out[k]).length;
  out.G1 = out.questions > 0 && out.numbered && out.recommended;
  out.G2 = out.questions <= 4;
  out.disagree = [...HAZARDS, ...DECOYS, ...FORM, 'questions'].filter((k) => a[k] !== b[k]);
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

// Writes the items ({ id, text }) to outDir as s01.md, s02.md, … in shuffled order, the rubric beside them, and the
// key to keyFile. Refuses a directory that already holds files and a key inside the directory.
function writeBlind(outDir, keyFile, seed, items) {
  if (!path.relative(path.resolve(outDir), path.resolve(keyFile)).startsWith('..')) throw new Error('the key file must lie outside the out dir');
  if (fs.existsSync(outDir) && fs.readdirSync(outDir).length) throw new Error(`${outDir} is not empty`);
  fs.mkdirSync(outDir, { recursive: true });
  const key = {};
  shuffle(items, seed).forEach((s, i) => { const name = `s${String(i + 1).padStart(2, '0')}.md`; fs.writeFileSync(path.join(outDir, name), s.text); key[name] = s.id; });
  fs.copyFileSync(path.join(TASK, 'rubric.md'), path.join(outDir, 'rubric.md'));
  fs.mkdirSync(path.dirname(path.resolve(keyFile)), { recursive: true });
  fs.writeFileSync(keyFile, JSON.stringify(key, null, 2) + '\n');
  return key;
}

// The gate: each reading against the expected marks, by the rule above. `key` maps the neutral names to gate files.
function gate(key, A, B, expected, rule = GATE_RULE) {
  const names = Object.keys(key);
  const report = (r) => {
    const missing = names.filter((n) => !r[n]);
    if (missing.length) return { pass: false, missing, wrong: {}, counts: 0 };
    const wrong = {};
    for (const k of [...HAZARDS, ...DECOYS, ...FORM]) wrong[k] = names.filter((n) => r[n][k] !== expected[key[n]][k]).map((n) => key[n]);
    const counts = names.filter((n) => r[n].questions !== expected[key[n]].questions).map((n) => key[n]);
    return { pass: Object.values(wrong).every((w) => w.length <= rule.perItem) && counts.length <= rule.countMisses, missing, wrong, counts };
  };
  return { A: report(A), B: report(B) };
}

module.exports = { reading, both, shuffle, writeBlind, gate, GATE_RULE, HAZARDS, DECOYS, FORM };

if (require.main === module) {
  const [cmd, ...args] = process.argv.slice(2);
  const usage = () => { console.error('usage: spec-readers.cjs blind-gate <out dir> <key file> <seed> | gate <key file> <A> <B> | blind <out dir> <key file> <seed> <result dir name> [...] | merge <key file> <A> <B>'); process.exit(2); };
  if (cmd === 'blind-gate') {
    const [outDir, keyFile, seed] = args;
    if (!outDir || !keyFile || !seed) usage();
    const items = fs.readdirSync(GATE).filter((n) => /^g\d+\.md$/.test(n)).sort().map((n) => ({ id: n, text: fs.readFileSync(path.join(GATE, n), 'utf8') }));
    writeBlind(outDir, keyFile, seed, items);
    console.log(`${items.length} gate specs and the rubric written to ${outDir}; key at ${keyFile}`);
  } else if (cmd === 'gate') {
    const [keyFile, a, b] = args;
    if (!keyFile || !a || !b) usage();
    const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    const expected = JSON.parse(fs.readFileSync(path.join(GATE, 'expected.json'), 'utf8'));
    const { score } = require('../bench/spec-01/build.cjs');
    const [A, B] = [a, b].map(reading);
    const g = gate(key, A, B, expected);
    const names = Object.keys(key);
    for (const [who, r] of [['A', g.A], ['B', g.B]]) {
      const n = (ks) => ks.reduce((s, k) => s + (r.wrong[k] || []).length, 0);
      console.log(`reader ${who}: ${r.pass ? 'PASS' : 'FAIL'}; hazard marks ${names.length * 7 - n(HAZARDS)} of ${names.length * 7}, decoy marks ${names.length * 3 - n(DECOYS)} of ${names.length * 3}, form marks ${names.length * 2 - n(FORM)} of ${names.length * 2}, question counts ${names.length - r.counts.length} of ${names.length}${r.missing.length ? `; NOT READ: ${r.missing.join(' ')}` : ''}`);
      for (const k of [...HAZARDS, ...DECOYS, ...FORM]) if ((r.wrong[k] || []).length) console.log(`  ${k} wrong on ${r.wrong[k].join(' ')}`);
      if (r.counts.length) console.log(`  question count differs on ${r.counts.map((f) => { const nm = names.find((x) => key[x] === f); return `${f} (${(who === 'A' ? A : B)[nm].questions}, expected ${expected[f].questions})`; }).join(' ')}`);
    }
    const dis = names.filter((nm) => A[nm] && B[nm] && both(A[nm], B[nm]).disagree.length).map((nm) => `${key[nm]} (${both(A[nm], B[nm]).disagree.join(' ')})`);
    console.log(`the readers disagree on ${dis.length ? dis.join('; ') : 'nothing'}`);
    const ruleWrong = names.map((nm) => { const f = key[nm]; const r = score(fs.readFileSync(path.join(GATE, f), 'utf8')); const m = { ...r, D1: r.decoys.includes('D1'), D2: r.decoys.includes('D2'), D3: r.decoys.includes('D3') }; return [f, HAZARDS.filter((k) => m[k] !== expected[f][k])]; });
    console.log(`the rule-based scorer: hazard marks ${names.length * 7 - ruleWrong.reduce((s, [, w]) => s + w.length, 0)} of ${names.length * 7}; wrong on ${ruleWrong.filter(([, w]) => w.length).map(([f, w]) => `${f} ${w.join(' ')}`).join('; ') || 'nothing'}`);
    console.log(`gate: ${g.A.pass && g.B.pass ? 'PASS' : 'FAIL'}`);
    if (!(g.A.pass && g.B.pass)) process.exitCode = 1;
  } else if (cmd === 'blind') {
    const [outDir, keyFile, seed, ...dirs] = args;
    if (!outDir || !keyFile || !seed || !dirs.length) usage();
    const items = [];
    for (const dir of dirs) for (const f of fs.readdirSync(path.join(R, dir)).filter((n) => n.endsWith('.check.json')).sort()) {
      const c = JSON.parse(fs.readFileSync(path.join(R, dir, f), 'utf8'));
      if (c.O1 && typeof c.spec === 'string') items.push({ id: `${dir}/${f.replace('.check.json', '')}`, text: c.spec });
    }
    writeBlind(outDir, keyFile, seed, items);
    console.log(`${items.length} specs and the rubric written to ${outDir}; key at ${keyFile}`);
  } else if (cmd === 'merge') {
    const [keyFile, a, b] = args;
    if (!keyFile || !a || !b) usage();
    const key = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    const [A, B] = [a, b].map(reading);
    for (const [name, id] of Object.entries(key)) {
      if (!A[name] || !B[name]) { console.log(`${id}: NOT READ by ${!A[name] ? 'A' : ''}${!B[name] ? 'B' : ''}`); process.exitCode = 1; continue; }
      console.log(JSON.stringify({ id, ...both(A[name], B[name]) }));
    }
  } else usage();
}
