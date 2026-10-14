'use strict';
// The driver and the tally of stage 2 of the bk-spec step (docs/specs/2026-10-08-bk-spec-stack-reach-design.md,
// "Planned registration, stage 2" and "Stage 2 registered"): the calls are the registered ones, and the bars read the
// counted rows as registered. No session runs here.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { STEPS, SPEC, BEFORE, AFTER, BEFORE_COMMIT, AFTER_COMMIT, PATHS, ONE, MODEL, LABEL, BARS_HELD, UNCOUNTED_READ, BARS_APPROVED, NEED, plan, approvalFault, hostNamed, begunOf, resumeFault } = require('../evals/analysis/bk-spec-reach-run.cjs');
const { DEADLINE, expected, counted, missing, bars } = require('../evals/analysis/bk-spec-reach-tally.cjs');

test('driver: each task makes twelve rounds, 24 K-before, 24 K-after and 8 S sessions, in the registered order', () => {
  for (const task of ['node-01', 'py-01']) {
    const calls = STEPS[task];
    assert.equal(calls.length, 12);
    const sum = (pick) => calls.flat().filter(pick).reduce((s, c) => s + c[4], 0);
    assert.deepEqual([sum((c) => c[1] === BEFORE && c[2] === 'K'), sum((c) => c[1] === AFTER && c[2] === 'K'), sum((c) => c[2] === 'S')], [24, 24, 8]);
    assert.deepEqual(calls.map((r) => r[0][1]), Array.from({ length: 12 }, (_, i) => (i % 2 ? AFTER : BEFORE)), 'K-before first in odd rounds');
    assert.deepEqual(calls.map((r, i) => r.length === 3 ? i + 1 : null).filter(Boolean), [1, 4, 7, 10], 'S in rounds 1, 4, 7 and 10');
    for (const r of calls) {
      assert.deepEqual(r.slice(0, 2).map((c) => c[2]), ['K', 'K']);
      if (r[2]) assert.deepEqual(r[2], [task, AFTER, 'S', 'natural', 2], 'S after the two K calls');
      assert.ok(r.every((c) => c[0] === task && c[3] === 'natural' && c[4] === 2));
    }
  }
  assert.deepEqual(STEPS.uncounted, [[['node-01', AFTER, 'K', 'natural', 1]]]);
  assert.deepEqual(STEPS.guard, [[['build-01', AFTER, 'K', 'natural', 8]]]);
  assert.deepEqual([BEFORE_COMMIT.slice(0, 7), AFTER_COMMIT.slice(0, 7), MODEL], ['7a461e4', 'dfdb3d5', 'claude-sonnet-5-5']);
  assert.deepEqual(PATHS, ['skills', 'hooks', 'agents', 'scripts', 'NOTICE', 'upstream']);
  assert.deepEqual(ONE, ['skills/bk-spec/SKILL.md']);
  assert.equal(BARS_APPROVED, true);
});

test('driver: --from, --runs and --to choose the calls; a wrong value is refused', () => {
  assert.equal(plan('node-01').length, 28);
  assert.deepEqual(plan('node-01', 4, null, 6).map((x) => [x.round, x.call[1]]), [[2, AFTER], [2, BEFORE], [3, BEFORE]]);
  assert.equal(plan('py-01', 3, 1)[0].call[4], 1);
  assert.throws(() => plan('py-01', 0));
  assert.throws(() => plan('py-01', 3, 3), /--runs must be 1 to 2/);
  assert.throws(() => plan('py-01', 5, null, 4), /--to/);
});

test('driver: it starts nothing unless the spec records the owner\'s label; the counted steps wait for the uncounted session read, the guard for bars 1 to 4', () => {
  const ok = `## Stage 2 registered (2026-10-14)\nThe owner chose **${LABEL}**.`;
  assert.equal(approvalFault(ok, 'uncounted'), null);
  assert.match(approvalFault(ok, 'node-01'), /uncounted session read/);
  const read = `${ok}\n${UNCOUNTED_READ}: completed, not cut, loaded.`;
  assert.equal(approvalFault(read, 'node-01'), null);
  assert.match(approvalFault('## Stage 2 registered\nnothing', 'uncounted'), /no owner's label/);
  assert.match(approvalFault(`${LABEL}\n## Stage 2 registered`, 'uncounted'), /no owner's label/, 'the label must sit under the section');
  assert.match(approvalFault(read, 'guard'), /guard runs only/);
  assert.match(approvalFault(`${read}\n- the guard runs once a line beginning "${BARS_HELD}" is there.`, 'guard'), /guard runs only/, 'a quoted mention is not the line');
  assert.equal(approvalFault(`${read}\n${BARS_HELD}: ...`, 'guard'), null);
  const spec = fs.readFileSync(SPEC, 'utf8').split('\n').filter((l) => !l.startsWith(BARS_HELD)).join('\n');
  assert.match(approvalFault(`${spec}\n${UNCOUNTED_READ}: x`, 'guard') || '', /guard runs only/, 'no sentence of the spec but a line of its own opens the guard');
  assert.deepEqual(NEED, { 'node-01': ['uncounted'], 'py-01': ['node-01'], guard: ['node-01', 'py-01'] });
});

const good = '2026-10-14T00:00:00.000Z uncounted node-01 bk-spec-reach K natural runs=1 exit=0 dir=d kit=bk-spec-reach@dfdb3d5 dirty=false cut=0 sessions=1 model=claude-sonnet-5-5 host=2.1.300';
test('driver: an uncounted session on another model sets no host', () => {
  assert.equal(hostNamed([good]), '2.1.300');
  assert.equal(hostNamed([good.replace('claude-sonnet-5-5', 'claude-opus-4')]), null);
});

test('driver: a command must start where the begun sessions end; a call with no end line stops everything', () => {
  const start = 'x START node-01 node-01 bk-spec-reach-before K natural runs=2';
  const end = (n) => `x node-01 node-01 bk-spec-reach-before K natural runs=2 exit=0 dir=a kit=b@c dirty=false cut=0 sessions=${n} model=m host=h`;
  assert.equal(begunOf([start, end(2)], 'node-01'), 2);
  assert.equal(begunOf([start], 'node-01'), null);
  assert.equal(begunOf([start, end(2)], 'py-01'), 0);
  assert.match(resumeFault('node-01', 1, null, 2), /2 sessions have begun, --from 1 implies 0/);
  assert.equal(resumeFault('node-01', 2, null, 2), null);
  assert.equal(resumeFault('node-01', 1, 1, 1), null, 'a call cut after its first session resumes with --runs 1');
  assert.match(resumeFault('node-01', 1, null, null), /START and no end line/);
  assert.match(resumeFault('uncounted', 1, null, 1), /1 sessions have begun/, 'the uncounted session never runs twice');
});

const row = (label, over = {}) => ({ task: 'py-01', dir: 'd', base: 'b', label, flags: [], Rfile: true, deadline: true, O1: true, O2: true, M: true, ...over });

test('tally: a cut, not-completed, sleep-hit or never-started session is counted against the kit on its branch', () => {
  assert.deepEqual(expected('node-01'), { 'K-before': 24, 'K-after': 24, S: 8 });
  assert.deepEqual(DEADLINE, { 'node-01': 'N3', 'py-01': 'Y2' });
  const a = counted(row('K-after', { flags: ['sleep'] }));
  assert.deepEqual([a.Rfile, a.deadline, a.O1, a.O2, a.M, a.asCut], [false, false, false, false, false, true]);
  const b = counted(row('K-before', { flags: ['cut'], Rfile: false, deadline: false }));
  assert.deepEqual([b.Rfile, b.deadline], [true, true]);
  assert.equal(counted(row('S', { flags: ['not-completed'], deadline: false })).deadline, true);
  assert.equal(counted(row('K-after')).asCut, undefined, 'an unflagged row is left as it is');
  const gone = missing('py-01', [row('K-after')]);
  assert.deepEqual([gone.length, gone.filter((r) => r.label === 'K-after').length], [55, 23]);
  assert.ok(gone.every((r) => r.flags[0] === 'never-started' && r.asCut));
  assert.ok(gone.filter((r) => r.label === 'K-before').every((r) => r.Rfile && r.deadline));
});

test('tally: the four bars and the comparison with S read the counted rows as registered', () => {
  const many = (n, label, task, over) => Array.from({ length: n }, () => row(label, { task, ...over }));
  const rows = (afterOpen, beforeOpen, afterDeadline, beforeDeadline) => ['node-01', 'py-01'].flatMap((t) => [
    ...many(afterOpen, 'K-after', t, {}), ...many(24 - afterOpen, 'K-after', t, { Rfile: false }),
    ...many(beforeOpen, 'K-before', t, {}), ...many(24 - beforeOpen, 'K-before', t, { Rfile: false }),
    ...many(8, 'S', t, { deadline: false }),
  ]).map((r, i, all) => ({ ...r, deadline: r.label === 'S' ? r.deadline : r.label === 'K-after' ? i % 24 < afterDeadline / 2 : i % 24 < beforeDeadline / 2 }));
  let b = bars(rows(12, 2, 40, 40));
  assert.deepEqual([b.bar1.after, b.bar1.nAfter, b.bar1.before, b.bar1.nBefore], [24, 48, 4, 48]);
  assert.ok(b.bar1.p < 0.05 && b.bar1.holds);
  b = bars(rows(3, 2, 40, 40));
  assert.equal(b.bar1.holds, false, 'a small rise is not shown');
  b = bars(rows(2, 12, 40, 40));
  assert.equal(b.bar1.holds, false, 'K-after below K-before never holds, whatever p');
  b = bars(rows(12, 2, 36, 40));
  assert.deepEqual([b.bar2.after, b.bar2.before, b.bar2.holds], [36, 40, true], '4 below holds');
  b = bars(rows(12, 2, 34, 40));
  assert.equal(b.bar2.holds, false, '6 below misses');
  assert.equal(bars(rows(12, 2, 36, 41)).bar2.holds, false, '5 below misses');
  assert.ok(b.bar3.every((x) => x.holds && x.n === 24));
  const bar3rows = rows(12, 2, 40, 40).map((r, i) => (r.label === 'K-after' && r.task === 'py-01' && i % 24 < 4 ? { ...r, O2: false } : r));
  assert.deepEqual(bars(bar3rows).bar3.map((x) => [x.task, x.O2, x.holds]), [['node-01', 24, true], ['py-01', 20, false]]);
  const at21 = rows(12, 2, 40, 40).map((r, i) => (r.label === 'K-after' && r.task === 'py-01' && i % 24 < 3 ? { ...r, O1: false } : r));
  assert.deepEqual(bars(at21).bar3.map((x) => [x.O1, x.holds]), [[24, true], [21, true]], '21 of 24 holds');
  const bar4rows = rows(12, 2, 40, 40).map((r, i) => (r.label === 'K-after' && r.task === 'node-01' && i % 24 < 3 ? { ...r, M: null } : r));
  assert.deepEqual(bars(bar4rows).bar4.map((x) => [x.M, x.unknown, x.holds]), [[21, 3, true], [24, 0, true]], 'unknown counts as no; 21 of 24 holds');
  const at20 = rows(12, 2, 40, 40).map((r, i) => (r.label === 'K-after' && r.task === 'node-01' && i % 24 < 4 ? { ...r, M: false } : r));
  assert.deepEqual(bars(at20).bar4.map((x) => [x.M, x.holds]), [[20, false], [24, true]], '20 of 24 misses');
  assert.deepEqual([b.againstS.nAfter, b.againstS.S, b.againstS.nS], [48, 0, 16]);
});

test('tally: a folder is read with its branch, its deadline key, and flags for a missing check or a wrong kit', (t) => {
  const { readDir } = require('../evals/analysis/bk-spec-reach-tally.cjs');
  const R = fs.mkdtempSync(path.join(os.tmpdir(), 'reach-'));
  t.after(() => fs.rmSync(R, { recursive: true, force: true }));
  const init = JSON.stringify({ type: 'system', subtype: 'init', model: MODEL, claude_code_version: '2.1.291', session_id: 'none' });
  const done = JSON.stringify({ type: 'result', subtype: 'success', is_error: false, total_cost_usd: 0.2, duration_ms: 50000, usage: {} });
  const make = (dir, kit, sessions) => {
    fs.mkdirSync(path.join(R, dir));
    fs.writeFileSync(path.join(R, dir, 'meta.json'), JSON.stringify({ kit, cut: [] }));
    for (const [base, check] of sessions) {
      fs.writeFileSync(path.join(R, dir, `${base}.raw.jsonl`), `${init}\n${done}`);
      if (check) fs.writeFileSync(path.join(R, dir, `${base}.check.json`), JSON.stringify(check));
    }
  };
  make('a', { branch: BEFORE, commit: BEFORE_COMMIT, dirty: false }, [['01-natural-K1', { Rfile: false, N3: false, Y2: true, O1: true, O2: true }], ['02-natural-K2', null]]);
  make('b', { branch: AFTER, commit: 'f'.repeat(40), dirty: false }, [['01-natural-S1', { Rfile: false, Y2: false, O1: true, O2: true }]]);
  const [k1, k2] = readDir(R, 'a', 'py-01', new Set(), path.join(R, 'no-profile'));
  assert.deepEqual([k1.label, k1.deadline, k1.flags, k1.M], ['K-before', true, [], null], 'py-01 reads Y2; no transcript is unknown');
  assert.deepEqual([k2.flags, k2.Rfile, k2.deadline, k2.asCut], [['no-check'], true, true, true], 'a K-before session with no check counts against the kit');
  const [s1] = readDir(R, 'b', 'py-01', new Set(), path.join(R, 'no-profile'));
  assert.deepEqual([s1.label, s1.flags, s1.deadline], ['S', ['kit'], true], 'a folder off its pinned commit counts against the kit');
});
