'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { splitItems, scoreAnswer, usageFrom, invocations, median, summarize, tokensComparable, perDefect } = require('../scripts/lib/bench-score.cjs');
const { loadTask, branchSetup, promptFor, schedule, preflight, rescore, runSession } = require('../scripts/bench.cjs');

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
  assert.equal(u.results, 2);
});

// The user reads both answers, and the first is often the full review while the second only says the reviewer agreed
// (review-02 on Sonnet, 2026-09-25: the cache key was named only in the first), so both are scored.
test('a session woken again is scored on every answer it gave, in order', () => {
  const second = { ...resultEvent, num_turns: 1, duration_ms: 14000, result: 'the answer after the agent reported', subtype: 'success' };
  const u = usageFrom(stream([{ type: 'system', subtype: 'init', tools: [] }, resultEvent, second]));
  assert.equal(u.answer, 'final answer\n\nthe answer after the agent reported');
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

// Calibration keeps a defect only when the floor misses it, so the report counts each defect per branch.
test('each defect and decoy is counted per branch', () => {
  const rows = [{ foundIds: ['D1', 'D2'], decoyIds: [] }, { foundIds: ['D1'], decoyIds: ['X1'] }, { foundIds: [], decoyIds: [] }];
  assert.deepEqual(perDefect(rows, { defects: [{ id: 'D1' }, { id: 'D2' }, { id: 'D3' }], decoys: [{ id: 'X1' }] }), { D1: 2, D2: 1, D3: 0, X1: 1 });
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
  const md = fs.readFileSync(path.join(dir, 'results.md'), 'utf8');
  assert.ok(md.includes('| natural | K | 1 | 1 |'));
  assert.ok(md.includes('- natural K: D1 1/1 · D2 1/1 · D3 1/1 · X1 0/1'), 'the per-defect section counts each branch');
  assert.ok(md.includes('- natural F: D1 0/1 · D2 0/1 · D3 0/1 · X1 0/1'));
  fs.rmSync(dir, { recursive: true, force: true });
});

// A rescore used to call every session whole and drop the run's model and limits (2026-09-25: a session cut at the
// time limit read as a finished one that found nothing). The run now keeps its meta beside the streams.
test('a rescore keeps the run meta and still counts a session with no result as cut', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-rescore-'));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ date: '2026-09-25', model: 'haiku', configDir: 'profile', fixture: 'fx', seconds: 900, turns: 40 }));
  fs.writeFileSync(path.join(dir, '01-natural-K1.raw.jsonl'), stream([{ type: 'system', subtype: 'init', tools: new Array(31).fill('t') }]));
  const rows = rescore(dir, loadTask('review-01', ROOT));
  assert.equal(rows[0].cut, true, 'no result event: the session was cut or lost, not a finished one');
  const md = fs.readFileSync(path.join(dir, 'results.md'), 'utf8');
  assert.ok(md.includes('Model haiku · profile profile · fixture fx · limits 900s, 40 turns'), 'the run meta survives a rescore');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('review-02 keeps the pay route outside the diff and its rules tell a careful answer from a careless one', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'review-02');
  const build = require('../evals/bench/review-02/build.cjs');
  build.build({ dst, src: path.join(ROOT, 'evals', 'fixtures', 'sample-app') });
  const { spawnSync } = require('node:child_process');
  const changed = spawnSync('git', ['diff', '--name-only', 'main...HEAD'], { cwd: dst, encoding: 'utf8' }).stdout.split('\n');
  assert.ok(changed.some((f) => f.endsWith('tenancy.ts')));
  assert.ok(!changed.some((f) => f.includes('/pay/')), 'the pay route is not in the diff');
  fs.rmSync(dir, { recursive: true, force: true });
  const { rules } = loadTask('review-02', ROOT);
  const careful = '1. **Pay route skips the tenant check** `src/app/api/invoices/[id]/pay/route.ts:9`: assertTenant now returns null instead of throwing, and the pay route ignores the return value.\n2. `invoice-stats` is memoized without the tenant in the key, so one tenant sees another tenant\'s totals.\n3. The catch block logs every header with console.error, including the Authorization bearer token.\n- `fx-rates` has no tenant in its key, which is fine: the rates are global.';
  assert.deepEqual(scoreAnswer(careful, rules), { found: ['H1', 'H2', 'H3'], missed: [], decoys: [], blocked: null, passed: true });
  const careless = '- Both memo keys, `invoice-stats` and `fx-rates`, lack the tenant: cross-tenant leak.';
  assert.deepEqual(scoreAnswer(careless, rules).decoys, ['X1']);
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

// review-03 is a clean diff: telling the owner not to merge it is a false outcome, read on the whole answer.
const BLOCKS = { defects: [], decoys: [], blocks: loadTask('review-03', ROOT).rules.blocks };

test('a block verdict is read on the whole answer, and a clean task fails when it blocks the merge', () => {
  assert.equal(scoreAnswer('## Verdict\nDo not merge until the webhook is fixed.', BLOCKS).blocked, true);
  assert.equal(scoreAnswer('Changes requested.', BLOCKS).blocked, true);
  assert.equal(scoreAnswer('1. first\n2. second\n\nFix both before merging.', BLOCKS).blocked, true);
  assert.equal(scoreAnswer('Nothing here blocks the merge. Ready to merge.', BLOCKS).blocked, false);
  assert.equal(scoreAnswer('No blockers; ready to merge.', BLOCKS).blocked, false);
  assert.equal(scoreAnswer('Ready to merge.', BLOCKS).passed, true);
  assert.equal(scoreAnswer('This should not be merged yet.', BLOCKS).passed, false);
  assert.equal(scoreAnswer('Do not merge.', RULES).blocked, null, 'a task with no block rule does not score the verdict');
});

test('review-03 is a clean branch whose own code passes its checks, and its rules tell a careful answer from a careless one', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'review-03');
  const build = require('../evals/bench/review-03/build.cjs');
  build.build({ dst });
  const { spawnSync } = require('node:child_process');
  const git = (...a) => spawnSync('git', a, { cwd: dst, encoding: 'utf8' }).stdout.trim();
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'feature/payment-webhook');
  const changed = git('diff', '--name-only', 'main...HEAD').split('\n');
  for (const f of ['src/app/api/webhooks/payments/route.ts', 'src/app/api/invoices/[id]/events/route.ts', 'src/app/api/invoices/search/route.ts', 'src/lib/webhook-signature.ts', 'src/lib/search-params.ts', 'prisma/schema.prisma', 'tests/webhook-signature.test.ts', 'tests/search-params.test.ts', '.env.example']) assert.ok(changed.includes(f), `${f} is in the diff`);
  assert.ok(changed.some((f) => /^prisma\/migrations\/\d+_payment_events\/migration\.sql$/.test(f)));
  assert.ok(!fs.existsSync(path.join(dst, 'env.example')), 'the stored name does not reach the fixture');
  assert.ok(!fs.existsSync(path.join(dst, 'src', 'components')), 'none of the sample app\'s planted defects comes along');
  const read = (f) => fs.readFileSync(path.join(dst, f), 'utf8');
  assert.match(read('src/app/api/invoices/search/route.ts'), /Prisma\.raw\(SORTS\[/);
  assert.match(read('src/lib/webhook-signature.ts'), /given\.length === expected\.length && timingSafeEqual\(given, expected\)/);
  assert.doesNotMatch(read('src/app/api/webhooks/payments/route.ts'), /tenant/i);
  assert.match(read('src/app/api/invoices/[id]/events/route.ts'), /invoice\.tenantId !== session\.tenantId/);
  // The claim "clean" rests on the code doing what it says: the two pure modules run here, types stripped by node.
  if (!process.features.typescript) t.diagnostic('node cannot strip types: the fixture modules were not run');
  else {
    const { pathToFileURL } = require('node:url');
    const { createHmac } = require('node:crypto');
    const sig = await import(pathToFileURL(path.join(dst, 'src/lib/webhook-signature.ts')).href);
    const sp = await import(pathToFileURL(path.join(dst, 'src/lib/search-params.ts')).href);
    const body = '{"id":"evt_1"}'; const secret = 'whsec_test'; const t0 = 1790000000;
    const header = (b, ts = t0) => `t=${ts},v1=${createHmac('sha256', secret).update(`${ts}.${b}`).digest('hex')}`;
    assert.deepEqual(sig.verifySignature(body, header(body), secret, t0 * 1000), { ok: true });
    assert.equal(sig.verifySignature(body + ' ', header(body), secret, t0 * 1000).reason, 'mismatch');
    assert.equal(sig.verifySignature(body, header(body), secret, (t0 + 301) * 1000).reason, 'stale');
    assert.equal(sig.verifySignature(body, header(body).slice(0, -2), secret, t0 * 1000).reason, 'mismatch', 'a short signature is refused, not thrown on');
    assert.equal(sig.verifySignature(body, 'v1=abc', secret, t0 * 1000).reason, 'malformed');
    assert.equal(sig.verifySignature(body, header(body) + 'zz', secret, t0 * 1000).reason, 'malformed', 'trailing characters that are not hex are refused, not dropped');
    const old = createHmac('sha256', 'whsec_old').update(`${t0}.${body}`).digest('hex');
    assert.deepEqual(sig.verifySignature(body, `t=${t0},v1=${old},v1=${header(body).split('v1=')[1]}`, secret, t0 * 1000), { ok: true }, 'any v1 of a rotating secret');
    assert.equal(sig.verifySignature(body, `t=${t0},v1=${old}`, secret, t0 * 1000).reason, 'mismatch');
    assert.equal(sig.verifySignature(body, null, secret, t0 * 1000).reason, 'missing');
    const parse = (q) => sp.parseSearchParams(new URLSearchParams(q));
    assert.deepEqual(parse('').value, { q: null, status: null, sort: 'newest', limit: 20, offset: 0 });
    assert.deepEqual(parse('q=%20acme%20&status=open&sort=overdue&limit=500&offset=-4').value, { q: 'acme', status: 'open', sort: 'overdue', limit: 50, offset: 0 });
    assert.equal(parse('limit=abc').value.limit, 20);
    assert.equal(parse('sort=__proto__').ok, false);
    assert.equal(parse('sort=toString').ok, false);
    assert.equal(parse('status=archived').ok, false);
    assert.equal(parse('q=' + 'x'.repeat(101)).ok, false);
    assert.equal(sp.likePattern('50%_off\\'), '%50\\%\\_off\\\\%');
  }
  fs.writeFileSync(path.join(dst, 'scratch.txt'), 'left by a session');
  build.reset({ dst });
  assert.equal(fs.existsSync(path.join(dst, 'scratch.txt')), false);
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'feature/payment-webhook');
  fs.rmSync(dir, { recursive: true, force: true });
  const { rules } = loadTask('review-03', ROOT);
  const careful = '1. The search builds SQL with `$queryRaw` and `Prisma.raw(SORTS[sort])`; it looks like SQL injection, but the sort comes from a fixed map and every value is bound, so it is safe.\n2. The length check before `timingSafeEqual` leaks nothing: both are 32-byte SHA-256 digests.\n3. The webhook marks the invoice paid with no tenant filter, which is correct: the id comes from the signed payload.\n4. The events route checks the invoice\'s tenant before listing payment events, so there is no IDOR.\n5. Minor: the search could use a trigram index.\n\nReady to merge.';
  assert.deepEqual(scoreAnswer(careful, rules), { found: [], missed: [], decoys: [], blocked: false, passed: true });
  const careless = '- **SQL injection** in search: `Prisma.raw` interpolates the sort into ORDER BY.\n- The length check before timingSafeEqual leaks timing information about the signature.\n- The webhook updates invoices of any tenant: no tenant filter on updateMany.\n- IDOR: the events route lists payment events with no tenant scope on the query.\n\nDo not merge until these are fixed.';
  assert.deepEqual(scoreAnswer(careless, rules), { found: [], missed: [], decoys: ['X1', 'X2', 'X3', 'X4'], blocked: true, passed: false });
});

// Eight sessions per branch cannot show much: the exact test says how much a count difference is worth.
test('the two-sided Fisher exact test gives the p of a found-count difference', () => {
  const { fisherExact } = require('../scripts/lib/bench-score.cjs');
  assert.equal(fisherExact(5, 3, 1, 7).toFixed(3), '0.119');
  assert.equal(fisherExact(5, 3, 3, 13).toFixed(3), '0.065');
  assert.equal(fisherExact(3, 0, 1, 2).toFixed(3), '0.400');
  assert.equal(fisherExact(5, 3, 5, 3), 1);
  assert.ok(fisherExact(8, 0, 0, 8) < 0.001);
});

test('a median of an even number of sessions is printed rounded, not with float noise', () => {
  const { report } = require('../scripts/bench.cjs');
  const row = (n, cost) => ({ n, variant: 'natural', branch: 'F', run: n, foundIds: [], missed: [], decoyIds: [], blocked: null, found: 0, decoys: 0, passed: false, total: 1, fresh: 1, cost, turns: 1, seconds: 1, tools: 31, results: 1, invoked: [], answerFile: 'a' });
  const md = report({ id: 't', rules: { defects: [], decoys: [] } }, [row(1, 0.1), row(2, 0.117)], { date: 'd' });
  assert.ok(md.includes('| 0.109 (0.1–0.117) |'), md);
});

test('the report counts sessions that blocked the merge', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-rescore-'));
  const init = { type: 'system', subtype: 'init', tools: new Array(31).fill('t') };
  fs.writeFileSync(path.join(dir, '01-natural-F1.raw.jsonl'), stream([init, { ...resultEvent, result: '- Prisma.raw in ORDER BY: SQL injection.\n\nDo not merge.' }]));
  fs.writeFileSync(path.join(dir, '02-natural-F2.raw.jsonl'), stream([init, { ...resultEvent, result: 'Ready to merge.' }]));
  const rows = rescore(dir, loadTask('review-03', ROOT));
  assert.deepEqual(rows.map((r) => [r.blocked, r.passed]), [[true, false], [false, true]]);
  const md = fs.readFileSync(path.join(dir, 'results.md'), 'utf8');
  assert.ok(md.includes('| Blocked |'), 'both tables have a Blocked column');
  assert.ok(md.includes('- natural F: X1 1/2 · X2 0/2 · X3 0/2 · X4 0/2 · blocked 1/2'));
  fs.rmSync(dir, { recursive: true, force: true });
});

// Phrasings from the independent review of review-03 (2026-09-24): praise and clearing lines, verdicts either way.
test('review-03 rules do not count praise or a cleared decoy as a false finding, and still count the flags', () => {
  const { rules } = loadTask('review-03', ROOT);
  const decoys = (text) => scoreAnswer(text, rules).decoys;
  for (const line of [
    '- Uses `timingSafeEqual` to prevent timing attacks.',
    '- The length check reveals only the length, which is public (32 bytes).',
    '- Search binds every value via `Prisma.sql`, which prevents SQL injection.',
    '- The sort is whitelisted, not injectable.',
    '- Events route properly scopes by tenant.',
    '- No tenant filter in the webhook — intentional, the payload is signed.',
    '- Style: use `findFirst` with `tenantId` in the events route instead of `findUnique`, as the main route does.',
  ]) assert.deepEqual(decoys(line), [], line);
  assert.deepEqual(decoys('## Strengths\n- Parameterized search, no injection risk from `Prisma.raw`.\n- The events route checks the tenant; the webhook needs no tenant filter.\n\n## Issues\n- Minor: add a test for the P2003 path.'), [], 'a strengths section is not a list of findings');
  assert.deepEqual(decoys('**Strengths**\n- The webhook leaks no timing: timingSafeEqual.\n\n**Issues**\n- `Prisma.raw` in ORDER BY: SQL injection.'), ['X1'], 'a bold line opens a section as a heading does');
  assert.deepEqual(decoys('- `Prisma.raw` is not really safe here: SQL injection through the sort.'), ['X1']);
  assert.deepEqual(decoys('- The length check makes the comparison non-constant-time.'), ['X2']);
  assert.deepEqual(decoys('- The webhook updates invoices of any tenant: no tenant filter on updateMany.'), ['X3']);
  assert.deepEqual(decoys('- IDOR: the events route lists payment events with no tenant scope on the query.'), ['X4']);
});

test('review-03 reads the merge verdict in the formats the review plugins write', () => {
  const { rules } = loadTask('review-03', ROOT);
  const blocked = (text) => scoreAnswer(text, rules).blocked;
  for (const text of ['No merge blockers.', 'Merge blockers: none.', 'No issues block the merge.', 'Nothing I found blocks the merge.', "No reason this shouldn't be merged.", 'No changes requested.', "I'm not requesting changes.", 'No need to fix these before merging.', '**Ready to merge?** Yes', 'Ready to merge: no issues found.', '### Critical (must fix before merge)\nNone.\n\n### Suggestions\n- add a test', '- Non-blocking: rename a variable.']) assert.equal(blocked(text), false, text);
  for (const text of ['**Ready to merge?** No', '**Ready to merge?** With fixes', '### Critical (must fix before merge)\n- The webhook trusts the amount.', 'These should be fixed before merging.', 'Fix before merge: the webhook.', '**Blocker:** the webhook.', '### Blocking issues\n- The webhook.', 'Hold off merging until the webhook is fixed.', 'Do not merge.', 'Changes requested.']) assert.equal(blocked(text), true, text);
});

// The second pass of the independent review (2026-09-24): fixes that follow a claim, negations, empty verdict sections.
test('review-03 keeps a flag whose finding ends with a fix, and clears praise the second review listed', () => {
  const { rules } = loadTask('review-03', ROOT);
  const decoys = (text) => scoreAnswer(text, rules).decoys;
  const flagged = [
    ['- The webhook\'s updateMany has no tenant filter, so a provider event can mark any tenant\'s invoice. Fix: add tenantId to prevent cross-tenant writes.', 'X3'],
    ['- Prisma.raw in ORDER BY is an injection risk; use a CASE to be safe.', 'X1'],
    ['- `Prisma.raw` in the search isn’t safe: SQL injection through the sort.', 'X1'],
    ['- SQL injection in the search via Prisma.raw is not acceptable in a payment app.', 'X1'],
    ['- timingSafeEqual is constant-time, but the early length return leaks the signature length.', 'X2'],
    ['- IDOR: the events route never checks the tenant of the events it lists.', 'X4'],
    ['- The events route has no tenant filter on paymentEvent.findMany, without properly checking ownership.', 'X4'],
  ];
  for (const [line, id] of flagged) assert.deepEqual(decoys(line), [id], line);
  for (const line of [
    '- The events route does not expose other tenants\' events.',
    '- Events endpoint returns 404, not 403, for another tenant\'s invoice.',
    '- No tenant filter needed on the webhook.',
    '- SQL injection in search: OK ✅',
  ]) assert.deepEqual(decoys(line), [], line);
  assert.deepEqual(decoys('## Strengths\n- ok\n\nIssues:\n1. Prisma.raw in ORDER BY: SQL injection.'), ['X1'], 'a plain line ends the praise');
  assert.deepEqual(decoys('### Strengths\n- fine\n\n**Issues**\n- Prisma.raw in ORDER BY: SQL injection.'), ['X1'], 'a bold line ends a praise heading of any level');
  assert.deepEqual(decoys('## Strengths and weaknesses\n- Prisma.raw in ORDER BY: SQL injection.'), ['X1'], 'a heading is praise only when it is nothing else');
  assert.deepEqual(decoys('1. **Webhook**\n   **Fix:** nothing\n   The webhook has no tenant filter: cross-tenant writes.'), ['X3'], 'an indented bold line does not cut a finding');
});

test('review-03 verdicts: negated blocks and empty blocking sections do not block; the remaining forms do', () => {
  const { rules } = loadTask('review-03', ROOT);
  const blocked = (text) => scoreAnswer(text, rules).blocked;
  for (const text of ["These don't block the merge.", "I don't see anything that blocks the merge.", 'Ready to merge: no blocking issues.', '### Blocking issues\n\nNo blocking issues found.', '### Critical (must fix before merge)\n\nNo critical issues.', '### Critical (must fix before merge)\n_(none)_', '### Blocking\n✅ None', 'Blockers: —', 'Not blocking: add a trigram index.', 'Non blocking: add a trigram index.', "These are optional and don't need to be fixed before merging.", 'I don’t think this should block the merge.']) assert.equal(blocked(text), false, text);
  for (const text of ['Ready to merge: Not yet', 'Recommend addressing the webhook before merging.', 'Needs changes before merge.', 'Fixing #1 is required before merge.', 'Hold the merge until the webhook is fixed.', 'This shouldn’t be merged yet.']) assert.equal(blocked(text), true, text);
});

// The third pass of the independent review (2026-09-24), the last before the rules froze.
test('review-03 third pass: hedged clears, the plugins\' praise heading, and claims the clearing words must not hide', () => {
  const { rules } = loadTask('review-03', ROOT);
  const decoys = (text) => scoreAnswer(text, rules).decoys;
  for (const text of [
    '- Prisma.raw in ORDER BY looks like SQL injection. Should be fine: SORTS is a fixed map.',
    '- Prisma.raw only sees SORTS values, so this should be safe from injection.',
    '- The webhook has no tenant filter, which is right: the payload is HMAC-verified.',
    '## Positive Observations\n- The events route has no tenant filter on the events query, but checks the invoice first.',
    '## Strengths (3)\n- No tenant filter in the webhook; the id comes from the provider.',
  ]) assert.deepEqual(decoys(text), [], text);
  for (const [text, id] of [
    ['- **SQL injection** — passes the sort value into Prisma.raw.', 'X1'],
    ['- Passes sort straight into ORDER BY: injection.', 'X1'],
    ['- The webhook\'s updateMany has no tenant check where one is required.', 'X3'],
    ['- IDOR: the events route loads any tenant\'s invoice with findUnique before its 404 check.', 'X4'],
  ]) assert.deepEqual(decoys(text), [id], text);
  const blocked = (text) => scoreAnswer(text, rules).blocked;
  assert.equal(blocked('**Ready to merge?** No — fix the webhook first.'), true);
  assert.equal(blocked('Ready to merge: With fixes (see Important)'), true);
  assert.equal(blocked('Nice-to-have; fine to address after merge rather than before merging.'), false);
});

// debug-01 is scored on the fixture after the session, not on the answer: its builder's check() runs the tests.
test('a defect scored by a fixture check is found when the check passed, and an optional one does not decide the pass', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-rescore-'));
  const init = { type: 'system', subtype: 'init', tools: new Array(31).fill('t') };
  fs.writeFileSync(path.join(dir, '01-natural-F1.raw.jsonl'), stream([init, { ...resultEvent, result: 'Fixed.' }]));
  fs.writeFileSync(path.join(dir, '01-natural-F1.check.json'), JSON.stringify({ visible: true, root: true, kept: true, regression: false }));
  fs.writeFileSync(path.join(dir, '02-natural-F2.raw.jsonl'), stream([init, { ...resultEvent, result: 'Fixed.' }]));
  fs.writeFileSync(path.join(dir, '02-natural-F2.check.json'), JSON.stringify({ visible: true, root: false, kept: true, regression: true }));
  fs.writeFileSync(path.join(dir, '03-natural-F3.raw.jsonl'), stream([init, { ...resultEvent, result: 'Fixed.' }]));
  const rows = rescore(dir, loadTask('debug-01', ROOT));
  assert.deepEqual(rows.map((r) => [r.foundIds, r.missed, r.passed]), [
    [['visible', 'root', 'kept'], ['regression'], true],
    [['visible', 'kept', 'regression'], ['root'], false],
    [[], ['visible', 'root', 'kept', 'regression'], false],
  ], 'a session with no check file found nothing');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a task that needs tools gets the same permissions on every branch', () => {
  const task = loadTask('debug-01', ROOT);
  for (const b of ['K', 'S', 'F']) assert.deepEqual(branchSetup(task, b, ROOT).settings.permissions, task.permissions, b);
  assert.ok(task.permissions.allow.some((r) => /^Edit\(\/\/c\/Projects\/\.bearingkit-evals\/bench\/debug-01\/\*\*\)$/.test(r)));
  assert.equal(branchSetup(loadTask('review-01', ROOT), 'F', ROOT).settings.permissions, undefined, 'a review task gets none');
});

test('debug-01: the planted bug fails only east of UTC, and the checks tell the tempting patch from the root fix', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'debug-01');
  const build = require('../evals/bench/debug-01/build.cjs');
  build.build({ dst });
  const { spawnSync } = require('node:child_process');
  const git = (...a) => spawnSync('git', a, { cwd: dst, encoding: 'utf8' }).stdout.trim();
  assert.equal(git('log', '--format=%s').split('\n').length, 2, 'two commits: the dates, then the reworded summary');
  const suite = (tz) => {
    const env = { ...process.env, TZ: tz };
    delete env.NODE_TEST_CONTEXT;
    return spawnSync(process.execPath, ['--test', 'tests/invoice.test.js', 'tests/dates.test.js'], { cwd: dst, env, encoding: 'utf8' }).status;
  };
  assert.notEqual(suite('Asia/Ho_Chi_Minh'), 0, 'red in UTC+7');
  assert.equal(suite('UTC'), 0, 'green in CI');
  assert.equal(suite('America/Los_Angeles'), 0, 'green where it was written');
  assert.deepEqual(build.check(dst), { visible: false, root: false, kept: false, regression: false }, 'the planted state fails, the original tests included');
  const edit = (rel, from, to) => { const f = path.join(dst, rel); const s = fs.readFileSync(f, 'utf8'); assert.ok(s.includes(from), `${rel}: ${from}`); fs.writeFileSync(f, s.replace(from, to)); };
  edit('src/dates.js', 'return date.toISOString().slice(0, 10);', "return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');");
  assert.deepEqual(build.check(dst), { visible: true, root: false, kept: true, regression: false }, 'the tempting patch passes what is visible only');
  build.reset({ dst });
  edit('src/dates.js', 'return new Date(year, month - 1, day);', 'return new Date(Date.UTC(year, month - 1, day));');
  edit('src/dates.js', 'date.setDate(date.getDate() + days);', 'date.setUTCDate(date.getUTCDate() + days);');
  fs.appendFileSync(path.join(dst, 'tests/dates.test.js'), "\ntest('a date east of UTC keeps its day', () => {\n  assert.equal(formatDate(parseDate('2026-01-31')), '2026-01-31');\n});\n");
  assert.deepEqual(build.check(dst), { visible: true, root: true, kept: true, regression: true }, 'the root fix, with a regression test');
  assert.equal(fs.readdirSync(dst).some((n) => n.startsWith('.bench-check-')), false, 'the check copies are gone after the check');
  build.reset({ dst });
  for (const f of ['tests/invoice.test.js', 'tests/dates.test.js']) fs.writeFileSync(path.join(dst, f), "'use strict';\nrequire('node:test')('placeholder', () => {});\n");
  assert.deepEqual(build.check(dst), { visible: true, root: false, kept: false, regression: false }, 'weakened tests pass what is visible only');
  build.reset({ dst });
  edit('src/dates.js', "'use strict';\n", "'use strict';\nprocess.env.TZ = 'UTC';\n");
  assert.deepEqual(build.check(dst), { visible: true, root: false, kept: true, regression: false }, 'a zone pinned inside the code is caught');
  build.reset({ dst });
  edit('src/dates.js', 'return new Date(year, month - 1, day);', 'return new Date(year, month - 1, day, 12);');
  edit('src/dates.js', 'return Math.floor((parseDate(to) - parseDate(from)) / DAY_MS);', 'return Math.round((parseDate(to) - parseDate(from)) / DAY_MS);');
  assert.deepEqual(build.check(dst), { visible: true, root: false, kept: true, regression: false }, 'a noon-anchored date fails east of UTC+12');
  build.reset({ dst });
  assert.equal(git('status', '--porcelain'), '');
  fs.rmSync(dir, { recursive: true, force: true });
});

// A run never writes into a folder that already holds a run: the model is in the name unless it is the default, and a
// second run of the same day gets a numbered folder of its own.
test('each run gets a results folder of its own, named for its model', () => {
  const { resultsDir } = require('../scripts/bench.cjs');
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-dirs-'));
  const first = resultsDir(root, '2026-09-24', 'review-01', ['natural'], 'sonnet');
  assert.equal(path.basename(first), '2026-09-24-bench-review-01-natural');
  assert.equal(path.basename(resultsDir(root, '2026-09-24', 'review-01', ['natural'], 'haiku')), '2026-09-24-bench-review-01-natural-haiku');
  fs.mkdirSync(first, { recursive: true });
  assert.equal(resultsDir(root, '2026-09-24', 'review-01', ['natural'], 'sonnet'), first, 'an empty folder is reused');
  fs.writeFileSync(path.join(first, 'results.md'), 'x');
  assert.equal(path.basename(resultsDir(root, '2026-09-24', 'review-01', ['natural'], 'sonnet')), '2026-09-24-bench-review-01-natural-2');
  fs.mkdirSync(`${first}-2`);
  fs.writeFileSync(path.join(`${first}-2`, 'results.md'), 'x');
  assert.equal(path.basename(resultsDir(root, '2026-09-24', 'review-01', ['natural', 'command'], 'sonnet')), '2026-09-24-bench-review-01-natural+command');
  assert.equal(path.basename(resultsDir(root, '2026-09-24', 'review-01', ['natural'], 'sonnet')), '2026-09-24-bench-review-01-natural-3');
  fs.rmSync(root, { recursive: true, force: true });
});

// A session that outlives its kill is given up after a grace period and marked an orphan, so the run can stop
// instead of waiting on it (2026-09-25: a stalled session ran 2,663 seconds against a 900-second limit).
const sleeper = () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-sleeper-'));
  const file = path.join(dir, 'sleep.cjs');
  fs.writeFileSync(file, 'setTimeout(() => {}, 4000);\n');
  return { dir, bin: `node ${file}` };
};
const sessionOpts = (bin, extra) => ({ bin, turns: 1, model: 'x', configDir: os.tmpdir(), cwd: os.tmpdir(), seconds: 0.3, ...extra });
const treeKill = (pid) => (process.platform === 'win32' ? require('node:child_process').spawnSync('taskkill', ['/T', '/F', '/PID', String(pid)], { stdio: 'ignore' }) : process.kill(pid, 'SIGKILL'));

test('a session its kill ends is cut, not an orphan', async () => {
  const { dir, bin } = sleeper();
  const s = await runSession('p', { settings: {}, pluginDirs: [] }, sessionOpts(bin, { graceMs: 3000 }));
  assert.equal(s.cut, true);
  assert.equal(s.orphan, false, 'the tree kill worked, so the close event came before the grace period');
  fs.rmSync(dir, { recursive: true, force: true });
});

test('a session that outlives its kill is given up as an orphan after the grace period', async () => {
  const { dir, bin } = sleeper();
  const t0 = Date.now();
  const s = await runSession('p', { settings: {}, pluginDirs: [] }, sessionOpts(bin, { graceMs: 200, kill: () => 7 }));
  assert.equal(s.orphan, true);
  assert.equal(s.cut, true);
  assert.equal(s.killStatus, 7, 'the kill result is kept for the report');
  assert.ok(Date.now() - t0 < 3000, 'resolved before the process would have ended by itself');
  treeKill(s.pid);
  fs.rmSync(dir, { recursive: true, force: true });
});

// Seen red first (registered 2026-09-25 for debug-01): a file node --test runs is written, a node run reports a
// failure, and only then is anything under src/ edited.
const { seenRedFirst } = require('../scripts/lib/bench-score.cjs');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
const out = (id, content) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content }] } });

test('a test written and seen failing before the fix counts as seen red first', () => {
  assert.equal(seenRedFirst(stream([
    use('a', 'Write', { file_path: 'C:/fx/tests/timezone.test.js', content: 'x' }),
    use('b', 'Bash', { command: 'node --test' }), out('b', 'ℹ pass 8\nℹ fail 1'),
    use('c', 'Edit', { file_path: 'C:/fx/src/dates.js', old_string: 'a', new_string: 'b' }),
  ])), true);
});

test('a test written after the fix does not count, even if a stash later shows it red', () => {
  assert.equal(seenRedFirst(stream([
    use('c', 'Edit', { file_path: 'C:/fx/src/dates.js', old_string: 'a', new_string: 'b' }),
    use('a', 'Write', { file_path: 'C:/fx/tests/timezone.test.js', content: 'x' }),
    use('b', 'Bash', { command: 'git stash push -- src/dates.js && node --test' }), out('b', 'ℹ fail 2'),
  ])), false);
});

test('reading a test file with 2>&1 is not writing one', () => {
  assert.equal(seenRedFirst(stream([
    use('a', 'Bash', { command: 'cat tests/dates.test.js; echo --; node --test 2>&1' }), out('a', 'ℹ fail 6'),
    use('c', 'Edit', { file_path: 'C:/fx/src/dates.js', old_string: 'a', new_string: 'b' }),
  ])), false);
});

test('a top-level test-*.js written through a shell redirect counts', () => {
  assert.equal(seenRedFirst(stream([
    use('a', 'Bash', { command: "cat > test-tz.js <<'EOF'\nrequire('assert')\nEOF" }),
    use('b', 'Bash', { command: 'node test-tz.js' }), out('b', [{ type: 'text', text: 'AssertionError: expected' }]),
    use('c', 'Edit', { file_path: 'C:/fx/src/dates.js', old_string: 'a', new_string: 'b' }),
  ])), true);
});

test('a test file written outside the fixture does not count, and an explicit 1> redirect does', () => {
  const root = 'C:/fx';
  assert.equal(seenRedFirst(stream([
    use('a', 'Write', { file_path: 'C:/Temp/scratchpad/probe.test.js', content: 'x' }),
    use('b', 'Bash', { command: 'node --test C:/Temp/scratchpad/probe.test.js' }), out('b', 'ℹ fail 1'),
    use('c', 'Edit', { file_path: 'C:/fx/src/dates.js', old_string: 'a', new_string: 'b' }),
  ]), root), false, 'a scratch file is not a file the fixture suite runs');
  assert.equal(seenRedFirst(stream([
    use('a', 'Bash', { command: 'printf x 1> tests/tz.test.js' }),
    use('b', 'Bash', { command: 'node --test' }), out('b', 'ℹ fail 1'),
    use('c', 'Edit', { file_path: 'C:/fx/src/dates.js', old_string: 'a', new_string: 'b' }),
  ]), root), true);
});

// review-04, a pull request of realistic size (2026-09-26): 29 files over four commits, three planted defects among
// benign changes, two decoys. The fixture test pins the planted state and the benign modules' behaviour.
test('review-04 plants its three defects in a 29-file branch and its rules tell a careful answer from a careless one', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'review-04');
  const build = require('../evals/bench/review-04/build.cjs');
  build.build({ dst });
  const { spawnSync } = require('node:child_process');
  const git = (...a) => spawnSync('git', a, { cwd: dst, encoding: 'utf8' }).stdout.trim();
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'feature/billing-q4');
  const changed = git('diff', '--name-only', 'main...HEAD').split('\n');
  assert.equal(changed.length, 29);
  assert.ok(!changed.includes('src/app/api/admin/export/route.ts'), 'D1: the export route is outside the diff');
  const read = (f) => fs.readFileSync(path.join(dst, f), 'utf8');
  assert.match(read('src/app/api/admin/export/route.ts'), /^\s+requireRole\(session, 'ADMIN'\);$/m, 'D1: called as a statement');
  assert.match(read('src/lib/roles.ts'), /: boolean \{\n\s+return rank/, 'D1: the helper returns a boolean');
  assert.match(read('src/repos/invoices.ts'), /findByNumber\(tenantId: string, number: string\) \{\n\s+return db\.invoice\.findFirst\(\{ where: \{ number \}/, 'D2');
  const voidRoute = read('src/app/api/invoices/[id]/void/route.ts');
  assert.doesNotMatch(voidRoute, /\$transaction/, 'D3: no transaction');
  assert.match(voidRoute, /catch \(e\) \{\n\s+logger\.error/, 'D3: the catch only logs');
  assert.match(read('src/app/api/invoices/[id]/pay/route.ts'), /db\.\$transaction\(\[/, 'the pay route keeps its transaction');
  assert.match(read('src/app/api/reports/revenue/route.ts'), /Prisma\.sql`[\s\S]*= \$\{session\.tenantId\}/, 'X1: values bound');
  assert.match(read('src/lib/fx.ts'), /same for every tenant/, 'X2');
  assert.ok(!fs.existsSync(path.join(dst, 'env.example')));
  if (!process.features.typescript) t.diagnostic('node cannot strip types: the fixture modules were not run');
  else {
    const { pathToFileURL } = require('node:url');
    const money = await import(pathToFileURL(path.join(dst, 'src/lib/money.ts')).href);
    const cn = await import(pathToFileURL(path.join(dst, 'src/lib/credit-notes.ts')).href);
    assert.equal(money.formatMoney(12345, 'USD'), '$123.45');
    assert.equal(money.formatMoney(12345, 'JPY'), '¥12,345');
    assert.equal(money.minorDigits('kwd'), 3);
    assert.equal(cn.creditNoteNumber('INV-7'), 'CN-INV-7');
    assert.equal(cn.creditAmountMinor([{ amountMinor: 5 }, { amountMinor: 7 }]), 12);
  }
  fs.writeFileSync(path.join(dst, 'scratch.txt'), 'left by a session');
  build.reset({ dst });
  assert.equal(fs.existsSync(path.join(dst, 'scratch.txt')), false);
  fs.rmSync(dir, { recursive: true, force: true });
  const { rules } = loadTask('review-04', ROOT);
  const careful = '1. **Any member can export the full CSV** at src/app/api/admin/export/route.ts:11: requireRole now returns a boolean and this route ignores the result.\n2. **findByNumber ignores the tenant** at src/repos/invoices.ts:19, so the by-number route reads another tenant\'s invoice.\n3. **Void is not atomic** at src/app/api/invoices/[id]/void/route.ts:17: no transaction, the catch only logs, and it still returns 200.\n\nChecked and fine: the revenue report binds every value through Prisma.sql, no SQL injection; the fx cache has no tenant in its key, which is fine since rates are the same for every tenant.';
  assert.deepEqual(scoreAnswer(careful, rules), { found: ['D1', 'D2', 'D3'], missed: [], decoys: [], blocked: null, passed: true });
  const careless = '1. SQL injection risk in the revenue report: $queryRaw is used.\n2. The fx rates cache is not keyed by tenant, so tenants share cached data.';
  assert.deepEqual(scoreAnswer(careless, rules), { found: [], missed: ['D1', 'D2', 'D3'], decoys: ['X1', 'X2'], blocked: null, passed: false });
});

// test-01 (2026-09-26): characterization tests scored by mutation. Untouched, the suite kills nothing; a suite that pins
// one input per quirk kills all twelve (so no mutant is equivalent); a suite that edits the module is not "kept".
test('test-01 kills no mutant untouched, all twelve with a characterization suite, and notices an edited module', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'test-01');
  const build = require('../evals/bench/test-01/build.cjs');
  build.build({ dst });
  const first = build.check(dst);
  assert.equal(first.killed, 0);
  assert.equal(first.green, true);
  assert.equal(first.kept, true);
  assert.equal(first.added, false);
  const suite = `'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { lineTotal, orderTotal } = require('../src/pricing');
const one = (unitCents, qty) => ({ items: [{ unitCents, qty }] });
test('bulk from 101 units, rounded', () => {
  assert.equal(lineTotal({ unitCents: 100, qty: 100 }), 10000);
  assert.equal(lineTotal({ unitCents: 15, qty: 101 }), 1364);
  assert.equal(lineTotal({ unitCents: 5, qty: -2 }), 0);
});
test('coupons', () => {
  assert.equal(orderTotal({ ...one(5000, 1), coupon: 'WELCOME10', country: 'US' }).discount, 500);
  assert.equal(orderTotal({ ...one(5005, 1), coupon: 'WELCOME10', country: 'US' }).discount, 500);
  assert.equal(orderTotal({ ...one(300, 1), coupon: 'FLAT500', country: 'US' }).discount, 300);
});
test('tax', () => {
  assert.equal(orderTotal({ ...one(1000, 1), country: 'JP' }).tax, 100);
  assert.equal(orderTotal({ ...one(1000, 1), country: 'SG' }).tax, 90);
  assert.equal(orderTotal({ ...one(1000, 1), coupon: 'FLAT500', country: 'VN' }).tax, 50);
});
test('shipping', () => {
  assert.equal(orderTotal({ ...one(20000, 1), country: 'US' }).shipping, 0);
  assert.equal(orderTotal({ ...one(20300, 1), coupon: 'FLAT500', country: 'US' }).shipping, 5000);
  assert.equal(orderTotal({ ...one(1000, 1), country: 'VN' }).shipping, 3000);
});
`;
  fs.writeFileSync(path.join(dst, 'tests', 'pricing.test.js'), suite);
  const full = build.check(dst);
  assert.equal(full.green, true);
  assert.equal(full.added, true);
  assert.deepEqual(Object.keys(build.MUTANTS).filter((id) => !full[id]), [], 'every mutant is killed by some input');
  assert.equal(full.killed, 12);
  fs.appendFileSync(path.join(dst, 'src', 'pricing.js'), '\n// touched\n');
  const edited = build.check(dst);
  assert.equal(edited.kept, false);
  assert.equal(edited.killed, 12, 'the mutation runs use the original module');
  assert.match(fs.readFileSync(path.join(dst, 'src', 'pricing.js'), 'utf8'), /touched/, 'the session\'s copy is put back');
  build.reset({ dst });
  assert.equal(build.check(dst).killed, 0);
  // A suite locked to the file's text (a hash) fails on every mutant without pinning any behaviour; the canary, a
  // comment-only change, catches it and the score is withheld.
  const digest = require('node:crypto').createHash('sha256').update(fs.readFileSync(path.join(ROOT, 'evals/bench/test-01/app/src/pricing.js'), 'utf8')).digest('hex');
  fs.writeFileSync(path.join(dst, 'tests', 'hash.test.js'), [
    "const test = require('node:test'); const assert = require('node:assert/strict');",
    "const fs = require('node:fs'); const path = require('node:path'); const crypto = require('node:crypto');",
    "test('unchanged', () => {",
    "  const text = fs.readFileSync(path.join(__dirname, '..', 'src', 'pricing.js'), 'utf8').split('\\r\\n').join('\\n');",
    `  assert.equal(crypto.createHash('sha256').update(text).digest('hex'), '${digest}');`,
    '});', '',
  ].join('\n'));
  const locked = build.check(dst);
  assert.equal(locked.green, true);
  assert.equal(locked.textLocked, true);
  assert.equal(locked.killed, 0, 'a text-locked suite scores nothing');
  fs.rmSync(dir, { recursive: true, force: true });
});

// Exact two-sided permutation test on the difference of means, for counts such as mutants killed per session.
const { permutationTest } = require('../scripts/lib/bench-score.cjs');
test('the permutation test gives 1 for identical groups and a small p for separated ones', () => {
  assert.equal(permutationTest([3, 3, 3], [3, 3, 3]), 1);
  const p = permutationTest([12, 12, 11, 12, 12, 11, 12, 12], [6, 7, 5, 8, 6, 7, 6, 5]);
  assert.ok(p < 0.001, `separated groups: ${p}`);
  // Hand-checked: [1, 2] against [3, 4]: of the 6 splits, 2 are as extreme (|diff| = 2), so p = 1/3.
  assert.ok(Math.abs(permutationTest([1, 2], [3, 4]) - 1 / 3) < 1e-9);
});

// 2026-09-30: a K-before and a K-after run from different branches of the same checkout were told apart only by folder
// order; meta.json now records the kit checkout's branch, commit and dirty state, and results.md shows it.
test('the run records which kit checkout K loaded: branch, commit, uncommitted changes', () => {
  const { kitRevision } = require('../scripts/bench.cjs');
  const { spawnSync } = require('node:child_process');
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-kit-'));
  const git = (...a) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t', ...a], { cwd: repo, encoding: 'utf8' });
  git('init', '-q', '-b', 'k-after');
  fs.writeFileSync(path.join(repo, 'a.txt'), '1\n');
  git('add', '-A');
  git('commit', '-q', '-m', 'one');
  const head = git('rev-parse', 'HEAD').stdout.trim();
  assert.deepEqual(kitRevision(repo), { branch: 'k-after', commit: head, dirty: false });
  fs.writeFileSync(path.join(repo, 'a.txt'), '2\n');
  assert.equal(kitRevision(repo).dirty, true, 'an uncommitted edit to a tracked file is reported');
  git('checkout', '-q', '--', 'a.txt');
  fs.writeFileSync(path.join(repo, 'new.md'), 'x\n');
  assert.equal(kitRevision(repo).dirty, true, 'a new file that is not ignored is reported: the plugin would load it');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-rescore-'));
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify({ date: '2026-09-30', model: 'sonnet', configDir: 'p', fixture: 'fx', seconds: 900, turns: 60, kit: { branch: 'k-after', commit: head, dirty: false } }));
  fs.writeFileSync(path.join(dir, '01-natural-K1.raw.jsonl'), stream([{ type: 'system', subtype: 'init', tools: [] }]));
  rescore(dir, loadTask('review-01', ROOT));
  assert.ok(fs.readFileSync(path.join(dir, 'results.md'), 'utf8').includes(`kit k-after@${head.slice(0, 7)}`), 'results.md names the kit checkout');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.rmSync(repo, { recursive: true, force: true });
});
