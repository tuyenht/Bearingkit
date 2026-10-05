'use strict';
// The readers' instruments of plan-01 (docs/specs/2026-10-03-bk-plan-design.md, "Calibration"): a reading is refused
// when it is not the asked-for lines; a mark counts only when both readers give it; the blind copies carry neutral
// names, a key outside their directory and nothing else; the merge reports P, the outcomes of the check file, the
// runner's cut flag and the agreement on the hazard cells.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const readers = require('../evals/analysis/plan-readers.cjs');

const mark = (over = {}) => ({ P1: false, P2: false, P3: false, P4: false, P5: false, C1: false, questions: 0, numbered: false, recommended: false, ...over });
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'plan-readers-'));

test('both: a mark counts when both readers give it; the questions are the larger count', () => {
  const m = readers.both(mark({ P1: true, P2: true, P5: true, C1: true, questions: 3, numbered: true, recommended: true }), mark({ P1: true, P5: true, questions: 5, numbered: true, recommended: true }));
  assert.deepEqual([m.P1, m.P2, m.P5, m.P, m.C1, m.questions, m.G1, m.G2], [true, false, true, 2, false, 5, true, false]);
  assert.deepEqual(m.disagree, ['P2', 'C1', 'questions']);
  // One reader finds a question without a recommendation: the form does not hold.
  assert.equal(readers.both(mark({ questions: 2, numbered: true, recommended: true }), mark({ questions: 2, numbered: true })).G1, false);
  // No question at all: G1 is reported apart (null), the cap holds.
  const none = readers.both(mark(), mark());
  assert.deepEqual([none.G1, none.G2, none.P, none.disagree], [null, true, 0, []]);
});

test('reading: a reply that is not the asked-for lines is refused', () => {
  const dir = tmp();
  try {
    const file = path.join(dir, 'r.jsonl');
    const line = (o) => JSON.stringify({ plan: 'p01.md', ...mark(), ...o });
    fs.writeFileSync(file, line({}) + '\n\n' + line({ plan: 'p02.md', P3: true, note: 'x' }) + '\n');
    const r = readers.reading(file);
    assert.deepEqual([Object.keys(r), r['p02.md'].P3], [['p01.md', 'p02.md'], true]);
    const { P4, ...noP4 } = mark();
    const cases = [
      ['Here are the marks:\n' + line({}), /not JSON/],
      ['```json\n' + line({}) + '\n```', /not JSON/],
      [line({ P3: 'yes' }), /P3 is not true or false/],
      [JSON.stringify({ plan: 'p01.md', ...noP4 }), /P4 is not true or false/],
      [line({ C1: null }), /C1 is not true or false/],
      [line({ questions: -1 }), /not a count/],
      [line({ questions: '2' }), /not a count/],
      [line({}) + '\n' + line({}), /marked twice/],
      [JSON.stringify(mark()), /no plan name/],
      [JSON.stringify({ spec: 'p01.md', ...mark() }), /no plan name/],
      ['null', /no plan name/],
    ];
    for (const [bad, why] of cases) {
      fs.writeFileSync(file, bad + '\n');
      assert.throws(() => readers.reading(file), why, bad);
    }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('writeBlind: neutral names, the rubric beside them, the key outside, a used directory refused', () => {
  const dir = tmp();
  try {
    const items = ['a', 'b', 'c', 'd', 'e'].map((x) => ({ id: `run/${x}`, text: `plan ${x}` }));
    const key = readers.writeBlind(path.join(dir, 'out'), path.join(dir, 'key.json'), 'seed-1', items);
    assert.deepEqual(fs.readdirSync(path.join(dir, 'out')).sort(), ['p01.md', 'p02.md', 'p03.md', 'p04.md', 'p05.md', 'rubric.md']);
    assert.deepEqual(Object.values(key).sort(), items.map((i) => i.id));
    for (const [name, id] of Object.entries(key)) assert.equal(fs.readFileSync(path.join(dir, 'out', name), 'utf8'), `plan ${id.slice(-1)}`);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dir, 'key.json'), 'utf8')), key);
    // The rubric is the task's own, byte for byte.
    assert.equal(fs.readFileSync(path.join(dir, 'out', 'rubric.md'), 'utf8'), fs.readFileSync(path.join(__dirname, '..', 'evals', 'bench', 'plan-01', 'rubric.md'), 'utf8'));
    // The same seed gives the same order; another seed, another.
    assert.deepEqual(readers.shuffle(items, 'seed-1'), readers.shuffle(items, 'seed-1'));
    assert.notDeepEqual(readers.shuffle(items, 'seed-1').map((i) => i.id), readers.shuffle(items, 'seed-2').map((i) => i.id));
    assert.throws(() => readers.writeBlind(path.join(dir, 'out'), path.join(dir, 'key2.json'), 's', items), /not empty/);
    assert.throws(() => readers.writeBlind(path.join(dir, 'out2'), path.join(dir, 'out2', 'key.json'), 's', items), /outside/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('plans and merge: the check file gives the plan, O1 and O2; the meta gives the cut; agreement is counted on the hazard cells', () => {
  const root = tmp();
  try {
    const run = path.join(root, 'run-1');
    fs.mkdirSync(run);
    const put = (base, check) => fs.writeFileSync(path.join(run, `${base}.check.json`), JSON.stringify(check) + '\n');
    put('01-natural-F1', { O1: true, O2: true, plan: 'plan one' });
    put('02-natural-F2', { O1: true, O2: false, plan: 'plan two' });
    put('03-natural-F3', { O1: false, O2: true, plan: '' });
    fs.writeFileSync(path.join(run, 'meta.json'), JSON.stringify({ cut: ['02-natural-F2'] }) + '\n');
    fs.writeFileSync(path.join(run, 'results.md'), 'not a check file\n');
    // A session with no plan (O1 false) is not handed to the readers.
    assert.deepEqual(readers.plans(['run-1'], root), [{ id: 'run-1/01-natural-F1', text: 'plan one' }, { id: 'run-1/02-natural-F2', text: 'plan two' }]);
    const key = { 'p01.md': 'run-1/02-natural-F2', 'p02.md': 'run-1/01-natural-F1' };
    const A = { 'p01.md': mark({ P1: true, P2: true, P3: true, P4: true, questions: 2, numbered: true, recommended: true }), 'p02.md': mark({ P2: true }) };
    const B = { 'p01.md': mark({ P1: true, P2: true, P3: true, P5: true, questions: 2, numbered: true, recommended: true }), 'p02.md': mark({ P2: true }) };
    const m = readers.merge(key, A, B, root);
    assert.deepEqual(m.rows.slice(0, 2).map((r) => [r.id, r.P, r.O1, r.O2, r.cut, r.disagree]), [['run-1/02-natural-F2', 3, true, false, true, ['P4', 'P5']], ['run-1/01-natural-F1', 1, true, true, false, []]]);
    // The session that left no plan is listed after them, with its outcomes and no marks.
    assert.deepEqual(m.rows.slice(2), [{ id: 'run-1/03-natural-F3', noPlan: true, O1: false, O2: true, cut: false }]);
    // Ten hazard cells, two marked differently.
    assert.deepEqual(m.agreement, { same: 8, cells: 10, rate: 0.8 });
    // Full agreement is 1; a difference on C1 or on the count of questions is not a hazard cell.
    assert.equal(readers.merge(key, A, A, root).agreement.rate, 1);
    const C = { ...A, 'p02.md': mark({ P2: true, C1: true, questions: 4 }) };
    assert.deepEqual(readers.merge(key, A, C, root).agreement, { same: 10, cells: 10, rate: 1 });
    // A plan one reader did not mark is named and leaves the agreement's count; a plan outside the key is refused.
    const short = readers.merge(key, { 'p01.md': A['p01.md'] }, B, root);
    assert.deepEqual([short.rows[1].notRead, short.rows[1].P, short.agreement.cells], ['A', undefined, 5]);
    assert.throws(() => readers.merge(key, { ...A, 'p09.md': mark() }, B, root), /p09\.md, which is not in the key/);
    // A key entry with no check file is refused, not read as two failed outcomes; a result directory may be nested.
    assert.throws(() => readers.merge({ 'p01.md': 'run-1/09-natural-F9' }, { 'p01.md': mark() }, { 'p01.md': mark() }, root), /no check file/);
    fs.mkdirSync(path.join(root, 'sub', 'run-2'), { recursive: true });
    fs.writeFileSync(path.join(root, 'sub', 'run-2', '01-natural-F1.check.json'), JSON.stringify({ O1: true, O2: true, plan: 'p' }) + '\n');
    assert.deepEqual(readers.merge({ 'p01.md': 'sub/run-2/01-natural-F1' }, { 'p01.md': mark() }, { 'p01.md': mark() }, root).rows.map((r) => [r.id, r.O1, r.O2]), [['sub/run-2/01-natural-F1', true, true]]);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
});

test('gate: one plan wrong per item passes, two on the same item fail, C1 is not gated, a plan not read fails', () => {
  const key = { 'p01.md': 'g01.md', 'p02.md': 'g02.md', 'p03.md': 'g03.md' };
  const expected = { 'g01.md': mark({ P1: true, C1: true, questions: 2 }), 'g02.md': mark({ P1: true }), 'g03.md': mark() };
  const right = { 'p01.md': expected['g01.md'], 'p02.md': expected['g02.md'], 'p03.md': expected['g03.md'] };
  const g0 = readers.gate(key, right, right, expected);
  assert.deepEqual([g0.A.pass, g0.B.pass, g0.A.counts], [true, true, []]);
  const oneOff = { ...right, 'p01.md': mark({ P1: false, C1: true, questions: 2 }) };
  assert.equal(readers.gate(key, oneOff, right, expected).A.pass, true);
  const twoOff = { ...oneOff, 'p02.md': mark({ P1: false }) };
  const g = readers.gate(key, twoOff, right, expected);
  assert.deepEqual([g.A.pass, g.A.wrong.P1, g.B.pass], [false, ['g01.md', 'g02.md'], true]);
  // A form item is gated like a hazard.
  const form = { 'p01.md': mark({ P1: true, C1: true, questions: 2, numbered: true }), 'p02.md': mark({ P1: true, numbered: true }), 'p03.md': mark() };
  assert.deepEqual([readers.gate(key, form, right, expected).A.pass, readers.gate(key, form, right, expected).A.wrong.numbered], [false, ['g01.md', 'g02.md']]);
  // C1 wrong on every plan is reported and does not fail the gate.
  const c1 = { 'p01.md': mark({ P1: true, questions: 2 }), 'p02.md': mark({ P1: true, C1: true }), 'p03.md': mark({ C1: true }) };
  const gc = readers.gate(key, c1, right, expected);
  assert.deepEqual([gc.A.pass, gc.A.wrong.C1], [true, ['g01.md', 'g02.md', 'g03.md']]);
  // The count of questions: two plans off pass, three fail.
  const counts = (n) => Object.fromEntries(Object.entries(right).map(([name, m], i) => [name, i < n ? { ...m, questions: 9 } : m]));
  assert.deepEqual([readers.gate(key, counts(2), right, expected).A.pass, readers.gate(key, counts(3), right, expected).A.pass], [true, false]);
  const missing = { 'p01.md': right['p01.md'] };
  assert.deepEqual([readers.gate(key, missing, right, expected).A.pass, readers.gate(key, missing, right, expected).A.missing], [false, ['p02.md', 'p03.md']]);
});

test('the gate plans: each has its expected marks, the reference passes all, and each one-hazard variant drops only its own', () => {
  const GATE = path.join(__dirname, '..', 'evals', 'bench', 'plan-01', 'gate');
  const expected = JSON.parse(fs.readFileSync(path.join(GATE, 'expected.json'), 'utf8'));
  const items = readers.gatePlans();
  assert.deepEqual(items.map((i) => i.id), Object.keys(expected));
  assert.ok(items.length >= 10);
  for (const [name, e] of Object.entries(expected)) {
    for (const k of readers.MARKS) assert.equal(typeof e[k], 'boolean', `${name} ${k}`);
    assert.ok(Number.isInteger(e.questions) && e.questions >= 0, name);
    assert.equal('plan' in e || 'note' in e, false, name);
  }
  const P = (e) => readers.HAZARDS.filter((k) => e[k]).join(' ');
  assert.equal(P(expected['g01.md']), 'P1 P2 P3 P4 P5');
  // g02 to g06 each drop one hazard, in order; every hazard is failed by at least two plans and passed by at least two.
  readers.HAZARDS.forEach((k, i) => assert.equal(P(expected[`g0${i + 2}.md`]), readers.HAZARDS.filter((h) => h !== k).join(' '), k));
  for (const k of [...readers.HAZARDS, ...readers.FORM]) {
    const marks = Object.values(expected).map((e) => e[k]);
    assert.ok(marks.filter(Boolean).length >= 2 && marks.filter((m) => !m).length >= 2, k);
  }
  // No gate plan is a copy of another, and none carries the word that would name it to a reader.
  assert.equal(new Set(items.map((i) => i.text)).size, items.length);
  for (const i of items) assert.doesNotMatch(i.text, /gate|rubric|hazard|near miss|\bP[1-5]\b/i, i.id);
});

test('the committed gate reading passes the registered rule, with no mark and no count wrong', () => {
  const GATE = path.join(__dirname, '..', 'evals', 'bench', 'plan-01', 'gate');
  const key = JSON.parse(fs.readFileSync(path.join(GATE, 'key-2026-10-05.json'), 'utf8'));
  const expected = JSON.parse(fs.readFileSync(path.join(GATE, 'expected.json'), 'utf8'));
  const A = readers.reading(path.join(GATE, 'reading-A-sonnet.jsonl'));
  const B = readers.reading(path.join(GATE, 'reading-B-opus.jsonl'));
  const g = readers.gate(key, A, B, expected);
  assert.deepEqual([g.A.pass, g.B.pass, g.A.counts, g.B.counts], [true, true, [], []]);
  for (const k of readers.MARKS) assert.deepEqual([g.A.wrong[k], g.B.wrong[k]], [[], []], k);
  // This is the first gate reading, of the thirteen plans the gate then held (g14 came with the third freeze of the
  // rubric); each is in the key once. The rule can fail on these very readings: two plans flipped on one item.
  assert.deepEqual(Object.values(key).sort(), Object.keys(expected).filter((n) => n !== 'g14.md').sort());
  const [n1, n2] = Object.keys(key);
  const flipped = { ...A, [n1]: { ...A[n1], P3: !A[n1].P3 }, [n2]: { ...A[n2], P3: !A[n2].P3 } };
  assert.equal(readers.gate(key, flipped, B, expected).A.pass, false);
});

test('the second committed gate reading (fourteen plans, the third rubric) passes the rule with nothing wrong', () => {
  const GATE = path.join(__dirname, '..', 'evals', 'bench', 'plan-01', 'gate');
  const key = JSON.parse(fs.readFileSync(path.join(GATE, 'key-2026-10-05-2.json'), 'utf8'));
  const expected = JSON.parse(fs.readFileSync(path.join(GATE, 'expected.json'), 'utf8'));
  const A = readers.reading(path.join(GATE, 'reading-2-A-sonnet.jsonl'));
  const B = readers.reading(path.join(GATE, 'reading-2-B-opus.jsonl'));
  const g = readers.gate(key, A, B, expected);
  assert.deepEqual([g.A.pass, g.B.pass, g.A.counts, g.B.counts], [true, true, [], []]);
  for (const k of readers.MARKS) assert.deepEqual([g.A.wrong[k], g.B.wrong[k]], [[], []], k);
  assert.deepEqual(Object.values(key).sort(), Object.keys(expected).sort());
  // The plan added with the third freeze is read as expected: it fails the slices and nothing else.
  const g14 = Object.keys(key).find((n) => key[n] === 'g14.md');
  assert.deepEqual(readers.HAZARDS.filter((k) => !A[g14][k] || !B[g14][k]), ['P1']);
});
