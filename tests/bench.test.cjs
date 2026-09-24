'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { splitItems, scoreAnswer, usageFrom, invocations, median, summarize, tokensComparable } = require('../scripts/lib/bench-score.cjs');
const { loadTask, branchSetup, promptFor, schedule, preflight, rescore } = require('../scripts/bench.cjs');

const ROOT = path.join(__dirname, '..');
const RULES = {
  defects: [
    { id: 'D1', all: [['deleteMany', 'body\\.ids', '\\bids\\b'], ['tenant']] },
    { id: 'D2', all: [['logo', 'startsWith', 'fetch'], ['ssrf', 'server-side request', 'prefix']] },
  ],
  decoys: [{ id: 'X1', all: [['queryRaw'], ['injection']], unless: ['safe', 'parameteri', 'prepared statement'] }],
};

test('an answer is cut into findings at headings and top-level list items, not at blank lines', () => {
  const text = '# Review\n\n### 1. Bulk delete\n`route.ts:22`\n\nThe DELETE handler ignores the tenant.\n\n- second finding\n  continued here\n- third';
  const items = splitItems(text);
  assert.equal(items.length, 4);
  assert.match(items[1], /Bulk delete[\s\S]*ignores the tenant/);
  assert.match(items[2], /second finding[\s\S]*continued here/);
});

test('a defect counts only when every term group matches inside one finding', () => {
  const found = scoreAnswer('### Critical\nThe DELETE uses deleteMany on body ids with no tenant filter.\n\n### Major\nThe logo URL check uses startsWith, an SSRF.', RULES);
  assert.deepEqual(found.found, ['D1', 'D2']);
  const split = scoreAnswer('- deleteMany is used here\n- the tenant check is fine', RULES);
  assert.deepEqual(split.found, [], 'terms spread over two findings do not make one finding');
  assert.deepEqual(split.missed, ['D1', 'D2']);
});

test('a decoy is a false finding unless the finding calls the code safe', () => {
  const flagged = scoreAnswer('- `$queryRaw` with an interpolated id: SQL injection risk.', RULES);
  assert.deepEqual(flagged.decoys, ['X1']);
  const cleared = scoreAnswer('- `$queryRaw` is a tagged template, parameterized, so no SQL injection here.', RULES);
  assert.deepEqual(cleared.decoys, []);
});

test('a task passes only with every defect found and no decoy flagged', () => {
  const all = '- deleteMany over body ids, tenant unchecked\n- logo startsWith prefix bypass: SSRF';
  assert.equal(scoreAnswer(all, RULES).passed, true);
  assert.equal(scoreAnswer(all + '\n- $queryRaw: SQL injection', RULES).passed, false);
  assert.equal(scoreAnswer('- deleteMany over body ids, tenant unchecked', RULES).passed, false);
});

const resultEvent = {
  type: 'result', subtype: 'success', is_error: false, num_turns: 9, duration_ms: 61000, total_cost_usd: 0.9, result: 'final answer',
  modelUsage: {
    'claude-sonnet-5': { inputTokens: 10, outputTokens: 2000, cacheReadInputTokens: 500000, cacheCreationInputTokens: 40000, costUSD: 0.8 },
    'claude-haiku-4-5': { inputTokens: 5, outputTokens: 300, cacheReadInputTokens: 10000, cacheCreationInputTokens: 2000, costUSD: 0.1 },
  },
};
const stream = (events) => events.map((e) => JSON.stringify(e)).join('\n');

test('usage is summed over every model of the session, subagents included', () => {
  const u = usageFrom(stream([{ type: 'system', subtype: 'init', tools: new Array(31).fill('t') }, resultEvent]));
  assert.equal(u.input, 15);
  assert.equal(u.output, 2300);
  assert.equal(u.cacheRead, 510000);
  assert.equal(u.cacheCreation, 42000);
  assert.equal(u.total, 15 + 2300 + 510000 + 42000);
  assert.equal(u.fresh, 15 + 2300 + 42000);
  assert.equal(u.cost, 0.9);
  assert.equal(u.turns, 9);
  assert.equal(u.tools, 31);
  assert.equal(u.answer, 'final answer');
});

// A background agent that reports after the first answer wakes the session for another turn, and the host writes a
// second result event: its usage is the session's running total, its duration and turns only that last turn's.
test('a session woken again after its first answer adds up durations and turns, and keeps the running token total', () => {
  const second = { ...resultEvent, num_turns: 1, duration_ms: 14000, result: 'the answer after the agent reported', subtype: 'success' };
  const u = usageFrom(stream([{ type: 'system', subtype: 'init', tools: [] }, resultEvent, second]));
  assert.equal(u.seconds, 75);
  assert.equal(u.turns, 10);
  assert.equal(u.total, 15 + 2300 + 510000 + 42000, 'the last result carries the total, not a share of it');
  assert.equal(u.answer, 'the answer after the agent reported');
  assert.equal(u.results, 2);
});

test('the way a session ended is kept, so a turn limit is told apart from a weak answer', () => {
  const u = usageFrom(stream([{ ...resultEvent, subtype: 'error_max_turns', is_error: true }]));
  assert.equal(u.end, 'error_max_turns');
});

test('a stream with no result event has no usage and no answer', () => {
  const u = usageFrom(stream([{ type: 'system', subtype: 'init', tools: [] }]));
  assert.equal(u.answer, null);
  assert.equal(u.total, null);
});

test('invocations lists skills and slash commands in order', () => {
  const s = stream([
    { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'bearingkit:bk-review' } }] } },
    { type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Task', input: { subagent_type: 'pr-review-toolkit:code-reviewer' } }] } },
  ]);
  assert.deepEqual(invocations(s), ['skill:bearingkit:bk-review', 'agent:pr-review-toolkit:code-reviewer']);
});

test('the review rules accept the usual words for the same defect and for calling the decoy safe', () => {
  const { rules } = loadTask('review-01', ROOT);
  assert.deepEqual(scoreAnswer('- DELETE removes every id in the body with deleteMany, including invoices of another organization', rules).found, ['D1']);
  assert.deepEqual(scoreAnswer('- `$queryRaw` looks like SQL injection but Prisma sanitizes template values', rules).decoys, []);
  assert.deepEqual(scoreAnswer('- `$queryRaw`: not a real injection issue, the tag binds the value', rules).decoys, []);
  assert.deepEqual(scoreAnswer('- `$queryRaw` builds SQL from invoice.id: SQL injection', rules).decoys, ['X1']);
});

test('median and spread over sessions', () => {
  assert.equal(median([3, 1, 2]), 2);
  assert.equal(median([4, 1, 3, 2]), 2.5);
  assert.equal(median([]), null);
  const s = summarize([{ found: 2, decoys: 0, passed: true, total: 100, fresh: 10, cost: 1, turns: 5, seconds: 60 }, { found: 1, decoys: 1, passed: false, total: 300, fresh: 30, cost: 3, turns: 9, seconds: 90 }, { found: 3, decoys: 0, passed: true, total: 200, fresh: 20, cost: 2, turns: 7, seconds: 80 }]);
  assert.deepEqual(s.found, { median: 2, min: 1, max: 3 });
  assert.equal(s.passes, 2);
  assert.equal(s.sessions, 3);
  assert.deepEqual(s.total, { median: 200, min: 100, max: 300 });
});

test('token totals are compared only when every session saw the same number of tools', () => {
  assert.equal(tokensComparable([{ tools: 31 }, { tools: 31 }]), true);
  assert.equal(tokensComparable([{ tools: 31 }, { tools: 33 }]), false);
});

test('the review task names its fixture, its prompt, its sources and its rules', (t) => {
  const task = loadTask('review-01', ROOT);
  assert.equal(task.id, 'review-01');
  assert.ok(task.prompt.length > 20);
  assert.ok(task.rules.defects.length >= 3, 'three planted defects');
  assert.ok(task.rules.decoys.length >= 1, 'at least one decoy');
  for (const s of task.sources) {
    assert.ok(s.plugin && s.dir.startsWith('_build/upstream/'), `${s.plugin} comes from a pinned copy`);
  }
  // The pinned copies are untracked; on a clean worktree only the declaration can be checked.
  if (!fs.existsSync(path.join(ROOT, '_build', 'upstream'))) return t.skip('no _build/upstream here');
  for (const s of task.sources) {
    const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, s.dir, '.claude-plugin', 'plugin.json'), 'utf8'));
    assert.equal(manifest.name, s.plugin, `${s.dir} ships the plugin ${s.plugin}`);
  }
});

test('each branch loads exactly its plugins and switches exactly those on', () => {
  const task = loadTask('review-01', ROOT);
  const k = branchSetup(task, 'K', ROOT);
  assert.deepEqual(k.pluginDirs, [ROOT]);
  assert.deepEqual(k.settings, { enabledPlugins: { 'bearingkit@inline': true } });
  const s = branchSetup(task, 'S', ROOT);
  assert.equal(s.pluginDirs.length, task.sources.length);
  assert.ok(!s.pluginDirs.includes(ROOT), 'the source branch never loads the kit');
  assert.equal(Object.keys(s.settings.enabledPlugins).length, task.sources.length);
  assert.ok(!('bearingkit@inline' in s.settings.enabledPlugins));
  const f = branchSetup(task, 'F', ROOT);
  assert.deepEqual(f.pluginDirs, []);
  assert.deepEqual(f.settings, { enabledPlugins: {} });
  assert.throws(() => branchSetup(task, 'Z', ROOT), /unknown branch/);
});

test('the natural prompt is the same for every branch; the command prompt names each branch its own command', () => {
  const task = loadTask('review-01', ROOT);
  assert.equal(promptFor(task, 'natural', 'K'), task.prompt);
  assert.equal(promptFor(task, 'natural', 'S'), task.prompt);
  assert.equal(promptFor(task, 'natural', 'F'), task.prompt);
  assert.equal(promptFor(task, 'command', 'K'), `${task.commands.K} ${task.prompt}`);
  assert.equal(promptFor(task, 'command', 'S'), `${task.commands.S} ${task.prompt}`);
  assert.equal(promptFor(task, 'command', 'F'), null, 'the floor has no command to name');
});

test('sessions interleave the branches run by run', () => {
  const plan = schedule({ branches: ['K', 'S', 'F'], variants: ['natural'], runs: 2 });
  assert.deepEqual(plan.map((p) => p.branch + p.run), ['K1', 'S1', 'F1', 'K2', 'S2', 'F2']);
  const both = schedule({ branches: ['K', 'S', 'F'], variants: ['natural', 'command'], runs: 1, skip: (v, b) => v === 'command' && b === 'F' });
  assert.deepEqual(both.map((p) => `${p.variant[0]}${p.branch}`), ['nK', 'nS', 'nF', 'cK', 'cS']);
});

test('the runner refuses to start without an isolated profile or with an unknown option', () => {
  assert.match(preflight({ _: [], task: 'review-01' }).message, /--config-dir/);
  assert.match(preflight({ _: [], task: 'review-01', 'config-dir': 'x', nope: true }).message, /unknown option --nope/);
  assert.match(preflight({ _: [], 'config-dir': 'x' }).message, /--task/);
  assert.equal(preflight({ _: [], task: 'review-01', 'config-dir': 'x' }), null);
  assert.equal(preflight({ _: [], task: 'review-01', rescore: 'some/folder' }), null, 'scoring kept streams again runs no session');
});

test('a results folder is scored again from its raw streams with the rules as they stand now', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-rescore-'));
  const answer = '- deleteMany over body ids, invoices of another organization\n- logo startsWith: SSRF\n- the payment reminder job now reminds void invoices';
  fs.writeFileSync(path.join(dir, '01-natural-K1.raw.jsonl'), stream([{ type: 'system', subtype: 'init', tools: new Array(31).fill('t') }, { ...resultEvent, result: answer }]));
  fs.writeFileSync(path.join(dir, '02-natural-F1.raw.jsonl'), stream([{ type: 'system', subtype: 'init', tools: new Array(31).fill('t') }, { ...resultEvent, result: 'looks fine' }]));
  const rows = rescore(dir, loadTask('review-01', ROOT));
  assert.deepEqual(rows.map((r) => [r.branch, r.run, r.variant, r.passed]), [['K', 1, 'natural', true], ['F', 1, 'natural', false]]);
  assert.ok(fs.readFileSync(path.join(dir, 'results.md'), 'utf8').includes('| natural | K | 1 | 1 |'));
  fs.rmSync(dir, { recursive: true, force: true });
});

test('the fixture builder makes the branch with the planted defects and resets it', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'review-01');
  const build = require('../evals/bench/review-01/build.cjs');
  build.build({ dst, src: path.join(ROOT, 'evals', 'fixtures', 'sample-app') });
  const { spawnSync } = require('node:child_process');
  const git = (...a) => spawnSync('git', a, { cwd: dst, encoding: 'utf8' }).stdout.trim();
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'feature/invoice-export');
  const changed = git('diff', '--name-only', 'main...HEAD').split('\n');
  assert.ok(changed.some((f) => f.endsWith('export/route.ts')));
  assert.ok(!changed.some((f) => f.includes('payment-reminders')), 'the reminder job is outside the diff');
  fs.writeFileSync(path.join(dst, 'scratch.txt'), 'left by a session');
  build.reset({ dst });
  assert.equal(fs.existsSync(path.join(dst, 'scratch.txt')), false);
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'feature/invoice-export');
  fs.rmSync(dir, { recursive: true, force: true });
});
