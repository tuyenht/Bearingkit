'use strict';
// The driver and the tally of the cpp-01 measurement (docs/specs/2026-10-08-stack-c-cpp-design.md, "Registered"): the
// calls of each step are the registered ones, and the three readings the tally makes from a stream or a row are right
// on both sides. No session runs here.
const test = require('node:test');
const assert = require('node:assert/strict');
const { STEPS, BEFORE, AFTER, THREE, MODEL, MEASUREMENT_OVER, plan, initFault, hostOf, began } = require('../evals/analysis/cpp-run.cjs');
const { sourceRead, builtOnce, counted, completed, dirsOf } = require('../evals/analysis/cpp-tally.cjs');

const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
const result = (id, body, isError = false) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content: body, is_error: isError }] } });

test('cpp-run: every step makes the registered calls, and the sessions add up', () => {
  const sessions = (step, pick) => STEPS[step].flat().filter(pick).reduce((s, c) => s + c[4], 0);
  const on = (branch, runner) => (c) => c[1] === branch && c[2] === runner;
  assert.deepEqual(STEPS.uncounted, [[['cpp-01', AFTER, 'K', 'command', 1]]]);
  assert.deepEqual(STEPS.strial, [[['cpp-01', AFTER, 'S', 'command', 1]]]);
  assert.deepEqual(STEPS.probe, [[['cpp-01', AFTER, 'K', 'command', 2]]]);
  assert.deepEqual(STEPS.calibration, [[['cpp-01', BEFORE, 'K', 'command', 3]]]);
  assert.deepEqual(STEPS['build-01'], [[['build-01', AFTER, 'K', 'natural', 8]]]);
  assert.equal(STEPS.usable.length, 4);
  assert.deepEqual([sessions('usable', on(BEFORE, 'K')), sessions('usable', on(AFTER, 'K')), sessions('usable', on(AFTER, 'S')), sessions('usable', on(AFTER, 'F'))], [8, 8, 8, 8]);
  assert.deepEqual(STEPS.usable.map((r) => r[0][1]), [BEFORE, AFTER, BEFORE, AFTER], 'K-before first in rounds 1 and 3');
  assert.ok(STEPS.usable.flat().every((c) => (c[2] === 'F') === (c[3] === 'natural')), 'only the floor runs on the plain prompt');
  assert.deepEqual([sessions('guard', on(AFTER, 'K')), sessions('guard', on(AFTER, 'S')), sessions('guard', () => true)], [8, 8, 16], 'the guard path runs no K-before and no floor');
  assert.deepEqual(STEPS.guard.map((r) => r[0][2]), ['K', 'S', 'K', 'S'], 'K-after first in rounds 1 and 3');
  for (const r of STEPS.usable) assert.deepEqual(r.map((c) => [c[2], c[3], c[4]]), [['K', 'command', 2], ['K', 'command', 2], ['S', 'command', 2], ['F', 'natural', 2]], 'two K calls, then S, then F, two sessions each');
  assert.deepEqual(STEPS.usable.map((r) => r[1][1]), [AFTER, BEFORE, AFTER, BEFORE]);
  for (const r of STEPS.guard) assert.deepEqual(r.map((c) => c[4]), [2, 2]);
  assert.equal(MODEL, 'claude-sonnet-5-5');
  assert.deepEqual(THREE, ['skills/bk-build/SKILL.md', 'skills/bk-build/references/stacks/c-cpp.md', 'skills/bk-build/references/stacks/index.md']);
});

test('cpp-tally: the source is read only by a Skill call naming it whose result is not an error', () => {
  const skill = 'fullstack-dev-skills:cpp-pro';
  assert.equal(sourceRead(stream([use('a', 'Skill', { skill }), result('a', 'Launching skill')])), true);
  assert.equal(sourceRead(stream([use('a', 'Skill', { skill }), result('a', 'permission denied', true)])), false, 'a refused call is not a read');
  assert.equal(sourceRead(stream([use('a', 'Skill', { skill })])), false, 'a call with no result is not a read');
  assert.equal(sourceRead(stream([use('a', 'Skill', { skill: 'fullstack-dev-skills:rust-engineer' }), result('a', 'ok')])), false, 'another skill of the plugin is not the source');
  assert.equal(sourceRead(stream([use('a', 'Read', { file_path: 'skills/cpp-pro/SKILL.md' }), result('a', 'x')])), false);
});

test('cpp-tally: a build is proved by a shell call that built and did not fail', () => {
  assert.equal(builtOnce(stream([use('a', 'Bash', { command: 'cmake --build build' }), result('a', '[2/2] Linking CXX executable meterstat.exe')])), true);
  assert.equal(builtOnce(stream([use('a', 'Bash', { command: 'cmake --build build' }), result('a', 'Exit code 1\nninja: build stopped', true)])), false);
  assert.equal(builtOnce(stream([use('a', 'Bash', { command: 'cmake --build build' }), result('a', 'This command requires approval', true)])), false, 'a refused call proves nothing');
  assert.equal(builtOnce(stream([use('a', 'Bash', { command: 'ninja -C build' }), result('a', 'Exit code -1073741819\n')])), false, 'a non-zero exit that is not flagged as an error');
  assert.equal(builtOnce(stream([use('a', 'Bash', { command: 'ninja -C build' }), result('a', 'Exit code 0\nok')])), true);
  assert.equal(builtOnce(stream([use('a', 'Bash', { command: 'cmake -S . -B build' }), result('a', 'done')])), false, 'a configure alone is not a build');
  assert.equal(builtOnce(stream([use('a', 'Bash', { command: 'ls build' }), result('a', 'meterstat.exe')])), false);
});

test('cpp-tally: a cut session is counted against the kit on its branch', () => {
  const row = (label) => ({ label, cut: true, H: 2, O1: true, O2: false, Rfile: true });
  assert.deepEqual(counted(row('K-after')), { label: 'K-after', cut: true, H: 0, H1: false, H2: false, H3: false, H5: false, O1: false, O2: false, O3: false, P3: false, Rfile: false, asCut: true });
  assert.deepEqual(counted(row('F')), { ...row('F'), asCut: true }, 'a cut floor session is named and left as it is');
  assert.deepEqual([counted(row('K-before')).H, counted(row('K-before')).O1, counted(row('K-before')).O2], [4, true, true]);
  assert.equal(counted(row('S')).H, 4);
  assert.equal(counted({ ...row('S'), source: true }).source, false, 'a cut S session counts as not launched');
  assert.equal(counted({ ...row('K-before'), source: false }).source, false);
  const whole = { label: 'K-after', cut: false, H: 3, O1: true, O2: true, Rfile: true };
  assert.equal(counted(whole), whole, 'a completed session is left as it is');
});

test('cpp-tally: a step takes only its own calls that made a directory from the log', () => {
  const log = [
    '2026-10-08T17:00:00.000Z probe cpp-01 stack-c-cpp K command runs=2 exit=0 dir=d1 kit=stack-c-cpp@abc1234 dirty=false cut=0',
    '2026-10-08T17:10:00.000Z usable round 1 of 4 start',
    '2026-10-08T17:20:00.000Z usable cpp-01 stack-c-cpp-before K command runs=2 exit=0 dir=d2 kit=stack-c-cpp-before@def5678 dirty=false cut=0',
    '2026-10-08T17:30:00.000Z usable cpp-01 stack-c-cpp K command runs=2 exit=1 dir=d3 kit=stack-c-cpp@abc1234 dirty=false cut=0',
    'STOP call failed: x',
  ];
  assert.deepEqual(dirsOf(log, 'probe'), ['d1']);
  assert.deepEqual(dirsOf(log, 'usable'), ['d2', 'd3'], 'a call that failed after it made a directory is taken: its sessions began');
  assert.deepEqual(dirsOf(['2026-10-08T17:00:00.000Z probe cpp-01 stack-c-cpp K command runs=2 exit=2 dir=? kit=undefined@ dirty=undefined cut=0'], 'probe'), [], 'a refused call made no directory');
  assert.deepEqual(dirsOf(log, 'guard'), []);
});

test('cpp-tally: a session is completed only when its last result is a success', () => {
  const res = (subtype, is_error) => ({ type: 'result', subtype, is_error });
  assert.equal(completed(stream([res('success', false)])), true);
  assert.equal(completed(stream([res('error_max_turns', false)])), false, 'out of turns');
  assert.equal(completed(stream([res('success', true)])), false);
  assert.equal(completed(stream([res('success', false), res('error_during_execution', true)])), false, 'the last one decides');
  assert.equal(completed(stream([use('a', 'Bash', { command: 'ls' })])), false, 'no result at all');
});

test('cpp-run: a command resumes at a call of its step, with the sessions that call never started', () => {
  assert.deepEqual(plan('usable').map((x) => x.call), STEPS.usable.flat());
  assert.equal(plan('usable').length, 16);
  const rest = plan('usable', 6, 1);
  assert.equal(rest.length, 11);
  assert.deepEqual(rest[0], { call: ['cpp-01', BEFORE, 'K', 'command', 1], round: 2, first: false, last: false });
  assert.deepEqual(rest[1].call, STEPS.usable[1][2], 'the calls after it are untouched');
  assert.deepEqual(STEPS.usable[1][1], ['cpp-01', BEFORE, 'K', 'command', 2], 'the schedule itself is not changed by a resume');
  assert.throws(() => plan('usable', 17), /--from/);
  assert.throws(() => plan('usable', 0), /--from/);
  assert.throws(() => plan('usable', 6, 3), /--runs/);
  assert.throws(() => plan('usable', 6, 0), /--runs/);
  assert.throws(() => plan('probe', NaN), /--from/);
});

test('cpp-run: a session of another model or host, or with no init, is the fault the driver stops on', () => {
  const ok = { base: 'a', model: MODEL, host: '2.1.291' };
  assert.equal(initFault([ok, { ...ok, base: 'b' }], MODEL, '2.1.291'), null);
  assert.match(initFault([ok, { ...ok, base: 'b', host: '2.1.292' }], MODEL, '2.1.291'), /^b: host 2\.1\.292/);
  assert.match(initFault([{ ...ok, model: 'claude-sonnet-5-0' }], MODEL, '2.1.291'), /^a: model claude-sonnet-5-0/);
  assert.match(initFault([{ base: 'a', model: null, host: null }], MODEL, '2.1.291'), /no init/);
  assert.equal(initFault([ok], MODEL, null), null, 'the uncounted session sets the host');
  assert.match(initFault([{ ...ok, model: 'x' }], MODEL, null), /model x/, 'and must still name the model');
  assert.match(initFault([{ ...ok, host: null }], MODEL, null), /no init/, 'an uncounted session with no host sets none');
});

test('cpp-run: the host comes from the one uncounted session in the log', () => {
  const line = (host) => `2026-10-09T01:00:00.000Z uncounted cpp-01 stack-c-cpp K command runs=1 exit=0 dir=d0 kit=stack-c-cpp@abc1234 dirty=false cut=0 sessions=1 model=claude-sonnet-5-5 host=${host}`;
  assert.equal(hostOf([line('2.1.291'), '2026-10-09T01:10:00.000Z probe cpp-01 stack-c-cpp K command runs=2 exit=0 dir=d1 kit=x@y dirty=false cut=0 sessions=2 model=m host=9.9.9']), '2.1.291');
  assert.equal(hostOf([line('2.1.291') + ' STOPPED=five-hour window at 91%']), null, 'a stopped call sets no host');
  assert.equal(hostOf([line('2.1.291').replace('cut=0', 'cut=1')]), null, 'a cut session sets no host');
  assert.equal(began([line('2.1.291')], 'uncounted'), true);
  assert.equal(began([line('2.1.291')], 'probe'), false);
  assert.equal(began(['2026-10-09T01:00:00.000Z probe cpp-01 stack-c-cpp K command runs=2 exit=2 dir=? kit=undefined@ dirty=undefined cut=0 sessions=0 model=? host=?', '2026-10-09T01:00:00.000Z START probe cpp-01 stack-c-cpp K command runs=2'], 'probe'), false, 'a refused call began nothing');
  assert.equal(hostOf([]), null);
  assert.equal(hostOf([line('2.1.291'), line('2.1.292')]), null, 'two uncounted hosts are not one');
  assert.equal(hostOf([line('none')]), null);
  assert.equal(hostOf([line('?')]), null);
});

test('cpp-run: the measurement is over and the driver starts nothing', () => {
  const { spawnSync } = require('node:child_process');
  const path = require('node:path');
  assert.equal(MEASUREMENT_OVER, true);
  for (const args of [['usable'], ['probe', '--from', '1'], ['uncounted'], ['build-01']]) {
    const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'evals', 'analysis', 'cpp-run.cjs'), ...args], { encoding: 'utf8' });
    assert.equal(r.status, 1, args.join(' '));
    assert.match(r.stderr, /ended on 2026-10-09/);
    assert.equal(r.stdout, '', 'nothing is logged and no branch is switched');
  }
});
