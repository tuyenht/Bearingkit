'use strict';
// The main program of the plan-01 tally (docs/specs/2026-10-03-bk-plan-design.md, "Step 5"), run as a command on
// made-up result directories under a temporary root (`--root`): what it prints per branch, and the three ways it
// refuses to conclude (a plan not read by both readers, fewer than six plans in a kit branch, agreement under 90%).
// Its helpers are tested in plan-run.test.cjs.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const TALLY = path.join(__dirname, '..', 'evals', 'analysis', 'plan-tally.cjs');
const mark = (over = {}) => ({ P1: false, P2: false, P3: false, P4: false, P5: false, C1: false, questions: 2, numbered: true, recommended: true, ...over });
const ALL = { P1: true, P2: true, P3: true, P4: true, P5: true, C1: true };
const OLD = { P2: true, P5: true };

// One session's stream: the init event with its number of tools, any tool calls, the result event with its cost.
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
const result = (id, extra = {}) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, ...extra }] } });
const arrives = { type: 'user', message: { content: [{ type: 'text', text: 'Base directory for this skill: C:/x/skills/writing-plans' }] } };
const raw = (tools, cost, calls = [], denials = []) => [{ type: 'system', subtype: 'init', model: 'claude-sonnet-5', tools: Array.from({ length: tools }, (_, i) => `T${i}`) }, ...calls, { type: 'result', subtype: 'success', total_cost_usd: cost, permission_denials: denials }].map((e) => JSON.stringify(e)).join('\n') + '\n';

// A result directory as the runner leaves it: meta.json with the kit branch, and per session a check file and a
// stream. `sessions` maps a session's base name to { plan, reach, raw, marks }: marks is [reader A, reader B].
function build(root, layout) {
  const key = {};
  const A = [];
  const B = [];
  let n = 0;
  for (const [dir, { branch, sessions, loose = [] }] of Object.entries(layout)) {
    fs.mkdirSync(path.join(root, dir), { recursive: true });
    fs.writeFileSync(path.join(root, dir, 'meta.json'), JSON.stringify({ kit: { branch, commit: 'c0ffee1234', dirty: false }, cut: [] }) + '\n');
    fs.writeFileSync(path.join(root, dir, 'results.md'), 'not a check file\n');
    for (const [base, s] of Object.entries(sessions)) {
      const plan = s.plan !== false;
      fs.writeFileSync(path.join(root, dir, `${base}.check.json`), JSON.stringify({ O1: plan, O2: true, Rskill: !!s.reach, 'R_writing-plans': !!s.reach, 'R_vertical-slices': !!s.reach, plan: plan ? 'a plan' : '' }) + '\n');
      fs.writeFileSync(path.join(root, dir, `${base}.raw.jsonl`), s.raw);
      if (!plan) continue;
      const name = `p${String(++n).padStart(2, '0')}.md`;
      key[name] = `${dir}/${base}`;
      A.push(JSON.stringify({ plan: name, ...s.marks[0] }));
      B.push(JSON.stringify({ plan: name, ...s.marks[1] }));
    }
    for (const f of loose) fs.writeFileSync(path.join(root, dir, f), raw(20, 0.3));
  }
  return { key, A, B };
}

// Six K-before plans (P 2 each), seven K-after sessions of which the last left no plan (P 5 on the six, one of them
// with no question), two S sessions that started with more tools (one launched a source skill, one had its Skill call
// refused), two F sessions and a third stream that was never checked.
function layout() {
  const six = (letter, marks, cost, reach) => Object.fromEntries([1, 2, 3, 4, 5, 6].map((i) => [`0${i}-natural-${letter}${i}`, { marks: [mark(marks), mark(marks)], raw: raw(20, cost), reach }]));
  const after = six('K', ALL, 0.6, true);
  after['06-natural-K6'].marks = [mark({ ...ALL, questions: 0, numbered: false, recommended: false }), mark({ ...ALL, questions: 0, numbered: false, recommended: false })];
  after['07-natural-K7'] = { plan: false, raw: raw(20, 0.6) };
  return {
    'run-before': { branch: 'p5b-bk-plan-before', sessions: six('K', OLD, 0.3, true) },
    'run-after': { branch: 'p5b-bk-plan', sessions: after },
    'run-s': { branch: 'p5b-bk-plan', sessions: {
      '01-natural-S1': { marks: [mark(OLD), mark(OLD)], raw: raw(33, 0.3, [use('a', 'Skill', { skill: 'superpowers:writing-plans' }), result('a'), arrives]) },
      '02-natural-S2': { marks: [mark(), mark()], raw: raw(33, 0.3, [use('a', 'Skill', { skill: 'mattpocock-skills:to-tickets' }), result('a', { is_error: true })], [{ tool_name: 'Skill' }]) },
    } },
    'run-f': { branch: 'p5b-bk-plan', sessions: {
      '01-natural-F1': { marks: [mark(), mark()], raw: raw(20, 0.3) },
      '02-natural-F2': { marks: [mark(), mark()], raw: raw(20, 0.3) },
    }, loose: ['03-natural-F3.raw.jsonl'] },
  };
}

// Writes the layout and the readings (after `change` has had its way with them) and runs the tally on it.
function tally(change = () => {}, spec = layout()) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'plan-tally-'));
  try {
    const made = build(path.join(root, 'results'), spec);
    change(made);
    const file = (name, text) => { const f = path.join(root, name); fs.writeFileSync(f, text); return f; };
    const args = ['--root', path.join(root, 'results'), '--readings', file('key.json', JSON.stringify(made.key)), file('A.jsonl', made.A.join('\n') + '\n'), file('B.jsonl', made.B.join('\n') + '\n'), ...Object.keys(spec)];
    return spawnSync('node', [TALLY, ...args], { encoding: 'utf8' });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('plan-tally main: the tables of a complete run, per branch, and the tests', () => {
  const r = tally();
  assert.equal(r.status, 0, r.stderr);
  const out = r.stdout;
  assert.match(out, /^run-after: kit p5b-bk-plan@c0ffee1 dirty=false; cut \[\]; stopped no$/m);
  // The branch is the file's letter and, for K, the kit branch of the directory.
  assert.match(out, /^K-before: 6 sessions \(6 with a plan\); models claude-sonnet-5; ends success$/m);
  assert.match(out, /^K-after: 7 sessions \(6 with a plan\); models claude-sonnet-5; ends success$/m);
  assert.match(out, /^S: 2 sessions \(2 with a plan\)/m);
  assert.match(out, /^F: 2 sessions \(2 with a plan\)/m);
  const block = (l) => out.slice(out.indexOf(`\n${l}: `), out.indexOf('\n\n', out.indexOf(`\n${l}: `) + 1));
  assert.match(block('K-after'), /P per session: 5 5 5 5 5 5 {2}median 5 {2}mean 5\.000/);
  assert.match(block('K-before'), /P per session: 2 2 2 2 2 2 {2}median 2 {2}mean 2\.000/);
  // The session with no plan has no P and counts against O1 only; the plan with no question is apart under G1.
  assert.match(block('K-after'), /P1 6 {2}P2 6 {2}P3 6 {2}P4 6 {2}P5 6 {2}\| {2}C1 6 {2}\| {2}O1 6 {2}O2 7 {2}\| {2}G1 5 \(no question: 1\) {2}G2 6/);
  assert.match(block('K-after'), /questions per plan \[2,2,2,2,2,0\]/);
  assert.match(block('K-after'), /reach: bk-plan 6 {2}writing-plans 6 {2}vertical-slices 6/);
  assert.match(block('K-after'), /reach in clock order: (\d\d:\d\dZ (SWV|---)\s*){7}/);
  assert.match(block('K-before'), /P1 0 {2}P2 6 {2}P3 0 {2}P4 0 {2}P5 6 /);
  assert.match(out, /^NO PLAN \(no P, counted under O1 only\): run-after\/07-natural-K7 \[K-after\]$/m);
  // A stream with no check file is named, never dropped; it is in no branch's count.
  assert.match(out, /^ {2}NOT CHECKED \(no check file\): 03-natural-F3\.raw\.jsonl$/m);
  // The sources: one session launched a source skill with its text arriving, the other had its Skill call refused.
  assert.match(block('S'), /source read: 1 of 2 \(a source skill launched with its text 1, a source SKILL\.md read 0\); Skill calls refused in 1 sessions/);
  assert.match(block('S'), /skills \["superpowers:writing-plans","mattpocock-skills:to-tickets"\]/);
  assert.match(block('S'), /tools in init 33 {2}refused 1/);
  assert.doesNotMatch(block('F'), /source read/);
  // The tests: each reader alone, both together, and what the text adds.
  for (const who of ['A', 'B']) assert.match(out, new RegExp(`^reader ${who} alone: K-after 5 5 5 5 5 5 \\(mean 5\\.000\\) \\| K-before 2 2 2 2 2 2 \\(mean 2\\.000\\) \\| p = 0\\.00216\\d* \\| met$`, 'm'));
  assert.match(out, /^primary on both readers' marks: met; bars 1 and 2 need all three met$/m);
  assert.match(out, /^P1 \+ P3 passes: K-after 12 \| K-before 0 \| K-after above$/m);
  assert.doesNotMatch(out, /NOT CONCLUDED/);
  // Cost: a ratio between branches with the same number of tools, the two medians labelled otherwise.
  assert.match(out, /^cost: K-after \/ K-before 2\.00 {3}K-after \/ F 2\.00 {3}K-after \/ S 0\.600 and 0\.300, not comparable \(different tools\)$/m);
  assert.match(out, /^readers agree on 80 of 80 hazard marks \(100\.0%\)$/m);
  assert.match(out, /^readers disagree in 0 of 16 plans$/m);
  assert.match(out, /^primary, P K-after vs K-before: p = 0\.00216\d*$/m);
  assert.match(out, /^sources, P K-after vs S: p = 0\.0357\d*$/m);
});

test('plan-tally main: fewer than six plans in a kit branch is not concluded, exit 1', () => {
  const spec = layout();
  spec['run-after'].sessions['06-natural-K6'] = { plan: false, raw: raw(20, 0.6) };
  const r = tally(undefined, spec);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /^K-after: 7 sessions \(5 with a plan\)/m);
  assert.match(r.stdout, /^NOT CONCLUDED: K-after has 5 plans, fewer than the 6 the primary needs; "met" above does not stand$/m);
  assert.doesNotMatch(r.stdout, /NOT CONCLUDED: K-before/);
  // The primary's own line still prints what the test gives; the line above is what withdraws it.
  assert.match(r.stdout, /^primary on both readers' marks: met/m);
});

test('plan-tally main: a plan one reader did not mark stops the tally before any figure, exit 1', () => {
  const r = tally((made) => { made.B.pop(); });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /^NOT READ by both readers: run-f\/02-natural-F2; no figure is printed until every plan has two readings$/m);
  assert.doesNotMatch(r.stdout, /P per session|primary|readers agree/);
  // A reading that marks a plan the key does not hold is refused the same way, before anything is printed.
  const extra = tally((made) => { made.A.push(JSON.stringify({ plan: 'p99.md', ...mark() })); });
  assert.equal(extra.status, 1);
  assert.match(extra.stderr, /^reading A marks p99\.md, which is not in the key$/m);
  assert.equal(extra.stdout, '');
});

test('plan-tally main: agreement under 90% on the hazard marks is said aloud, exit 1; at 90% it is not', () => {
  const flip = (line, keys) => { const o = JSON.parse(line); for (const k of keys) o[k] = !o[k]; return JSON.stringify(o); };
  // Reader B marks two K-before plans the other way on all five hazards: 70 of 80 cells alike.
  const under = tally((made) => { for (const i of [0, 1]) made.B[i] = flip(made.B[i], ['P1', 'P2', 'P3', 'P4', 'P5']); });
  assert.equal(under.status, 1);
  assert.match(under.stdout, /^readers agree on 70 of 80 hazard marks \(87\.5%\): BELOW 90%, the reading is not to be used$/m);
  assert.match(under.stdout, /^readers disagree in 2 of 16 plans: run-before\/01-natural-K1 \(P1 P2 P3 P4 P5\); run-before\/02-natural-K2 \(P1 P2 P3 P4 P5\)$/m);
  // A mark holds only when both give it: those two plans drop to P 0.
  assert.match(under.stdout, /P per session: 0 0 2 2 2 2 /);
  // Eight cells of 80 marked differently is exactly 90%: used. A difference on C1 is not a hazard cell.
  const at = tally((made) => { made.B[0] = flip(made.B[0], ['P1', 'P2', 'P3', 'P4', 'P5', 'C1']); made.B[1] = flip(made.B[1], ['P1', 'P3', 'P4']); });
  assert.equal(at.status, 0, at.stderr);
  assert.match(at.stdout, /^readers agree on 72 of 80 hazard marks \(90\.0%\)$/m);
});

test('plan-tally main: a command line that is not one it takes is refused, exit 2', () => {
  for (const args of [[], ['run-f'], ['--readings', 'k', 'a', 'run-f'], ['--readings', 'k', 'a', 'b'], ['--readings', 'k', 'a', 'b', 'run-f', '--root']]) {
    const r = spawnSync('node', [TALLY, ...args], { encoding: 'utf8' });
    assert.equal(r.status, 2, args.join(' '));
    assert.match(r.stderr, /^usage: plan-tally\.cjs \[--root <dir>\] --readings /);
  }
});
