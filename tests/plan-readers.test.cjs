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
