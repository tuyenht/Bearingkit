'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { splitItems, scoreAnswer, usageFrom, invocations, median, summarize, tokensComparable, perDefect } = require('../scripts/lib/bench-score.cjs');
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
