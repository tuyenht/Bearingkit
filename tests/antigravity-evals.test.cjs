'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { activationFromTranscript, arm, disarm, score } = require('../scripts/antigravity-evals.cjs');
const driver = require('../scripts/antigravity/eval-driver.cjs');

const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), `bk-${p}-`));
const line = (o) => JSON.stringify(o);

// injected: the eval driver's [bearingkit-eval] note is in the transcript, so the harness put the prompt in. The v1
// [bearingkit] block no longer exists: v2 loads the protocol as an always-on rule, which no transcript records.
test('activation is read from the first SKILL.md tool call; the harness note is detected; text items match responses', () => {
  const t = [
    line({ type: 'USER_INPUT', content: '<USER_REQUEST>\nAdd CSV export\n</USER_REQUEST>' }),
    line({ type: 'EPHEMERAL_MESSAGE', content: '[bearingkit-eval] The line "bk eval" above is a harness trigger, not a request. [/bearingkit-eval]' }),
    line({ type: 'PLANNER_RESPONSE', content: 'Reading the skill', tool_calls: [{ name: 'view_file', args: { AbsolutePath: '"C:\\\\Users\\\\x\\\\.gemini\\\\config\\\\plugins\\\\bearingkit\\\\skills\\\\bk-spec\\\\SKILL.md"' } }] }),
    line({ type: 'PLANNER_RESPONSE', content: 'then', tool_calls: [{ name: 'view_file', args: { AbsolutePath: 'C:/x/skills/bk-plan/SKILL.md' } }] }),
  ].join('\n');
  assert.deepEqual(activationFromTranscript(t), { got: 'bk-spec', injected: true, promptSeen: false, readHarness: false });
  // The model's reaction to the trigger line (before the injected prompt) is not scored.
  const withTrigger = [
    line({ type: 'USER_INPUT', content: '<USER_REQUEST>\nReply with OK and wait for my next message.\n</USER_REQUEST>' }),
    line({ type: 'EPHEMERAL_MESSAGE', content: '[bearingkit-eval] harness trigger [/bearingkit-eval]' }),
    line({ type: 'PLANNER_RESPONSE', content: 'peek', tool_calls: [{ name: 'view_file', args: { AbsolutePath: 'C:/p/skills/bk-audit/SKILL.md' } }] }),
    line({ type: 'USER_INPUT', content: '<USER_REQUEST>\nWhat does the retry decorator do?\n</USER_REQUEST>' }),
    line({ type: 'PLANNER_RESPONSE', content: 'The file does not exist.', tool_calls: [{ name: 'view_file', args: { AbsolutePath: 'C:/p/src/http/retry.ts' } }] }),
  ].join('\n');
  assert.deepEqual(activationFromTranscript(withTrigger, { prompt: 'What does the retry decorator do?', expect: 'none' }), { got: 'none', injected: true, promptSeen: true, readHarness: false });
  assert.deepEqual(activationFromTranscript('not json\n' + line({ type: 'PLANNER_RESPONSE', content: 'answered directly' })), { got: 'none', injected: false, promptSeen: false, readHarness: false });
  const v1Only = line({ type: 'EPHEMERAL_MESSAGE', content: '[bearingkit] stack: typescript\n[/bearingkit]' });
  assert.equal(activationFromTranscript(v1Only).injected, false, 'the v1 stack block is not the harness note');
  assert.equal(activationFromTranscript(line({ type: 'PLANNER_RESPONSE', content: 'GLOB-PROBE-OK' }), { kind: 'text', expect: 'GLOB-PROBE-OK' }).got, 'GLOB-PROBE-OK');
  assert.equal(activationFromTranscript(line({ type: 'PLANNER_RESPONSE', content: 'no idea' }), { kind: 'text', expect: 'GLOB-PROBE-OK' }).got, 'none');
});

// A model that cannot find its answer in the fixture widens its search, and one folder up sits the kit's checkout
// (prompt files with their expected labels, the scorer) beside the eval queue. Seen on 2026-09-19: conversations
// opened the queue and the prompt files, then answered. A decision taken after that is not evidence of routing.
test('a conversation that reads the eval harness before its routing decision is marked readHarness', () => {
  const roots = { harnessRoots: ['C:\\Projects\\Bearingkit', 'C:\\Users\\x\\.bearingkit\\antigravity-eval'] };
  const prompt = 'Walk me through the invoices page.';
  const t = (...steps) => [line({ type: 'USER_INPUT', content: `<USER_REQUEST>\n${prompt}\n</USER_REQUEST>` }), ...steps.map(line)].join('\n');
  const call = (name, args) => ({ type: 'PLANNER_RESPONSE', content: '', tool_calls: [{ name, args }] });
  const skill = call('view_file', { AbsolutePath: 'C:\\Users\\x\\.gemini\\config\\plugins\\bearingkit\\skills\\bk-map\\SKILL.md' });
  const item = { prompt, expect: 'none' };

  // Opened a prompt file of the checkout, answered with no skill: the "none" is not clean.
  const read = activationFromTranscript(t(call('view_file', { AbsolutePath: 'c:\\Projects\\Bearingkit\\evals\\activation\\phase-1.jsonl' }), { type: 'PLANNER_RESPONSE', content: 'The page fetches /api/invoices.' }), item, roots);
  assert.deepEqual([read.got, read.readHarness], ['none', true]);
  // The queue, found through a search whose results name it.
  const queue = activationFromTranscript(t(call('grep_search', { SearchPath: 'C:\\Users\\x', Query: 'invoices' }), { type: 'GENERIC', content: 'C:\\Users\\x\\.bearingkit\\antigravity-eval\\queue.json:3: "expect": "none"' }), item, roots);
  assert.equal(queue.readHarness, true, 'a search result that names the queue');
  // find_by_name answers with paths relative to the folder it searched.
  const relative = activationFromTranscript(t(call('find_by_name', { SearchDirectory: 'c:\\Projects', Pattern: '*eval*' }), { type: 'GENERIC', content: 'Found 2 results\nBearingkit\\evals\\activation\\acceptance.jsonl\n.bearingkit-evals\\sample-app' }), item, roots);
  assert.equal(relative.readHarness, true, 'a relative result resolved against the searched folder');
  // The skill was opened first: routing was decided before the harness was read.
  const after = activationFromTranscript(t(skill, call('view_file', { AbsolutePath: 'C:\\Projects\\Bearingkit\\evals\\activation\\phase-1.jsonl' })), { prompt, expect: 'bk-map' }, roots);
  assert.deepEqual([after.got, after.readHarness], ['bk-map', false]);
  // The fixture, the plugin copy and a folder listing that only names the checkout are not the harness.
  const clean = activationFromTranscript(t(
    call('view_file', { AbsolutePath: 'c:\\Projects\\.bearingkit-evals\\sample-app\\src\\app\\invoices\\page.tsx' }),
    call('list_dir', { DirectoryPath: 'c:\\Projects' }), { type: 'GENERIC', content: 'Bearingkit/ (14 items)\n.bearingkit-evals/ (3 items)' },
    call('grep_search', { SearchPath: 'C:\\Users\\x\\.gemini\\config\\plugins\\bearingkit', Query: 'invoices' }), { type: 'GENERIC', content: 'skills\\bk-map\\SKILL.md:3: invoices' },
  ), item, roots);
  assert.deepEqual([clean.got, clean.readHarness], ['none', false]);
});

test('driver decides only on the first invocation of a conversation that starts with the trigger', () => {
  const queue = { trigger: 'bk eval', pending: [{ id: 'a', prompt: 'P1' }] };
  assert.equal(driver.decide({ invocationNum: 2 }, '<USER_REQUEST>\nbk eval\n</USER_REQUEST>', queue, 'bk eval', true).action, 'skip');
  assert.equal(driver.decide({ invocationNum: 1 }, 'Add CSV export', queue, 'bk eval', true).action, 'skip');
  assert.equal(driver.decide({ invocationNum: 0 }, 'bk eval', queue, 'bk eval', true).action, 'inject', 'a zero-based first invocation counts as first');
  const served = { trigger: 'bk eval', pending: [{ id: 'b', prompt: 'P2' }], done: [{ id: 'a', conversationId: 'c-9' }] };
  assert.equal(driver.decide({ invocationNum: 1, conversationId: 'c-9' }, 'bk eval', served, 'bk eval', true).action, 'skip', 'one injection per conversation');
  assert.equal(driver.decide({ invocationNum: 0, conversationId: 'c-10' }, 'bk eval', served, 'bk eval', true).action, 'inject');
  assert.equal(driver.decide({ invocationNum: 1 }, '<USER_REQUEST>\n  BK EVAL \n</USER_REQUEST>', queue, 'bk eval', true).action, 'inject');
  assert.equal(driver.decide({ invocationNum: 1 }, 'bk eval', { pending: [] }, 'bk eval', true).action, 'empty');
  assert.equal(driver.decide({ invocationNum: 1 }, 'bk eval', queue, 'bk eval', false).action, 'skip', 'the trigger outside the fixture is ignored');
  // Antigravity 2.0 appends metadata blocks after the request; only the request block counts.
  const real = '<USER_REQUEST>\nbk eval\n</USER_REQUEST>\n<ADDITIONAL_METADATA>\nThe current local time is: 2026-09-11T00:12:09+07:00.\n</ADDITIONAL_METADATA>';
  assert.equal(driver.requestText(real), 'bk eval');
  assert.equal(driver.decide({ invocationNum: 1 }, real, queue, 'bk eval', true).action, 'inject');
  // No user input in the transcript yet: injected only inside the marked fixture, never elsewhere.
  assert.equal(driver.decide({ invocationNum: 1 }, null, queue, 'bk eval', true).action, 'inject');
  assert.equal(driver.decide({ invocationNum: 1 }, null, queue, 'bk eval', false).action, 'skip');
  assert.equal(driver.decide({ invocationNum: 1 }, 'some real request', queue, 'bk eval', true).action, 'skip', 'a real request in the fixture is not hijacked');
  assert.equal(driver.firstUserInput([line({ type: 'CHECKPOINT' }), line({ type: 'USER_INPUT', content: 'hello' })].join('\n')), 'hello');
});

test('driver end to end: injects the next prompt, advances the queue, records the ledger, resets only a marked fixture', () => {
  const evalDir = tmp('eval');
  const ws = tmp('ws');
  // A marked fixture with a staging tag: a session edit and a stray file must be undone by the driver.
  const git = (args) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t.invalid', '-c', 'core.autocrlf=false', ...args], { cwd: ws, encoding: 'utf8' });
  fs.writeFileSync(path.join(ws, 'a.txt'), 'original');
  fs.writeFileSync(path.join(ws, driver.FIXTURE_MARKER), 'bearingkit fixture');
  git(['init', '-q']); git(['add', '-A']); git(['commit', '-q', '-m', 'fixture']); git(['tag', '-f', driver.STAGE_TAG]);
  fs.writeFileSync(path.join(ws, 'a.txt'), 'edited by a session');
  fs.writeFileSync(path.join(ws, 'junk.txt'), 'stray');
  const transcript = path.join(tmp('t'), 'transcript.jsonl');
  fs.writeFileSync(transcript, line({ type: 'USER_INPUT', content: '<USER_REQUEST>\nbk eval\n</USER_REQUEST>' }) + '\n');
  fs.writeFileSync(path.join(evalDir, 'queue.json'), JSON.stringify({ trigger: 'bk eval', pending: [{ id: 'p1', prompt: 'Add CSV export to the invoices page.' }, { id: 'p2', prompt: 'second' }], done: [] }));
  const payload = JSON.stringify({ conversationId: 'c-1', invocationNum: 1, transcriptPath: transcript, workspacePaths: [ws], modelName: 'auto' });
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'antigravity', 'eval-driver.cjs')], { input: payload, encoding: 'utf8', env: { ...process.env, BEARINGKIT_EVAL_DIR: evalDir } });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.injectSteps.length, 2);
  assert.match(out.injectSteps[0].ephemeralMessage, /harness trigger/);
  assert.deepEqual(out.injectSteps[1], { userMessage: 'Add CSV export to the invoices page.' });
  const q = JSON.parse(fs.readFileSync(path.join(evalDir, 'queue.json'), 'utf8'));
  assert.equal(q.pending.length, 1);
  assert.equal(q.done[0].id, 'p1');
  assert.equal(q.done[0].prompt, 'Add CSV export to the invoices page.', 'the ledger carries the whole item');
  assert.equal(q.done[0].conversationId, 'c-1');
  assert.equal(q.done[0].reset, true);
  assert.equal(fs.readFileSync(path.join(ws, 'a.txt'), 'utf8'), 'original', 'session edit undone');
  assert.ok(!fs.existsSync(path.join(ws, 'junk.txt')), 'stray file removed');
  // An unmarked workspace is never reset.
  const plain = tmp('plain');
  fs.writeFileSync(path.join(plain, 'keep.txt'), 'keep');
  assert.equal(driver.resetFixture(plain), false);
  assert.ok(fs.existsSync(path.join(plain, 'keep.txt')));
  // A second invocation in the same conversation does nothing.
  const r2 = spawnSync(process.execPath, [path.join(__dirname, '..', 'scripts', 'antigravity', 'eval-driver.cjs')], { input: JSON.stringify({ conversationId: 'c-1', invocationNum: 2, transcriptPath: transcript, workspacePaths: [ws] }), encoding: 'utf8', env: { ...process.env, BEARINGKIT_EVAL_DIR: evalDir } });
  assert.equal(r2.stdout, '{}');
});

test('arm installs the driver hook beside the kit hook, score reads transcripts, disarm removes the hook', () => {
  const plugin = tmp('plugin');
  const evalDir = tmp('eval2');
  fs.writeFileSync(path.join(plugin, 'hooks.json'), JSON.stringify({ bearingkit: { PreInvocation: [{ command: 'node hooks/stack-profile.cjs --event PreInvocation' }] }, 'bearingkit-probe': { PreInvocation: [] } }));
  const a = arm([{ id: 'x', intent: 'bug', lang: 'en', prompt: 'It crashes', expect: 'bk-debug' }], { pluginDir: plugin, evalDir, tag: 't' });
  assert.equal(a.count, 1);
  const hooks = JSON.parse(fs.readFileSync(path.join(plugin, 'hooks.json'), 'utf8'));
  assert.ok(hooks.bearingkit && hooks['bearingkit-eval'] && !hooks['bearingkit-probe'], 'kit hook kept, eval hook added, probe removed');
  assert.ok(fs.existsSync(path.join(plugin, 'hooks', 'eval-driver.cjs')));
  // Simulate the ledger the driver writes and a transcript with an activation.
  const transcript = path.join(tmp('t2'), 'transcript.jsonl');
  fs.writeFileSync(transcript, line({ type: 'PLANNER_RESPONSE', tool_calls: [{ name: 'view_file', args: { AbsolutePath: 'C:/p/skills/bk-debug/SKILL.md' } }] }) + '\n');
  const q = JSON.parse(fs.readFileSync(path.join(evalDir, 'queue.json'), 'utf8'));
  q.done = [{ ...q.pending[0], conversationId: 'c', transcriptPath: transcript, modelName: 'auto', reset: true }];
  q.pending = [];
  fs.writeFileSync(path.join(evalDir, 'queue.json'), JSON.stringify(q));
  const s = score({ evalDir });
  assert.equal(s.results.length, 1);
  assert.equal(s.results[0].got, 'bk-debug');
  assert.equal(s.results[0].expect, 'bk-debug');
  disarm({ pluginDir: plugin });
  const after = JSON.parse(fs.readFileSync(path.join(plugin, 'hooks.json'), 'utf8'));
  assert.ok(after.bearingkit && !after['bearingkit-eval']);
  assert.ok(!fs.existsSync(path.join(plugin, 'hooks', 'eval-driver.cjs')));
});
