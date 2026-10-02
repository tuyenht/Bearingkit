'use strict';
// The readers' instruments of spec-01 (docs/specs/2026-10-02-bk-spec-design.md, "Addendum: scoring by blind reading"):
// a reading is refused when it is not the asked-for lines; a mark counts only when both readers give it; the blind
// copies carry neutral names, a key outside their directory and nothing else; the gate's rule; and the committed gate
// reading still passes it.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readers = require('../evals/analysis/spec-readers.cjs');

const mark = (over = {}) => ({ H1: false, H2: false, H3: false, H4: false, H5: false, H6: false, H7: false, D1: false, D2: false, D3: false, questions: 0, numbered: false, recommended: false, ...over });
const GATE = path.join(__dirname, '..', 'evals', 'bench', 'spec-01', 'gate');

test('both: a mark counts when both readers give it; the questions are the larger count', () => {
  const m = readers.both(mark({ H1: true, H2: true, D1: true, questions: 3, numbered: true, recommended: true }), mark({ H1: true, D1: true, D2: true, questions: 5, numbered: true, recommended: true }));
  assert.deepEqual([m.H1, m.H2, m.H, m.D1, m.D2, m.D, m.questions, m.G1, m.G2], [true, false, 1, true, false, 1, 5, true, false]);
  assert.deepEqual(m.disagree, ['H2', 'D2', 'questions']);
  // No question at all: the round's form does not hold, the cap does.
  const none = readers.both(mark(), mark());
  assert.deepEqual([none.G1, none.G2, none.disagree], [false, true, []]);
});

test('reading: a reply that is not the asked-for lines is refused', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-readers-'));
  try {
    const file = path.join(dir, 'r.jsonl');
    const line = (o) => JSON.stringify({ spec: 's01.md', ...mark(), ...o });
    fs.writeFileSync(file, line({}) + '\n');
    assert.deepEqual(Object.keys(readers.reading(file)), ['s01.md']);
    for (const bad of ['Here are the marks:\n' + line({}), line({ H3: 'yes' }), line({ questions: -1 }), line({}) + '\n' + line({}), JSON.stringify(mark())]) {
      fs.writeFileSync(file, bad + '\n');
      assert.throws(() => readers.reading(file), /not JSON|not true or false|not a count|marked twice|no spec name/);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('writeBlind: neutral names, the rubric beside them, the key outside, a used directory refused', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'spec-readers-'));
  try {
    const items = ['a', 'b', 'c', 'd', 'e'].map((x) => ({ id: `run/${x}`, text: `spec ${x}` }));
    const key = readers.writeBlind(path.join(dir, 'out'), path.join(dir, 'key.json'), 'seed-1', items);
    assert.deepEqual(fs.readdirSync(path.join(dir, 'out')).sort(), ['rubric.md', 's01.md', 's02.md', 's03.md', 's04.md', 's05.md']);
    assert.deepEqual(Object.values(key).sort(), items.map((i) => i.id));
    for (const [name, id] of Object.entries(key)) assert.equal(fs.readFileSync(path.join(dir, 'out', name), 'utf8'), `spec ${id.slice(-1)}`);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'key.json'), 'utf8')), key);
    // The same seed gives the same order; another seed, another.
    assert.deepEqual(readers.shuffle(items, 'seed-1'), readers.shuffle(items, 'seed-1'));
    assert.notDeepEqual(readers.shuffle(items, 'seed-1').map((i) => i.id), readers.shuffle(items, 'seed-2').map((i) => i.id));
    assert.throws(() => readers.writeBlind(path.join(dir, 'out'), path.join(dir, 'key2.json'), 's', items), /not empty/);
    assert.throws(() => readers.writeBlind(path.join(dir, 'out2'), path.join(dir, 'out2', 'key.json'), 's', items), /outside/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('gate: one wrong mark per item passes, two on the same item fail, a spec not read fails', () => {
  const key = { 's01.md': 'g01.md', 's02.md': 'g02.md', 's03.md': 'g03.md' };
  const expected = { 'g01.md': mark({ H1: true, questions: 2 }), 'g02.md': mark({ H1: true }), 'g03.md': mark() };
  const right = { 's01.md': expected['g01.md'], 's02.md': expected['g02.md'], 's03.md': expected['g03.md'] };
  assert.deepEqual([readers.gate(key, right, right, expected).A.pass, readers.gate(key, right, right, expected).B.pass], [true, true]);
  const oneOff = { ...right, 's01.md': mark({ H1: false, questions: 2 }) };
  assert.equal(readers.gate(key, oneOff, right, expected).A.pass, true);
  const twoOff = { ...oneOff, 's02.md': mark({ H1: false }) };
  const g = readers.gate(key, twoOff, right, expected);
  assert.deepEqual([g.A.pass, g.A.wrong.H1, g.B.pass], [false, ['g01.md', 'g02.md'], true]);
  const counts = { 's01.md': mark({ H1: true, questions: 9 }), 's02.md': mark({ H1: true, questions: 9 }), 's03.md': mark({ questions: 9 }) };
  assert.equal(readers.gate(key, counts, right, expected).A.pass, false);
  const missing = { 's01.md': right['s01.md'] };
  assert.deepEqual([readers.gate(key, missing, right, expected).A.pass, readers.gate(key, missing, right, expected).A.missing], [false, ['s02.md', 's03.md']]);
});

test('the committed gate reading passes the registered rule, and the two readers agree on every mark but one count', () => {
  const key = JSON.parse(fs.readFileSync(path.join(GATE, 'key-2026-10-03.json'), 'utf8'));
  const expected = JSON.parse(fs.readFileSync(path.join(GATE, 'expected.json'), 'utf8'));
  const A = readers.reading(path.join(GATE, 'reading-A-sonnet.jsonl'));
  const B = readers.reading(path.join(GATE, 'reading-B-opus.jsonl'));
  const g = readers.gate(key, A, B, expected);
  assert.deepEqual([g.A.pass, g.B.pass, g.A.counts, g.B.counts], [true, true, ['g11.md'], []]);
  for (const k of [...readers.HAZARDS, ...readers.DECOYS, ...readers.FORM]) assert.deepEqual([g.A.wrong[k], g.B.wrong[k]], [[], []], k);
  // Every gate spec is in the key, once.
  assert.deepEqual(Object.values(key).sort(), fs.readdirSync(GATE).filter((n) => /^g\d+\.md$/.test(n)).sort());
});
