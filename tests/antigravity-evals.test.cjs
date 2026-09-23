'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { activationFromTranscript, arm, disarm, score, stage, PROBE_GLOB } = require('../scripts/antigravity-evals.cjs');
const driver = require('../scripts/antigravity/eval-driver.cjs');

const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), `bk-${p}-`));
const line = (o) => JSON.stringify(o);
const REPO = path.join(__dirname, '..');
// Words that tell a model it is inside a measurement. On 2026-09-19 the fixture README ("used only to run the
// activation evals") and the driver's note ("harness trigger") sent conversations searching for the prompt files.
const TELLS = /eval|harness|fixture|bearingkit|activation|benchmark|\btest prompt|trigger/i;

// injected: the driver's note is in the transcript, so the harness, not the owner, put the prompt in. The note of
// runs before the neutral harness (2026-09-19 evening) carried [bearingkit-eval]; saved queues of those runs must still score.
test('activation is read from the first SKILL.md tool call; the driver note is detected; text items match responses', () => {
  const t = [
    line({ type: 'USER_INPUT', content: '<USER_REQUEST>\nAdd CSV export\n</USER_REQUEST>' }),
    line({ type: 'EPHEMERAL_MESSAGE', content: driver.NOTE }),
    line({ type: 'PLANNER_RESPONSE', content: 'Reading the skill', tool_calls: [{ name: 'view_file', args: { AbsolutePath: '"C:\\\\Users\\\\x\\\\.gemini\\\\config\\\\plugins\\\\bearingkit\\\\skills\\\\bk-spec\\\\SKILL.md"' } }] }),
    line({ type: 'PLANNER_RESPONSE', content: 'then', tool_calls: [{ name: 'view_file', args: { AbsolutePath: 'C:/x/skills/bk-plan/SKILL.md' } }] }),
  ].join('\n');
  assert.deepEqual(activationFromTranscript(t), { got: 'bk-spec', injected: true, promptSeen: false, readHarness: false });
  const oldNote = line({ type: 'EPHEMERAL_MESSAGE', content: '[bearingkit-eval] The line "bk eval" above is a harness trigger, not a request. [/bearingkit-eval]' });
  assert.equal(activationFromTranscript(oldNote).injected, true, 'the note of earlier runs still counts');
  // The model's reaction to the opening line (before the injected prompt) is not scored.
  const withTrigger = [
    line({ type: 'USER_INPUT', content: '<USER_REQUEST>\nReply with OK and wait for my next message.\n</USER_REQUEST>' }),
    line({ type: 'EPHEMERAL_MESSAGE', content: driver.NOTE }),
    line({ type: 'PLANNER_RESPONSE', content: 'peek', tool_calls: [{ name: 'view_file', args: { AbsolutePath: 'C:/p/skills/bk-audit/SKILL.md' } }] }),
    line({ type: 'USER_INPUT', content: '<USER_REQUEST>\nWhat does the retry decorator do?\n</USER_REQUEST>' }),
    line({ type: 'PLANNER_RESPONSE', content: 'The file does not exist.', tool_calls: [{ name: 'view_file', args: { AbsolutePath: 'C:/p/src/http/retry.ts' } }] }),
  ].join('\n');
  assert.deepEqual(activationFromTranscript(withTrigger, { prompt: 'What does the retry decorator do?', expect: 'none' }), { got: 'none', injected: true, promptSeen: true, readHarness: false });
  assert.deepEqual(activationFromTranscript('not json\n' + line({ type: 'PLANNER_RESPONSE', content: 'answered directly' })), { got: 'none', injected: false, promptSeen: false, readHarness: false });
  const v1Only = line({ type: 'EPHEMERAL_MESSAGE', content: '[bearingkit] stack: typescript\n[/bearingkit]' });
  assert.equal(activationFromTranscript(v1Only).injected, false, 'the v1 stack block is not the driver note');
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
  const queue = activationFromTranscript(t(call('grep_search', { SearchPath: 'C:\\Users\\x', Query: 'invoices' }), { type: 'GENERIC', content: 'C:\\Users\\x\\.bearingkit\\antigravity-eval\\queue.json:3: "prompt": "x"' }), item, roots);
  assert.equal(queue.readHarness, true, 'a search result that names the queue');
  // find_by_name answers with paths relative to the folder it searched.
  const relative = activationFromTranscript(t(call('find_by_name', { SearchDirectory: 'c:\\Projects', Pattern: '*eval*' }), { type: 'GENERIC', content: 'Found 2 results\nBearingkit\\evals\\activation\\acceptance.jsonl\n.bearingkit-evals\\sample-app' }), item, roots);
  assert.equal(relative.readHarness, true, 'a relative result resolved against the searched folder');
  // The skill was opened first: routing was decided before the harness was read.
  const after = activationFromTranscript(t(skill, call('view_file', { AbsolutePath: 'C:\\Projects\\Bearingkit\\evals\\activation\\phase-1.jsonl' })), { prompt, expect: 'bk-map' }, roots);
  assert.deepEqual([after.got, after.readHarness], ['bk-map', false]);
  // The fixture, the plugin copy and a folder listing that only names the checkout are not the harness.
  const clean = activationFromTranscript(t(
    call('view_file', { AbsolutePath: 'c:\\work\\apps\\sample-app\\src\\app\\invoices\\page.tsx' }),
    call('list_dir', { DirectoryPath: 'c:\\Projects' }), { type: 'GENERIC', content: 'Bearingkit/ (14 items)\n.bearingkit-evals/ (3 items)' },
    call('grep_search', { SearchPath: 'C:\\Users\\x\\.gemini\\config\\plugins\\bearingkit', Query: 'invoices' }), { type: 'GENERIC', content: 'skills\\bk-map\\SKILL.md:3: invoices' },
  ), item, roots);
  assert.deepEqual([clean.got, clean.readHarness], ['none', false]);
});

test('driver decides only on the first invocation of a conversation that starts with the opening line', () => {
  const queue = { trigger: 'bk eval', pending: [{ id: 'a', prompt: 'P1' }] };
  assert.equal(driver.decide({ invocationNum: 2 }, '<USER_REQUEST>\nbk eval\n</USER_REQUEST>', queue, 'bk eval', true).action, 'skip');
  assert.equal(driver.decide({ invocationNum: 1 }, 'Add CSV export', queue, 'bk eval', true).action, 'skip');
  assert.equal(driver.decide({ invocationNum: 0 }, 'bk eval', queue, 'bk eval', true).action, 'inject', 'a zero-based first invocation counts as first');
  const served = { trigger: 'bk eval', pending: [{ id: 'b', prompt: 'P2' }], done: [{ id: 'a', conversationId: 'c-9' }] };
  assert.equal(driver.decide({ invocationNum: 1, conversationId: 'c-9' }, 'bk eval', served, 'bk eval', true).action, 'skip', 'one injection per conversation');
  assert.equal(driver.decide({ invocationNum: 0, conversationId: 'c-10' }, 'bk eval', served, 'bk eval', true).action, 'inject');
  assert.equal(driver.decide({ invocationNum: 1 }, '<USER_REQUEST>\n  BK EVAL \n</USER_REQUEST>', queue, 'bk eval', true).action, 'inject');
  assert.equal(driver.decide({ invocationNum: 1 }, 'bk eval', { pending: [] }, 'bk eval', true).action, 'empty');
  assert.equal(driver.decide({ invocationNum: 1 }, 'bk eval', queue, 'bk eval', false).action, 'skip', 'the opening line outside the stage is ignored');
  // Antigravity 2.0 appends metadata blocks after the request; only the request block counts.
  const real = '<USER_REQUEST>\nbk eval\n</USER_REQUEST>\n<ADDITIONAL_METADATA>\nThe current local time is: 2026-09-11T00:12:09+07:00.\n</ADDITIONAL_METADATA>';
  assert.equal(driver.requestText(real), 'bk eval');
  assert.equal(driver.decide({ invocationNum: 1 }, real, queue, 'bk eval', true).action, 'inject');
  // No user input in the transcript yet: injected only inside the marked stage, never elsewhere.
  assert.equal(driver.decide({ invocationNum: 1 }, null, queue, 'bk eval', true).action, 'inject');
  assert.equal(driver.decide({ invocationNum: 1 }, null, queue, 'bk eval', false).action, 'skip');
  assert.equal(driver.decide({ invocationNum: 1 }, 'some real request', queue, 'bk eval', true).action, 'skip', 'a real request in the stage is not hijacked');
  assert.equal(driver.firstUserInput([line({ type: 'CHECKPOINT' }), line({ type: 'USER_INPUT', content: 'hello' })].join('\n')), 'hello');
});

// What the model can read of the harness itself: the note the driver injects and the queue, if a search reaches it.
// Neither may say that this is a measurement, and the queue carries no expected label a model could copy.
test('the driver note and the queue carry nothing that names a measurement or its expected answers', () => {
  assert.doesNotMatch(driver.NOTE, TELLS);
  assert.doesNotMatch(driver.EMPTY_NOTE, TELLS);
  const evalDir = tmp('evalq');
  const plugin = tmp('pluginq');
  const prompts = [
    { id: 'map-neg-01', intent: 'map', lang: 'en', prompt: 'Walk me through the invoices page.', expect: 'none' },
    { id: 'bug-en-01', intent: 'bug', lang: 'en', prompt: 'It crashes on save.', expect: 'bk-debug' },
  ];
  arm(prompts, { pluginDir: plugin, evalDir, tag: 'rerun-harness' });
  const raw = fs.readFileSync(path.join(evalDir, 'queue.json'), 'utf8');
  const q = JSON.parse(raw);
  assert.deepEqual(q.pending.map((p) => p.prompt), prompts.map((p) => p.prompt), 'prompts queued in order');
  for (const p of q.pending) assert.deepEqual(Object.keys(p).sort(), ['id', 'prompt'], 'a queued item is an id and a prompt');
  assert.deepEqual(q.pending.map((p) => p.id), ['p01', 'p02']);
  for (const leak of ['map-neg-01', 'bug-en-01', 'bk-debug', '"none"', 'expect', 'intent', 'rerun-harness']) assert.ok(!raw.includes(leak), `the queue names ${leak}`);
});

// The queue no longer carries labels, so scoring takes them back from the prompt files by prompt text. That needs
// every prompt to be unique across the files, which this checks on the real set.
test('score takes the labels back from the prompt files by prompt text', () => {
  const dir = tmp('prompts');
  const file = path.join(dir, 'set.jsonl');
  const items = [
    { id: 'map-neg-01', intent: 'map', lang: 'en', prompt: 'Walk me through the invoices page.', expect: 'none' },
    { id: 'bug-en-01', intent: 'bug', lang: 'en', prompt: 'It crashes on save.', expect: 'bk-debug' },
  ];
  fs.writeFileSync(file, items.map(line).join('\n') + '\n');
  const evalDir = tmp('evals');
  arm([...items, PROBE_GLOB, { id: 'x', intent: 'q', lang: 'en', prompt: 'A prompt no file has.', expect: 'none' }], { pluginDir: tmp('plug'), evalDir });
  const transcript = (prompt, calls) => {
    const f = path.join(tmp('tr'), 'transcript.jsonl');
    fs.writeFileSync(f, [line({ type: 'USER_INPUT', content: `<USER_REQUEST>\n${prompt}\n</USER_REQUEST>` }), line({ type: 'PLANNER_RESPONSE', content: calls ? '' : 'GLOB-PROBE-OK', tool_calls: calls || [] })].join('\n') + '\n');
    return f;
  };
  const q = JSON.parse(fs.readFileSync(path.join(evalDir, 'queue.json'), 'utf8'));
  q.done = [
    { ...q.pending[0], conversationId: 'c1', transcriptPath: transcript(items[0].prompt, []), modelName: 'm', reset: true },
    { ...q.pending[1], conversationId: 'c2', transcriptPath: transcript(items[1].prompt, [{ name: 'view_file', args: { AbsolutePath: 'C:/p/skills/bk-debug/SKILL.md' } }]), modelName: 'm', reset: true },
    { ...q.pending[2], conversationId: 'c3', transcriptPath: transcript(PROBE_GLOB.prompt, null), modelName: 'm', reset: true },
    { ...q.pending[3], conversationId: 'c4', transcriptPath: transcript('A prompt no file has.', []), modelName: 'm', reset: true },
    // A ledger entry written before the neutral queue carries its own labels.
    { id: 'acc-01', intent: 'question', lang: 'en', prompt: 'Old prompt', expect: 'none', conversationId: 'c5', transcriptPath: transcript('Old prompt', []), modelName: 'm', reset: true },
  ];
  q.pending = [];
  fs.writeFileSync(path.join(evalDir, 'queue.json'), JSON.stringify(q));
  const s = score({ evalDir, promptFiles: [file] });
  const by = Object.fromEntries(s.results.map((r) => [r.id, r]));
  assert.deepEqual([by['map-neg-01'].intent, by['map-neg-01'].expect, by['map-neg-01'].got, by['map-neg-01'].queueId], ['map', 'none', 'none', 'p01']);
  assert.deepEqual([by['bug-en-01'].expect, by['bug-en-01'].got], ['bk-debug', 'bk-debug']);
  assert.deepEqual([by['probe-glob'].expect, by['probe-glob'].got], ['GLOB-PROBE-OK', 'GLOB-PROBE-OK']);
  assert.equal(by.p04.unknown, true, 'a prompt found in no file is reported, not guessed');
  assert.equal(by.p04.expect, '?');
  assert.deepEqual([by['acc-01'].expect, by['acc-01'].got], ['none', 'none']);

  const seen = new Map();
  const actDir = path.join(REPO, 'evals', 'activation');
  for (const f of fs.readdirSync(actDir).filter((n) => n.endsWith('.jsonl'))) {
    for (const l of fs.readFileSync(path.join(actDir, f), 'utf8').split('\n').filter((x) => x.trim())) {
      const p = JSON.parse(l);
      assert.ok(!seen.has(p.prompt), `${f}:${p.id} repeats the prompt of ${seen.get(p.prompt)}`);
      seen.set(p.prompt, `${f}:${p.id}`);
    }
  }
  assert.ok(seen.size >= 90);
});

// The stage Antigravity works in: a copy of the fixture away from the kit's checkout, the home folder and any
// memory file, whose files, git history and marker say nothing about a measurement. The copy for Claude Code is
// untouched (its README stays, so its baseline holds).
test('the Antigravity stage sits apart from the kit and its files say nothing about a measurement', () => {
  const base = tmp('agstage');
  const dir = path.join(base, 'apps', 'sample-app');
  const st = stage({ root: REPO, dir, forbidden: [] });
  assert.equal(st.cwd, dir);
  const git = (args) => spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === '.git') continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else files.push(p); } };
  walk(dir);
  for (const f of files) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), TELLS, `${path.relative(dir, f)} tells the model it is measured`);
  for (const f of files) assert.doesNotMatch(path.relative(dir, f), TELLS);
  const src = path.join(REPO, 'evals', 'fixtures', 'sample-app');
  assert.equal(fs.readFileSync(path.join(dir, 'src', 'app', 'invoices', 'page.tsx'), 'utf8'), fs.readFileSync(path.join(src, 'src', 'app', 'invoices', 'page.tsx'), 'utf8'), 'code files are the fixture\'s own');
  assert.match(fs.readFileSync(path.join(src, 'README.md'), 'utf8'), /eval fixture/, 'the fixture README of the Claude Code runs is unchanged');
  // The marker lives inside .git and holds the commit to reset to; no tag, no telling author or message.
  assert.equal(fs.readFileSync(path.join(dir, driver.STAGE_MARKER), 'utf8').trim(), git(['rev-parse', 'HEAD']).stdout.trim());
  assert.equal(git(['status', '--porcelain']).stdout, '');
  assert.equal(git(['tag']).stdout, '');
  assert.doesNotMatch(git(['log', '--format=%an %ae %s']).stdout, TELLS);
  // The driver resets it; a workspace with only the old root marker is not a stage.
  fs.writeFileSync(path.join(dir, 'src', 'lib', 'http.ts'), 'edited by a conversation');
  fs.writeFileSync(path.join(dir, 'stray.txt'), 'stray');
  assert.equal(driver.resetFixture(dir), true);
  assert.equal(fs.readFileSync(path.join(dir, 'src', 'lib', 'http.ts'), 'utf8'), fs.readFileSync(path.join(src, 'src', 'lib', 'http.ts'), 'utf8'));
  assert.ok(!fs.existsSync(path.join(dir, 'stray.txt')));
  const old = tmp('oldmarker');
  fs.writeFileSync(path.join(old, '.bearingkit-fixture'), 'x');
  assert.equal(driver.resetFixture(old), false);
  assert.equal(driver.isStage(old), false);
  assert.equal(driver.isStage(dir), true);
  // Staging again over the same folder works (a conversation may hold it open) and yields the same tree.
  const again = stage({ root: REPO, dir, forbidden: [] });
  assert.equal(again.cwd, dir);
  assert.equal(git(['status', '--porcelain']).stdout, '');
});

// Since per-project activation the copy the host loads is the store, not the global copy under ~/.gemini. Arming
// the wrong one leaves the driver hook where nothing reads it and the run silently measures no injection, so the
// default follows the same order as doctor and status: store, then global copy.
test('arm and disarm aim at the store when it is installed, and at the global copy when it is not', () => {
  const home = tmp('aghome-arm');
  const store = path.join(home, '.bearingkit', 'antigravity', 'plugins', 'bearingkit');
  const global = path.join(home, '.gemini', 'config', 'plugins', 'bearingkit');
  const evalDir = tmp('agqueue');
  const item = [{ id: 'x', prompt: 'a question of no consequence' }];
  // Neither installed: the error names the store and the command that installs it.
  assert.throws(() => arm(item, { home, evalDir }), /\.bearingkit[\\/]antigravity/);
  assert.throws(() => arm(item, { home, evalDir }), /install --host antigravity/);
  for (const dir of [global, store]) { fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(path.join(dir, '.bearingkit-copy'), 'x'); }
  assert.equal(arm(item, { home, evalDir }).hooksFile, path.join(store, 'hooks.json'), 'the store wins while it is there');
  assert.equal(disarm({ home }).hooksFile, path.join(store, 'hooks.json'));
  fs.rmSync(store, { recursive: true, force: true });
  assert.equal(arm(item, { home, evalDir }).hooksFile, path.join(global, 'hooks.json'), 'without a store, the global copy');
  assert.equal(disarm({ home }).hooksFile, path.join(global, 'hooks.json'));
  // A directory at the store path that the kit did not make is not a kit copy: arming it would hide the hook
  // where the host never reads it. An explicit --plugin-dir stays the operator's word and is not second-guessed.
  fs.rmSync(global, { recursive: true, force: true });
  fs.mkdirSync(store, { recursive: true });
  assert.throws(() => arm(item, { home, evalDir }), /install --host antigravity/);
  assert.equal(arm(item, { pluginDir: store, evalDir }).hooksFile, path.join(store, 'hooks.json'), 'named by hand, it is armed');
  // And disarming leaves the copy as the installer wrote it: no empty hooks.json, no empty hooks folder,
  // so the next doctor comparison is about the kit and not about leftovers of a measurement.
  disarm({ pluginDir: store });
  assert.equal(fs.existsSync(path.join(store, 'hooks.json')), false, 'an emptied hooks.json goes');
  assert.equal(fs.existsSync(path.join(store, 'hooks')), false, 'and the folder made for the driver');
  // An already emptied hooks.json (a disarm that ran twice, or one aimed elsewhere first) is a leftover too.
  fs.writeFileSync(path.join(store, 'hooks.json'), '{}\n');
  disarm({ pluginDir: store });
  assert.equal(fs.existsSync(path.join(store, 'hooks.json')), false, 'a hooks.json holding nothing goes as well');
});

// On 2026-09-20 a conversation that had already routed correctly walked from the store it had opened a skill in
// (`~/.bearingkit/antigravity/plugins/bearingkit`) up to `~/.bearingkit` and found the eval queue beside it, then the
// driver log, another conversation's transcript and the kit checkout. The decision was already made, so the scorer
// did not flag it, but the queue must not be a sibling of the store at all: it moves out of the kit's home, and the
// three places that name it — the scorer, the driver copied into the store, and the drive script — must agree.
test('the eval queue lives outside the kit home, and every part of the harness agrees where', () => {
  const home = 'C:\\Users\\somebody';
  const evals = require('../scripts/antigravity-evals.cjs');
  const driver = require('../scripts/antigravity/eval-driver.cjs');
  const drive = fs.readFileSync(path.join(REPO, 'scripts', 'antigravity', 'drive.cjs'), 'utf8');
  const kitHome = path.join(os.homedir(), '.bearingkit');
  for (const [what, dir] of [['scorer', evals.DEFAULT_EVAL_DIR], ['driver', driver.EVAL_DIR]]) {
    const rel = path.relative(kitHome, dir);
    assert.ok(rel.startsWith('..') || path.isAbsolute(rel), `${what} keeps the queue inside ${kitHome}, one listing away from the store`);
  }
  assert.equal(evals.DEFAULT_EVAL_DIR, driver.EVAL_DIR, 'the scorer and the driver read the same queue');
  assert.match(drive, /EVAL_DIR|evalDir|relayDir/, 'the drive script takes the queue path from the same place, not its own literal');
  assert.doesNotMatch(drive, /'\.bearingkit', 'antigravity-eval'/, 'no second literal of the old location');
  assert.equal(home.length > 0, true);
});

// The driver resets the stage with `git reset --hard` and `git clean -fdx` before every prompt, so a declaration
// written into the project afterwards would be gone after the first one. An activated stage therefore carries the
// host's own file in the stage's first commit; the kit itself still puts nothing of its own in the project.
test('an activated stage carries the declaration in its own commit, so the driver reset keeps it', () => {
  const home = tmp('aghome');
  const dir = path.join(tmp('agact'), 'apps', 'sample-app');
  const st = stage({ root: REPO, dir, forbidden: [], activate: true, home });
  const file = path.join(dir, '.agents', 'plugins.json');
  assert.equal(st.activated, file, 'the stage reports the file it declared the store in');
  const store = path.join(home, '.bearingkit', 'antigravity', 'plugins', 'bearingkit').replace(/\\/g, '/');
  assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')).entries, [{ path: store }]);
  const git = (args) => spawnSync('git', args, { cwd: dir, encoding: 'utf8' });
  assert.equal(git(['status', '--porcelain']).stdout, '', 'the declaration is committed, not left untracked');
  assert.match(git(['ls-files', '.agents/plugins.json']).stdout, /plugins\.json/);
  // What the driver does before every prompt: the declaration comes back, a conversation's leftovers do not.
  fs.rmSync(file);
  fs.writeFileSync(path.join(dir, 'stray.txt'), 'stray');
  assert.equal(driver.resetFixture(dir), true);
  assert.ok(fs.existsSync(file), 'the declaration survives the reset');
  assert.ok(!fs.existsSync(path.join(dir, 'stray.txt')));
  // Only the host's own file names the kit (the v2 §9 exception); every other file still says nothing.
  const files = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === '.git') continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else files.push(p); } };
  walk(dir);
  for (const f of files.filter((x) => x !== file)) assert.doesNotMatch(fs.readFileSync(f, 'utf8'), TELLS, `${path.relative(dir, f)} tells the model it is measured`);
  // The declaration names a store that has to exist: a stage pointed at a store nobody installed would still
  // load the kit if the old global copy were lying around, and the probe would prove nothing. The stage reports it.
  assert.equal(st.declares, path.join(home, ".bearingkit", "antigravity", "plugins", "bearingkit"), "the store it declared, as a path");
  assert.equal(st.storeMissing, true, 'no store was installed under this home');
  fs.mkdirSync(path.join(home, '.bearingkit', 'antigravity', 'plugins', 'bearingkit'), { recursive: true });
  fs.writeFileSync(path.join(home, '.bearingkit', 'antigravity', 'plugins', 'bearingkit', '.bearingkit-copy'), 'x');
  assert.equal(stage({ root: REPO, dir, forbidden: [], activate: true, home }).storeMissing, false, 'with the store installed there is nothing to warn about');
  // Without the option the stage declares nothing at all.
  const plain = path.join(tmp('agplain'), 'apps', 'sample-app');
  stage({ root: REPO, dir: plain, forbidden: [] });
  assert.ok(!fs.existsSync(path.join(plain, '.agents', 'plugins.json')));
});

test('the Antigravity stage refuses a folder near the kit, under the home folder, below a memory file, or holding other work', () => {
  const nearKit = path.join(path.dirname(REPO), `bk-refused-${process.pid}`);
  assert.throws(() => stage({ root: REPO, dir: path.join(nearKit, 'sample-app') }), /beside the kit|under/);
  assert.ok(!fs.existsSync(nearKit), 'nothing is written before the refusal');
  const underHome = path.join(os.homedir(), `bk-refused-${process.pid}`);
  assert.throws(() => stage({ root: REPO, dir: path.join(underHome, 'sample-app') }), /home|under/);
  assert.ok(!fs.existsSync(underHome));
  const mem = tmp('agmem');
  fs.writeFileSync(path.join(mem, 'AGENTS.md'), 'instructions for every agent below');
  assert.throws(() => stage({ root: REPO, dir: path.join(mem, 'apps', 'sample-app'), forbidden: [] }), /AGENTS\.md/);
  assert.ok(!fs.existsSync(path.join(mem, 'apps')));
  // Staging replaces the folder, so it must be one this command made (or an empty one): a mistyped --stage-dir
  // pointing at real work is refused and left as it was.
  const work = tmp('agwork');
  fs.writeFileSync(path.join(work, 'notes.txt'), 'real work');
  assert.throws(() => stage({ root: REPO, dir: work, forbidden: [] }), /not a stage/);
  assert.equal(fs.readFileSync(path.join(work, 'notes.txt'), 'utf8'), 'real work');
  const empty = tmp('agempty');
  assert.equal(stage({ root: REPO, dir: empty, forbidden: [] }).cwd, empty, 'an empty folder may become a stage');
});

test('driver end to end: injects the next prompt, advances the queue, records the ledger, resets only a stage', () => {
  const evalDir = tmp('eval');
  const ws = path.join(tmp('ws'), 'apps', 'sample-app');
  stage({ root: REPO, dir: ws, forbidden: [] });
  fs.writeFileSync(path.join(ws, 'README.md'), 'edited by a session');
  fs.writeFileSync(path.join(ws, 'junk.txt'), 'stray');
  const transcript = path.join(tmp('t'), 'transcript.jsonl');
  fs.writeFileSync(transcript, line({ type: 'USER_INPUT', content: '<USER_REQUEST>\nbk eval\n</USER_REQUEST>' }) + '\n');
  fs.writeFileSync(path.join(evalDir, 'queue.json'), JSON.stringify({ trigger: 'bk eval', pending: [{ id: 'p01', prompt: 'Add CSV export to the invoices page.' }, { id: 'p02', prompt: 'second' }], done: [] }));
  const payload = JSON.stringify({ conversationId: 'c-1', invocationNum: 1, transcriptPath: transcript, workspacePaths: [ws], modelName: 'auto' });
  const r = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'antigravity', 'eval-driver.cjs')], { input: payload, encoding: 'utf8', env: { ...process.env, BEARINGKIT_EVAL_DIR: evalDir } });
  assert.equal(r.status, 0, r.stderr);
  const out = JSON.parse(r.stdout);
  assert.equal(out.injectSteps.length, 2);
  assert.equal(out.injectSteps[0].ephemeralMessage, driver.NOTE);
  assert.deepEqual(out.injectSteps[1], { userMessage: 'Add CSV export to the invoices page.' });
  const q = JSON.parse(fs.readFileSync(path.join(evalDir, 'queue.json'), 'utf8'));
  assert.equal(q.pending.length, 1);
  assert.equal(q.done[0].id, 'p01');
  assert.equal(q.done[0].prompt, 'Add CSV export to the invoices page.', 'the ledger carries the prompt');
  assert.equal(q.done[0].conversationId, 'c-1');
  assert.equal(q.done[0].reset, true);
  assert.doesNotMatch(fs.readFileSync(path.join(ws, 'README.md'), 'utf8'), /edited by a session/, 'session edit undone');
  assert.ok(!fs.existsSync(path.join(ws, 'junk.txt')), 'stray file removed');
  // An unmarked workspace is never reset, and the opening line typed there is ignored.
  const plain = tmp('plain');
  fs.writeFileSync(path.join(plain, 'keep.txt'), 'keep');
  assert.equal(driver.resetFixture(plain), false);
  assert.ok(fs.existsSync(path.join(plain, 'keep.txt')));
  const elsewhere = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'antigravity', 'eval-driver.cjs')], { input: JSON.stringify({ conversationId: 'c-2', invocationNum: 1, transcriptPath: transcript, workspacePaths: [plain] }), encoding: 'utf8', env: { ...process.env, BEARINGKIT_EVAL_DIR: evalDir } });
  assert.equal(elsewhere.stdout, '{}');
  // A second invocation in the same conversation does nothing.
  const r2 = spawnSync(process.execPath, [path.join(REPO, 'scripts', 'antigravity', 'eval-driver.cjs')], { input: JSON.stringify({ conversationId: 'c-1', invocationNum: 2, transcriptPath: transcript, workspacePaths: [ws] }), encoding: 'utf8', env: { ...process.env, BEARINGKIT_EVAL_DIR: evalDir } });
  assert.equal(r2.stdout, '{}');
});

test('arm installs the driver hook beside the kit hook, score reads transcripts, disarm removes the hook', () => {
  const plugin = tmp('plugin');
  const evalDir = tmp('eval2');
  const file = path.join(tmp('p2'), 'set.jsonl');
  const item = { id: 'x', intent: 'bug', lang: 'en', prompt: 'It crashes', expect: 'bk-debug' };
  fs.writeFileSync(file, line(item) + '\n');
  fs.writeFileSync(path.join(plugin, 'hooks.json'), JSON.stringify({ bearingkit: { PreInvocation: [{ command: 'node hooks/stack-profile.cjs --event PreInvocation' }] }, 'bearingkit-probe': { PreInvocation: [] } }));
  const a = arm([item], { pluginDir: plugin, evalDir });
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
  const s = score({ evalDir, promptFiles: [file] });
  assert.equal(s.results.length, 1);
  assert.equal(s.results[0].got, 'bk-debug');
  assert.equal(s.results[0].expect, 'bk-debug');
  assert.equal(s.results[0].id, 'x');
  disarm({ pluginDir: plugin });
  const after = JSON.parse(fs.readFileSync(path.join(plugin, 'hooks.json'), 'utf8'));
  assert.ok(after.bearingkit && !after['bearingkit-eval']);
  assert.ok(!fs.existsSync(path.join(plugin, 'hooks', 'eval-driver.cjs')));
});

// On 2026-09-23 the driver moved on from two research conversations while each waited for a read_url_content result:
// the last step was a DONE planner step carrying the tool call, and a page fetch takes longer than the 12 s quiet
// window. The conversation it left behind never finished; the one after it, last in the queue, did.
test('the driver does not call a reply settled while a planner step that called a tool waits for its result', () => {
  const { transcriptSettled } = require('../scripts/antigravity/drive.cjs');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-settle-'));
  const file = path.join(dir, 'transcript.jsonl');
  const step = (o) => JSON.stringify(o);
  fs.writeFileSync(file, [
    step({ type: 'USER_INPUT', status: 'DONE' }),
    step({ type: 'PLANNER_RESPONSE', status: 'DONE', tool_calls: [{ name: 'read_url_content', args: { Url: 'https://example.org' } }] }),
  ].join('\n'));
  assert.equal(transcriptSettled(file).settled, false, 'a pending tool call is not the end of the reply');
  fs.appendFileSync(file, '\n' + [
    step({ type: 'GENERIC', status: 'DONE' }),
    step({ type: 'PLANNER_RESPONSE', status: 'DONE', tool_calls: [] }),
  ].join('\n'));
  assert.equal(transcriptSettled(file).settled, true, 'a final planner step with no tool call is');
  fs.appendFileSync(file, '\n' + step({ type: 'PLANNER_RESPONSE', status: 'DONE' }));
  assert.equal(transcriptSettled(file).settled, true, 'a planner step without the field is a reply too');
});
