'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { parseStream, loadPrompts, summarize, checklist } = require('../scripts/evals.cjs');

const streamWithSkill = [
  JSON.stringify({ type: 'system', subtype: 'init' }),
  JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'Reviewing.' }, { type: 'tool_use', name: 'Skill', input: { skill: 'bk-review' } }] } }),
  JSON.stringify({ type: 'result', subtype: 'success' }),
].join('\n');

const streamNamespaced = JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Skill', input: { command: '/bearingkit:bk-ship' } }] } });
const streamNoSkill = [JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'The retry decorator retries three times.' }] } }), 'not json', JSON.stringify({ type: 'result' })].join('\n');

test('parseStream finds the first Skill invocation', () => {
  assert.equal(parseStream(streamWithSkill), 'bk-review');
  assert.equal(parseStream(streamNamespaced), 'bk-ship');
});

test('parseStream returns none without a Skill call', () => {
  assert.equal(parseStream(streamNoSkill), 'none');
  assert.equal(parseStream(''), 'none');
});

const PHASE1 = ['question', 'small', 'feature', 'bug', 'review', 'ship'];
// Spec §11 extends the set by "two positives and one negative per new skill"; each skill intent is named after its
// skill, so `plan` holds the prompts that must reach bk-plan.
const SKILL_INTENTS = ['plan', 'close', 'audit', 'next', 'test', 'design', 'setup', 'ops', 'db', 'map', 'research'];
const promptSet = () => loadPrompts(path.join(__dirname, '..', 'evals', 'activation', 'phase-1.jsonl'));

test('the set keeps Phase 1 at sixty and adds three per skill intent, with unique ids', () => {
  const prompts = promptSet();
  assert.equal(prompts.length, 93);
  assert.equal(new Set(prompts.map((p) => p.id)).size, prompts.length, 'ids are unique');

  // Phase 1's sixty are the baseline every later run is compared against, so their shape may not drift.
  assert.equal(prompts.filter((p) => PHASE1.includes(p.intent)).length, 60);
  for (const i of PHASE1) {
    const group = prompts.filter((p) => p.intent === i);
    assert.equal(group.length, 10, i);
    assert.equal(group.filter((p) => p.id.includes('-neg-')).length, 2, `${i} negatives`);
    assert.equal(group.filter((p) => p.lang === 'vi' && !p.id.includes('-neg-')).length, 4, `${i} vietnamese positives`);
  }

  for (const i of SKILL_INTENTS) {
    const group = prompts.filter((p) => p.intent === i);
    assert.equal(group.length, 3, i);
    const positives = group.filter((p) => !p.id.includes('-neg-'));
    const negatives = group.filter((p) => p.id.includes('-neg-'));
    assert.equal(positives.length, 2, `${i} positives`);
    assert.equal(negatives.length, 1, `${i} negative`);
    assert.deepEqual(positives.map((p) => p.lang).sort(), ['en', 'vi'], `${i}: one positive per language`);
    assert.ok(positives.every((p) => p.expect === `bk-${i}`), `${i}: positives name bk-${i}`);
    assert.ok(!negatives[0].expect.split('|').includes(`bk-${i}`), `${i}: the negative must not expect bk-${i}`);
  }

  const expects = new Set(prompts.flatMap((p) => p.expect.split('|')));
  for (const e of expects) assert.ok(e === 'none' || /^bk-[a-z]+$/.test(e), e);
});

// A prompt that names a file the fixture does not have sends the model hunting, and a hunt can end in a skill call
// the run then scores as a false activation — the "fixture gap behind sm-en-04" of the Phase 1 gate was this. Phase 1
// is frozen as the baseline and carries one known instance: q-en-01 names src/http/retry.ts, which the fixture never
// had (it has src/lib/http.ts). So the check covers the prompts added after Phase 1, which is where every future
// skill's prompts land too.
test('prompts outside Phase 1 name only files the fixture actually has', () => {
  const fs = require('node:fs');
  const fixture = path.join(__dirname, '..', 'evals', 'fixtures', 'sample-app');
  let checked = 0;
  for (const p of promptSet().filter((x) => SKILL_INTENTS.includes(x.intent))) {
    for (const m of p.prompt.matchAll(/(?:src|tests)\/[A-Za-z0-9_/-]+\.[A-Za-z]+/g)) {
      checked++;
      assert.ok(fs.existsSync(path.join(fixture, m[0])), `${p.id} names ${m[0]}, which the fixture does not have`);
    }
  }
  assert.ok(checked >= 3, 'the check means nothing unless some prompts name files; they stopped doing so');
});

// The gap this closes: for three days the set measured five skills while ten were installed, and nothing said so.
// bk-plan, bk-close, bk-audit and bk-next had no prompt at all, so a routing regression in any of them was invisible.
// A skill that ships without prompts now fails the suite instead of failing silently in a gate run; it is what
// caught bk-design half-built on 2026-09-14, before its prompts existed.
test('every task skill that exists has at least two positive prompts', () => {
  const fs = require('node:fs');
  const skills = fs.readdirSync(path.join(__dirname, '..', 'skills'))
    .filter((n) => n !== 'bk-protocol' && fs.existsSync(path.join(__dirname, '..', 'skills', n, 'SKILL.md')));
  const prompts = promptSet();
  for (const skill of skills) {
    const positives = prompts.filter((p) => !p.id.includes('-neg-') && p.expect.split('|').includes(skill));
    assert.ok(positives.length >= 2, `${skill}: ${positives.length} positive prompts, needs at least two`);
  }
});

// A label naming a skill the kit does not have can never pass, and nothing said so: a prompt set can run ahead of
// the catalog by a whole release. Every kit skill a label names must exist; "none" is the only other value.
test('every skill a prompt expects exists in skills/', () => {
  const fs = require('node:fs');
  for (const p of promptSet()) {
    for (const alt of p.expect.split('|')) {
      if (alt === 'none') continue;
      assert.ok(fs.existsSync(path.join(__dirname, '..', 'skills', alt, 'SKILL.md')), `${p.id} expects ${alt}, which has no skills/${alt}/SKILL.md`);
    }
  }
});

// A prompt on the seam between two skills accepts either route, so it cannot join a skill's intent without breaking
// the three-per-intent shape every earlier comparison of the 90-prompt set depends on (D5 question 28). It lives in
// its own file, run with --file; "none" is not a label there, since the request belongs to one of the two skills.
test('boundary prompts have ids of their own and name at least two skills, each of which exists', () => {
  const fs = require('node:fs');
  const dir = path.join(__dirname, '..', 'evals', 'activation');
  const prompts = loadPrompts(path.join(dir, 'boundaries.jsonl'));
  assert.ok(prompts.length >= 2, `${prompts.length} boundary prompts`);
  const ids = prompts.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length, 'ids are unique in the file');
  const elsewhere = new Set([...promptSet(), ...loadPrompts(path.join(dir, 'acceptance.jsonl'))].map((p) => p.id));
  for (const id of ids) assert.ok(!elsewhere.has(id), `${id} is already an id in another prompt file`);
  for (const p of prompts) {
    const alts = p.expect.split('|');
    assert.ok(new Set(alts).size >= 2, `${p.id} names ${new Set(alts).size} skill(s); a boundary names two`);
    for (const alt of alts) {
      assert.ok(fs.existsSync(path.join(__dirname, '..', 'skills', alt, 'SKILL.md')), `${p.id} expects ${alt}, which has no skills/${alt}/SKILL.md`);
    }
  }
});

test('expect alternatives: either route passes, and a "none" alternative counts a false activation only when both miss', () => {
  const { passes } = require('../scripts/evals.cjs');
  assert.equal(passes({ expect: 'bk-spec|none', got: 'none' }), true);
  assert.equal(passes({ expect: 'bk-spec|none', got: 'bk-spec' }), true);
  assert.equal(passes({ expect: 'bk-spec|none', got: 'bk-ship' }), false);
  const s = summarize([
    { id: 'ship-neg-02', intent: 'ship', expect: 'bk-spec|none', got: 'bk-spec' },
    { id: 'ship-neg-03', intent: 'ship', expect: 'bk-spec|none', got: 'bk-ship' },
  ]);
  assert.equal(s.pass, 1);
  assert.equal(s.falseActivations, 1);
  assert.equal(s.byIntent.ship.positives, 0);
});

test('summarize counts passes, positives and false activations', () => {
  const s = summarize([
    { id: 'q-en-01', intent: 'question', expect: 'none', got: 'none' },
    { id: 'q-en-02', intent: 'question', expect: 'none', got: 'bk-spec' },
    { id: 'bug-en-01', intent: 'bug', expect: 'bk-debug', got: 'bk-debug' },
    { id: 'bug-neg-01', intent: 'bug', expect: 'bk-review', got: 'bk-debug' },
  ]);
  assert.equal(s.total, 4);
  assert.equal(s.pass, 2);
  assert.equal(s.falseActivations, 1);
  assert.equal(s.byIntent.bug.positives, 1);
  assert.equal(s.byIntent.bug.positivesPass, 1);
});

// A session that ends in one turn with no tool call is marked no-action: the prompt may not have been taken as a
// request, or a question may have been answered from knowledge alone, and only the stream tells which. Either way no
// skill was invoked, so it is never a false activation; on 2026-09-17 a diagnostic question answered without a tool
// was counted as one.
test('a no-action session is reported on its own and never counted as a false activation', () => {
  const { table } = require('../scripts/evals.cjs');
  const results = [
    { id: 'probe-01', intent: 'question', expect: 'none', got: 'no-action' },
    { id: 'q-en-02', intent: 'question', expect: 'none', got: 'bk-spec' },
    { id: 'bug-en-03', intent: 'bug', expect: 'bk-debug', got: 'no-action' },
  ];
  const s = summarize(results);
  assert.equal(s.falseActivations, 1, 'only the session that invoked a skill');
  assert.equal(s.noAction, 2);
  assert.equal(s.pass, 0, 'no-action is not a pass either: someone has to read the stream');
  assert.match(table(results, s, 'claude', 'meta'), /no-action sessions \(read their streams\): 2/);
});

test('equivalents make a baseline run meaningful', () => {
  const { passes } = require('../scripts/evals.cjs');
  const eq = JSON.parse(require('node:fs').readFileSync(path.join(__dirname, '..', 'evals', 'activation', 'equivalents-superpowers.json'), 'utf8'));
  assert.equal(passes({ expect: 'bk-spec', got: 'brainstorming' }, eq), true);
  assert.equal(passes({ expect: 'bk-spec', got: 'brainstorming' }, null), false);
  assert.equal(passes({ expect: 'none', got: 'brainstorming' }, eq), false, 'a negative never passes through equivalence');
  assert.equal(passes({ expect: 'bk-debug', got: 'bk-debug' }, eq), true);
  const s = summarize([{ id: 'feat-en-01', intent: 'feature', expect: 'bk-spec', got: 'brainstorming' }], eq);
  assert.equal(s.pass, 1);
});

// A label with alternatives (bk-spec|none) is one cell. Written raw, its pipe splits the cell in two, so the table
// renders an extra column and anything that reads the table back shifts got and pass by one (seen 2026-09-16: a
// scorer read the 57/60 baseline as 56/60).
test('the result table escapes the pipe inside an expect label', () => {
  const { table } = require('../scripts/evals.cjs');
  const results = [{ id: 'ship-neg-02', intent: 'ship', expect: 'bk-spec|none', got: 'none' }];
  const text = table(results, summarize(results), 'claude', 'meta');
  const row = text.split('\n').find((l) => l.startsWith('| ship-neg-02 '));
  assert.equal(row, '| ship-neg-02 | ship | bk-spec\\|none | none | yes |');
  assert.equal(row.split(/(?<!\\)\|/).length - 2, 5, 'five cells, not six');
});

test('checklist renders one row per prompt', () => {
  const text = checklist([{ id: 'x', intent: 'bug', prompt: 'a | b', expect: 'bk-debug' }]);
  assert.match(text, /\| x \| bug \| a \\\| b \| bk-debug \|  \|/);
  const alt = checklist([{ id: 'y', intent: 'ship', prompt: 'Deploy', expect: 'bk-spec|none' }]);
  assert.ok(alt.includes('| y | ship | Deploy | bk-spec\\|none |  |'), 'the expect cell escapes its pipe too');
});

// From 2026-09-17 the host syncs the account's skills and plugins into the isolated profile, so the listing of a run
// is read from each stream's init event and written into the result table, where a reader sees it without the streams.
test('parseInit reads the host version and the skills listing from the init event', () => {
  const { parseInit } = require('../scripts/evals.cjs');
  const init = JSON.stringify({ type: 'system', subtype: 'init', claude_code_version: '2.1.274', skills: ['debug', 'bearingkit:bk-spec', 'anthropic-skills:pdf', 'bearingkit:bk-build'] });
  assert.deepEqual(parseInit('noise\n' + init + '\n' + JSON.stringify({ type: 'result' })), { version: '2.1.274', total: 4, kit: 2, others: ['debug', 'anthropic-skills:pdf'] });
  assert.equal(parseInit(streamNoSkill), null, 'a stream without an init event gives nothing');
});

test('listingNote counts sessions per listing and names what is not the kit', () => {
  const { listingNote } = require('../scripts/evals.cjs');
  const a = { version: '2.1.274', total: 43, kit: 12, others: ['debug', 'slides'] };
  const b = { version: '2.1.274', total: 41, kit: 12, others: ['debug'] };
  const note = listingNote([a, a, b, null]);
  assert.match(note, /43 skills \(12 from the kit\) in 2 sessions/);
  assert.match(note, /41 skills \(12 from the kit\) in 1 session\b/);
  assert.match(note, /no init event in 1 session/);
  assert.match(note, /host 2\.1\.274/);
  assert.match(note, /not from the kit: debug, slides/, 'the names are the union over all sessions, sorted');
  assert.equal(listingNote([]), 'Skills in the listing: no session ran');
});

test('parseQuota reads the five-hour window and its own reset time, not the event-level one', () => {
  const { parseQuota } = require('../scripts/evals.cjs');
  const ev = JSON.stringify({ type: 'rate_limit_event', rate_limit_info: { status: 'allowed', resetsAt: 2, rateLimitType: 'seven_day', unifiedWindows: { five_hour: { utilization: 0.73, resetsAt: 1 }, seven_day: { utilization: 0.32, resetsAt: 2 } } } });
  const q = parseQuota('junk\n' + ev);
  assert.equal(q.fiveHour, 0.73);
  assert.equal(q.sevenDay, 0.32);
  assert.equal(q.resetsAt, 1);
  assert.equal(q.sevenDayResetsAt, 2, 'a seven-day stop must print the seven-day reset, not the five-hour one');
  assert.equal(parseQuota('nothing here'), null);
});

// The runner stops itself before it exhausts the owner's account. Both windows are real limits and the seven-day one
// is the expensive one to hit: it was the guard that did not exist on 2026-09-15, when a run was about to start with
// the seven-day window already at 89% and only the five-hour ceiling being checked.
test('the run stops on either window, not only the five-hour one', () => {
  const { quotaStop } = require('../scripts/evals.cjs');
  const limits = { fiveHour: 0.9, sevenDay: 0.95 };
  assert.equal(quotaStop(null, limits), null, 'no reading yet is not a reason to stop');
  assert.equal(quotaStop({ fiveHour: null, sevenDay: null }, limits), null, 'a reading with no numbers is not a reason to stop');
  assert.equal(quotaStop({ fiveHour: 0.4, sevenDay: 0.5 }, limits), null, 'below both ceilings the run continues');
  assert.match(quotaStop({ fiveHour: 0.91, sevenDay: 0.5 }, limits).window, /five-hour/);
  assert.match(quotaStop({ fiveHour: 0.4, sevenDay: 0.96 }, limits).window, /seven-day/);
  assert.equal(quotaStop({ fiveHour: 0.4, sevenDay: 0.95 }, limits).window, 'seven-day', 'the ceiling is inclusive');
});

// Since the manifest ships the plugin disabled (D5 question 29: on only where the owner says), a profile that does
// not enable the inline plugin loads none of the kit, and the run would measure an empty kit and call it a routing
// result. Measured on 2026-09-20: `--plugin-dir` with no `bearingkit@inline` entry listed 0 kit skills, and 15 with
// it. So the runner stops before any session, as it does for a missing --config-dir.
test('a profile that does not enable the inline plugin stops the run before any session', () => {
  const { preflight } = require('../scripts/evals.cjs');
  const fs = require('node:fs');
  const os = require('node:os');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-prof-'));
  const root = path.join(__dirname, '..');
  const stop = preflight({ _: [], 'config-dir': dir, 'plugin-dir': root });
  assert.equal(stop.exit, 2);
  assert.match(stop.message, /bearingkit@inline/);
  assert.match(stop.message, /enabledPlugins/);
  fs.writeFileSync(path.join(dir, 'settings.json'), JSON.stringify({ enabledPlugins: { 'bearingkit@inline': true } }));
  assert.equal(preflight({ _: [], 'config-dir': dir, 'plugin-dir': root }), null, 'with the entry the run goes ahead');
  // A run of the bare host measures the host, so it needs no plugin entry; and the daily profile is the owner's.
  fs.writeFileSync(path.join(dir, 'settings.json'), '{}');
  assert.equal(preflight({ _: [], 'config-dir': dir, 'plugin-dir': 'none' }), null);
  assert.equal(preflight({ _: [], host: 'antigravity' }), null);
});

// One run may need prompts from several files (the acceptance pair, a Phase 1 negative, the boundary set), in the
// order that puts the important ones first; an id asked for and found in no file stops the run.
test('--file takes several files, and --id sets which prompts run and in what order', () => {
  const { selectPrompts } = require('../scripts/evals.cjs');
  const dir = path.join(__dirname, '..', 'evals', 'activation');
  const files = ['acceptance.jsonl', 'phase-1.jsonl', 'boundaries.jsonl'].map((f) => path.join(dir, f)).join(',');
  const picked = selectPrompts({ file: files, id: 'acc-01,map-neg-01,acc-02,bnd-vi-01' });
  assert.deepEqual(picked.map((p) => p.id), ['acc-01', 'map-neg-01', 'acc-02', 'bnd-vi-01']);
  assert.throws(() => selectPrompts({ file: files, id: 'acc-01,no-such-id' }), /no-such-id/);
  assert.throws(() => selectPrompts({ file: [files, path.join(dir, 'acceptance.jsonl')].join(',') }), /duplicate id acc-01/);
  assert.equal(selectPrompts({}).length, promptSet().length, 'no --file means Phase 1, as before');
  assert.deepEqual(selectPrompts({ intent: 'map' }).map((p) => p.id), promptSet().filter((p) => p.intent === 'map').map((p) => p.id));
});

test('--per-intent takes a spread: English positive, Vietnamese positive, negative, then round again', () => {
  const { sample } = require('../scripts/evals.cjs');
  const prompts = loadPrompts(path.join(__dirname, '..', 'evals', 'activation', 'phase-1.jsonl'));
  const three = sample(prompts, 3);
  // Three per intent: the six of Phase 1 and every skill intent, which holds exactly three anyway. Derived rather
  // than written out, because each new skill grows the set and a written count went red twice for that reason alone.
  assert.equal(three.length, (PHASE1.length + SKILL_INTENTS.length) * 3);
  for (const intent of [...PHASE1, ...SKILL_INTENTS]) {
    const g = three.filter((p) => p.intent === intent);
    assert.equal(g.filter((p) => p.lang === 'en' && !p.id.includes('-neg-')).length, 1, `${intent} en`);
    assert.equal(g.filter((p) => p.lang === 'vi' && !p.id.includes('-neg-')).length, 1, `${intent} vi`);
    assert.equal(g.filter((p) => p.id.includes('-neg-')).length, 1, `${intent} neg`);
  }
  assert.equal(sample(prompts, 10).length, prompts.length, 'asking for more than exists returns everything');
  assert.equal(sample(prompts, 4).filter((p) => p.intent === 'bug').map((p) => p.id).join(','), 'bug-en-01,bug-en-02,bug-vi-01,bug-neg-01');
});

test('the fixture is staged outside the repository so the repository CLAUDE.md does not load into eval sessions', () => {
  const { stageFixture, ancestorMemoryFiles } = require('../scripts/evals.cjs');
  const fs = require('node:fs');
  const os = require('node:os');
  const repo = path.join(__dirname, '..');
  const inRepo = ancestorMemoryFiles(path.join(repo, 'evals', 'fixtures', 'sample-app'));
  assert.ok(inRepo.some((f) => path.resolve(f) === path.resolve(repo, 'CLAUDE.md')), 'the in-repo fixture sits under the repository CLAUDE.md');
  const base = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-stage-'));
  const staged = stageFixture(repo, base);
  assert.equal(staged.cwd, path.join(base, 'sample-app'));
  assert.ok(fs.existsSync(path.join(staged.cwd, 'package.json')));
  assert.ok(fs.existsSync(path.join(staged.cwd, 'src', 'app', 'settings', 'page.tsx')));
  assert.ok(!fs.existsSync(path.join(staged.cwd, 'CLAUDE.md')));
  assert.ok(!staged.ancestors.some((f) => path.resolve(f) === path.resolve(repo, 'CLAUDE.md')));
  // Ancestor detection covers the project-memory locations Claude Code reads on the way up: CLAUDE.md, .claude/CLAUDE.md, .claude/rules/.
  const tree = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-anc-'));
  fs.mkdirSync(path.join(tree, '.claude', 'rules'), { recursive: true });
  fs.writeFileSync(path.join(tree, '.claude', 'CLAUDE.md'), 'daily profile');
  fs.writeFileSync(path.join(tree, '.claude', 'rules', 'x.md'), 'rule');
  fs.mkdirSync(path.join(tree, 'a', 'b'), { recursive: true });
  const above = ancestorMemoryFiles(path.join(tree, 'a', 'b')).map((f) => path.resolve(f));
  assert.ok(above.includes(path.resolve(tree, '.claude', 'CLAUDE.md')), 'finds .claude/CLAUDE.md in an ancestor');
  assert.ok(above.some((f) => f === path.resolve(tree, '.claude', 'rules')), 'finds .claude/rules in an ancestor');
  // The staging base skips candidates whose ancestors carry memory files.
  const { chooseStageBase } = require('../scripts/evals.cjs');
  const foreign = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-foreign-'));
  fs.writeFileSync(path.join(foreign, 'CLAUDE.md'), 'foreign');
  assert.equal(chooseStageBase(repo, [path.join(tree, 'a', 'evals'), path.join(foreign, 'evals')]), null, 'both candidates sit under memory files');
  const clean = ancestorMemoryFiles(os.tmpdir()).length === 0 ? fs.mkdtempSync(path.join(os.tmpdir(), 'bk-clean-')) : null;
  if (clean) assert.equal(chooseStageBase(repo, [path.join(foreign, 'evals'), path.join(clean, 'evals')]), path.join(clean, 'evals'), 'the first clean candidate wins');
  if (staged.vcs) assert.ok(fs.existsSync(path.join(staged.cwd, ['.', 'git'].join(''))), 'throwaway history present');
  const again = stageFixture(repo, base);
  assert.equal(again.cwd, staged.cwd, 'staging is idempotent');
  // Every prompt starts from the staging commit: edits, new files and extra commits made by a session are undone.
  if (again.vcs) {
    const page = path.join(again.cwd, 'src', 'app', 'settings', 'page.tsx');
    const original = fs.readFileSync(page, 'utf8');
    fs.writeFileSync(page, original + '\n// edited by a session\n');
    fs.writeFileSync(path.join(again.cwd, 'junk.txt'), 'left behind');
    assert.equal(again.reset(), true);
    assert.equal(fs.readFileSync(page, 'utf8'), original, 'tracked edit undone');
    assert.ok(!fs.existsSync(path.join(again.cwd, 'junk.txt')), 'untracked file removed');
  }
});

// On 2026-09-20 thirteen prompts came back \"no-action\" because the measurement profile's login had expired: the
// table said nothing about why, and the run spent every prompt on it. A session that did not authenticate is not a
// measurement, so it is named and it stops the run.
test('a session that failed to authenticate is reported as such and stops the run', () => {
  const { authStop } = require('../scripts/evals.cjs');
  const line = (o) => JSON.stringify(o);
  const expired = [
    line({ type: 'system', subtype: 'init' }),
    line({ type: 'assistant', message: { content: [{ type: 'text', text: 'Failed to authenticate: OAuth session expired and could not be refreshed' }] } }),
    line({ type: 'result', subtype: 'success', is_error: true, num_turns: 1, result: 'Failed to authenticate: OAuth session expired and could not be refreshed' }),
  ].join('\n');
  const stop = authStop(expired);
  assert.ok(stop, 'the stream says the session never reached the model');
  assert.match(stop.message, /authenticate|login/i);
  assert.equal(authStop(line({ type: 'result', subtype: 'success', is_error: false, num_turns: 3, result: 'done' })), null, 'an ordinary session is not stopped');
  assert.equal(authStop(''), null);
});

// \"no-action\" was one marker for two different things: a prompt that never reached the model, and an answer
// given in one turn with no tool call — which is exactly what acceptance prompt 1 must do. A session that answered
// in words is scored \"none\"; only a session with nothing to show stays no-action.
test('a one-turn answer with no tool call scores none; an empty session stays no-action', () => {
  const { classify } = require('../scripts/evals.cjs');
  const line = (o) => JSON.stringify(o);
  const answered = [
    line({ type: 'system', subtype: 'init' }),
    line({ type: 'assistant', message: { content: [{ type: 'text', text: 'ACT acts and reports; COUNCIL proposes and waits.' }] } }),
    line({ type: 'result', subtype: 'success', is_error: false, num_turns: 1, result: 'ACT acts and reports; COUNCIL proposes and waits.' }),
  ].join('\n');
  assert.equal(classify(answered), 'none', 'the model answered, it simply opened no skill');
  const empty = [line({ type: 'system', subtype: 'init' }), line({ type: 'result', subtype: 'success', is_error: false, num_turns: 1, result: '' })].join('\n');
  assert.equal(classify(empty), 'no-action', 'nothing came back: read the stream');
  const errored = [line({ type: 'result', subtype: 'success', is_error: true, num_turns: 1, result: 'Failed to authenticate: OAuth session expired' })].join('\n');
  assert.equal(classify(errored), 'no-action', 'an error is not an answer');
});

// A prompt file is named relative to the working directory, which is fine inside the checkout and a trap outside
// it: on 2026-09-20 the owner ran the documented command from another folder and got a bare ENOENT for
// evals/activation/boundaries.jsonl. A path that is not there is looked for in the checkout before the run stops,
// and the message names both places.
test('--file finds a prompt file of the checkout from any working directory, and says both places when it cannot', () => {
  const { selectPrompts } = require('../scripts/evals.cjs');
  const here = process.cwd();
  let prompts;
  try {
    process.chdir(require('node:os').tmpdir());
    prompts = selectPrompts({ file: 'evals/activation/boundaries.jsonl', id: 'bnd-en-02' });
  } finally { process.chdir(here); }
  assert.equal(prompts.length, 1);
  assert.equal(prompts[0].expect, 'bk-map|bk-setup');
  assert.throws(() => selectPrompts({ file: 'evals/activation/nope.jsonl' }), /nope.jsonl/);
  assert.throws(() => selectPrompts({ file: 'evals/activation/nope.jsonl' }), /Bearingkit/);
});

// The Antigravity stage is reached through the CLI, so what the CLI hands stage() is part of the contract: one
// manual run on the host is not a regression test.
test('--stage-only forwards --activate and --dest to the stage, and says where the store was declared', async () => {
  const evals = require('../scripts/evals.cjs');
  const ag = require('../scripts/antigravity-evals.cjs');
  const realStage = ag.stage;
  const out = [];
  const write = process.stdout.write.bind(process.stdout);
  let seen = null;
  ag.stage = (opts) => { seen = opts; return { cwd: 'C:\\work\\apps\\sample-app', sha: 'abcdef0123456789', reused: false, activated: 'C:\\work\\apps\\sample-app\\.agents\\plugins.json', declares: 'C:/store', storeMissing: true, folderUri: 'file:///c%3A/work/apps/sample-app' }; };
  process.stdout.write = (s) => { out.push(String(s)); return true; };
  try {
    await evals.run(['--host', 'antigravity', '--stage-only', '--activate', '--dest', 'C:\\store', '--stage-dir', 'C:\\work\\apps\\sample-app']);
  } finally { process.stdout.write = write; ag.stage = realStage; }
  assert.equal(seen.activate, true, 'the flag reaches stage()');
  assert.equal(seen.dest, path.resolve('C:\\store'));
  assert.equal(seen.dir, path.resolve('C:\\work\\apps\\sample-app'));
  const text = out.join('');
  assert.match(text, /plugins\.json/, 'the run says which file carries the declaration');
  assert.match(text, /not installed|bearingkit install/, 'and warns that the declared store is not there');
});

// On 2026-09-18 `bearingkit evals --help` ran the prompt set: there was no help flag, the unknown option was ignored,
// and with no --config-dir the sessions ran in the owner's daily profile, where the host keeps their transcripts. The
// same class of accident happened on 2026-09-17. The runner now stops before any session unless the profile is named.
test('the runner stops before any session for --help, an unknown option, a stray argument, or no profile named', () => {
  const { preflight } = require('../scripts/evals.cjs');
  const help = preflight({ _: [], help: true });
  assert.equal(help.exit, 0);
  assert.match(help.message, /usage/i);
  const unknown = preflight({ _: [], 'config-dir': 'x', bogus: true });
  assert.equal(unknown.exit, 2);
  assert.match(unknown.message, /--bogus/);
  const stray = preflight({ _: ['help'], 'config-dir': 'x' });
  assert.equal(stray.exit, 2);
  assert.match(stray.message, /help/);
  const daily = preflight({ _: [] });
  assert.equal(daily.exit, 2);
  assert.match(daily.message, /daily profile/);
  // A named profile is enough to start; that it must also enable the inline plugin is the test above.
  assert.equal(preflight({ _: [], 'config-dir': 'x', 'plugin-dir': 'none' }), null);
  assert.equal(preflight({ _: [], daily: true }), null, 'the daily profile when it is named');
  assert.equal(preflight({ _: [], host: 'antigravity', score: true }), null, 'an Antigravity run needs no Claude profile');
  assert.equal(preflight({ _: [], host: 'antigravity', 'stage-only': true, activate: true }), null, 'a stage may be asked to carry its activation');
});
