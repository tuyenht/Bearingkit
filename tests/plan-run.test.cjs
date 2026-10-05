'use strict';
// The instruments of the plan-01 run (docs/specs/2026-10-03-bk-plan-design.md, "Step 5"): the driver's rotation and
// command line, its refusal to start a session before the bars are approved, and the tally's reading of a session's
// branch and of whether a source skill was read.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const run = require('../evals/analysis/plan-run.cjs');
const tally = require('../evals/analysis/plan-tally.cjs');

test('plan-run order: four branches a round, each in every position once over four rounds', () => {
  const rounds = [1, 2, 3, 4].map((i) => run.order(i));
  for (const r of rounds) assert.deepEqual([...r].sort(), ['F', 'S', 'after', 'before']);
  for (let pos = 0; pos < 4; pos++) assert.deepEqual(rounds.map((r) => r[pos]).sort(), ['F', 'S', 'after', 'before'], `position ${pos}`);
  assert.deepEqual(run.order(1), ['before', 'after', 'S', 'F']);
  assert.deepEqual(run.order(5), run.order(1));
  // Without S: three branches, rotating over three rounds.
  assert.deepEqual([1, 2, 3].map((i) => run.order(i, true)[0]), ['before', 'after', 'F']);
  assert.equal(run.order(2, true).includes('S'), false);
  // Every name is a call the driver knows; K-before runs on its own branch, the others on K-after's.
  for (const name of run.order(1)) assert.ok(run.CALLS[name], name);
  assert.deepEqual([run.CALLS.before, run.CALLS.after, run.CALLS.S, run.CALLS.F], [[run.BEFORE, 'K'], [run.AFTER, 'K'], [run.AFTER, 'S'], [run.AFTER, 'F']]);
});

test('plan-run command line: flags and at most two round numbers, in order', () => {
  assert.deepEqual(run.parse([]), { dry: false, noS: false, from: 1, last: 4 });
  assert.deepEqual(run.parse(['--dry', '--no-s', '3', '4']), { dry: true, noS: true, from: 3, last: 4 });
  for (const bad of [['--help'], ['0'], ['1', '2', '3'], ['4', '2'], ['x'], ['--dry', '-1'], ['1', '5'], ['5']]) assert.equal(run.parse(bad), null, bad.join(' '));
  assert.deepEqual(run.parse(['4', '4']), { dry: false, noS: false, from: 4, last: 4 });
});

const DRIVER = path.join(__dirname, '..', 'evals', 'analysis', 'plan-run.cjs');
const git = (...args) => spawnSync('git', args, { cwd: path.join(__dirname, '..'), encoding: 'utf8' });

test('plan-run starts no session while the bars are not approved, and refuses a bad command line first', () => {
  // A bad command line is refused before anything else (this call can never start a run, whatever the flag says).
  const bad = spawnSync('node', [DRIVER, '--dry', '9', '1'], { encoding: 'utf8' });
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /usage: plan-run\.cjs/);
  // While the bars are not approved a plain call is refused too. Spawned only then: once the flag is true this call
  // would be a real run, and a test must never start one.
  if (!run.BARS_APPROVED) {
    const r = spawnSync('node', [DRIVER], { encoding: 'utf8' });
    assert.equal(r.status, 2);
    assert.match(r.stderr, /not approved yet/);
  }
});

test('plan-run pins paths that exist at the frozen commit, and the seven files are what that commit changed', () => {
  assert.equal(git('cat-file', '-e', `${run.FROZEN}^{commit}`).status, 0, 'the frozen commit is in this repository');
  // A pathspec that matches nothing would pass every diff in silence: each pinned path exists at the frozen commit.
  for (const p of [...run.SAME_PATHS, ...run.KIT_PATHS, ...run.SEVEN]) assert.equal(git('cat-file', '-e', `${run.FROZEN}:${p}`).status, 0, p);
  // The frozen commit changed exactly the seven files, against its parent.
  const changed = git('diff', '--name-only', `${run.FROZEN}^`, run.FROZEN).stdout.split('\n').filter(Boolean).sort();
  assert.deepEqual(changed, [...run.SEVEN].sort());
  // K-before is that parent, and the plugin manifest is among the paths that must not differ between the two.
  assert.equal(git('rev-parse', `${run.FROZEN}^`).stdout.trim(), run.BEFORE_COMMIT);
  assert.ok(run.SAME_PATHS.includes('.claude-plugin'));
  // The evidence beside the gate plans (keys, readings) may grow, so the gate directory as a whole is not pinned;
  // every gate plan and the expected marks are.
  assert.equal(run.SAME_PATHS.includes('evals/bench/plan-01/gate'), false);
  const gate = git('ls-tree', '--name-only', `${run.FROZEN}:evals/bench/plan-01/gate`).stdout.split('\n').filter((n) => /^g\d+\.md$/.test(n) || n === 'expected.json');
  for (const f of gate) assert.ok(run.SAME_PATHS.includes(`evals/bench/plan-01/gate/${f}`), f);
  assert.equal(gate.length, 15);
});

test('plan-tally label: K is told apart by the kit branch the runner recorded', () => {
  assert.deepEqual([tally.label('K', 'p5b-bk-plan-before'), tally.label('K', 'p5b-bk-plan'), tally.label('S', 'p5b-bk-plan'), tally.label('F', 'p5b-bk-plan-before')], ['K-before', 'K-after', 'S', 'F']);
});

const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
const result = (id, extra = {}) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, ...extra }] } });
const arrives = () => ({ type: 'user', message: { content: [{ type: 'text', text: 'Base directory for this skill: C:/x/skills/writing-plans' }] } });

test('plan-tally stream: a source skill is read when it is launched and its text arrives, or its SKILL.md is read', () => {
  // Launched, the text arrives right after.
  const launched = tally.stream([use('a', 'Skill', { skill: 'superpowers:writing-plans' }), result('a'), arrives(), { type: 'result', subtype: 'success', total_cost_usd: 0.4, permission_denials: [] }]);
  assert.deepEqual([launched.read, launched.viaSkill, launched.viaFile, launched.skills, launched.tools, launched.cost, launched.end, launched.refused], [true, true, false, ['superpowers:writing-plans'], 1, 0.4, 'success', 0]);
  // Called but refused: the call is in the stream, the text never arrives.
  const refused = tally.stream([use('a', 'Skill', { skill: 'mattpocock-skills:to-tickets' }), result('a', { is_error: true }), { type: 'result', subtype: 'success', permission_denials: [{ tool_name: 'Skill' }] }]);
  assert.deepEqual([refused.read, refused.refusedSkill, refused.refused], [false, true, 1]);
  // Another tool call between the launch and the text: not counted as arrived.
  const late = tally.stream([use('a', 'Skill', { skill: 'superpowers:writing-plans' }), result('a'), use('b', 'Read', { file_path: 'C:/p/README.md' }), result('b'), arrives()]);
  assert.equal(late.read, false);
  // The file itself read, or printed.
  const file = tally.stream([use('a', 'Read', { file_path: 'C:\\up\\skills\\engineering\\to-tickets\\SKILL.md' }), result('a')]);
  assert.deepEqual([file.read, file.viaFile], [true, true]);
  assert.equal(tally.stream([use('a', 'Bash', { command: 'cat /up/skills/writing-plans/SKILL.md' }), result('a')]).read, true);
  assert.equal(tally.stream([use('a', 'Read', { file_path: 'C:/up/skills/writing-plans/SKILL.md' }), result('a', { is_error: true })]).read, false);
  // A kit skill, or another source skill, is not this skill's source.
  assert.equal(tally.stream([use('a', 'Skill', { skill: 'bearingkit:bk-plan' }), result('a'), arrives()]).read, false);
  assert.equal(tally.stream([use('a', 'Skill', { skill: 'superpowers:brainstorming' }), result('a'), arrives()]).read, false);
  assert.equal(tally.stream([]).end, 'no result event');
  // The model and the number of tools the session started with come from its init event.
  const init = tally.stream([{ type: 'system', subtype: 'init', model: 'm-1', tools: ['Read', 'Edit', 'Bash'] }]);
  assert.deepEqual([init.model, init.initTools, tally.stream([]).initTools], ['m-1', 3, null]);
});

test('plan-tally met: p at most 0.05 with the first mean above, and nothing on an empty group', () => {
  assert.equal(tally.met([5, 5, 5, 5, 5, 5, 5, 5], [1, 1, 1, 1, 1, 1, 1, 1]), true);
  assert.equal(tally.met([1, 1, 1, 1, 1, 1, 1, 1], [5, 5, 5, 5, 5, 5, 5, 5]), false);
  assert.equal(tally.met([3, 2, 3, 2], [2, 3, 2, 3]), false);
  assert.equal(tally.met([], [1, 2]), false);
  // Cost: a ratio only between branches whose sessions all started with the same number of tools.
  assert.equal(tally.costRatio(0.6, 0.3, [20, 20], [20, 20]), '2.00');
  assert.match(tally.costRatio(0.6, 0.3, [20, 20], [20, 33]), /^0\.600 and 0\.300, not comparable/);
  assert.match(tally.costRatio(0.6, 0.3, [20, null], [20]), /not comparable/);
  assert.equal(tally.costRatio(null, 0.3, [20], [20]), '-');
  assert.equal(tally.MIN_PLANS, 6);
});
