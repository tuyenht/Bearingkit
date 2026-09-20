'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { activate, deactivate, status, storePath, PLUGIN_ID, AGENTS_FILE, CLAUDE_FILE } = require('../scripts/activation.cjs');

const tmp = (p) => fs.mkdtempSync(path.join(os.tmpdir(), `bk-${p}-`));
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const git = (cwd, args) => spawnSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@t.invalid', ...args], { cwd, encoding: 'utf8' });

// Activation is the one thing the kit writes into a project, so it writes into the host's own file, adds nothing of
// its own, and takes back exactly what it wrote. Everything else in the file has to survive both ways.
test('activate writes one entry per host, keeps what the files already hold, and says so once', () => {
  const project = tmp('proj');
  const home = tmp('home');
  const store = storePath(home);
  fs.mkdirSync(path.join(project, '.agents'), { recursive: true });
  fs.writeFileSync(path.join(project, ...AGENTS_FILE), JSON.stringify({ entries: [{ path: '~/team-plugins' }] }, null, 2));
  fs.mkdirSync(path.join(project, '.claude'), { recursive: true });
  fs.writeFileSync(path.join(project, ...CLAUDE_FILE), JSON.stringify({ permissions: { allow: ['Read(//c/x/**)'] }, enabledPlugins: { 'other@market': true } }, null, 2));

  const first = activate({ project, home });
  assert.deepEqual(first.actions.map((a) => a.kind), ['+', '+'], 'one write per host');
  const ag = readJson(path.join(project, ...AGENTS_FILE));
  assert.deepEqual(ag.entries, [{ path: '~/team-plugins' }, { path: store.replace(/\\/g, '/') }], 'the kit is added after what was there');
  const cc = readJson(path.join(project, ...CLAUDE_FILE));
  assert.deepEqual(cc.enabledPlugins, { 'other@market': true, [PLUGIN_ID]: true });
  assert.deepEqual(cc.permissions, { allow: ['Read(//c/x/**)'] }, 'other settings untouched');

  // Running it again changes nothing and says nothing was written.
  const again = activate({ project, home });
  assert.deepEqual(again.actions.map((a) => a.kind), ['=', '=']);
  assert.deepEqual(readJson(path.join(project, ...AGENTS_FILE)), ag);

  const off = deactivate({ project, home });
  assert.deepEqual(off.actions.map((a) => a.kind), ['-', '-']);
  assert.deepEqual(readJson(path.join(project, ...AGENTS_FILE)).entries, [{ path: '~/team-plugins' }], 'only the kit entry goes');
  assert.deepEqual(readJson(path.join(project, ...CLAUDE_FILE)).enabledPlugins, { 'other@market': true });
  assert.deepEqual(deactivate({ project, home }).actions.map((a) => a.kind), ['=', '=']);
});

test('a project with neither file gets them, and deactivate leaves no trace of the kit', () => {
  const project = tmp('proj2');
  const home = tmp('home2');
  activate({ project, home });
  assert.ok(fs.existsSync(path.join(project, ...AGENTS_FILE)));
  assert.ok(fs.existsSync(path.join(project, ...CLAUDE_FILE)));
  deactivate({ project, home });
  // Files the kit created and emptied go, and so do the folders it made for them.
  assert.ok(!fs.existsSync(path.join(project, ...AGENTS_FILE)), 'the file the kit created is removed when it is empty');
  assert.ok(!fs.existsSync(path.join(project, '.agents')));
  assert.ok(!fs.existsSync(path.join(project, ...CLAUDE_FILE)));
  assert.ok(!fs.existsSync(path.join(project, '.claude')));
  assert.deepEqual(fs.readdirSync(project), [], 'nothing of the kit is left behind');
});

test('--dry-run says what it would do and writes nothing; --host does one host only', () => {
  const project = tmp('proj3');
  const home = tmp('home3');
  const dry = activate({ project, home, dryRun: true });
  assert.deepEqual(dry.actions.map((a) => a.kind), ['+', '+']);
  assert.deepEqual(fs.readdirSync(project), [], 'a dry run writes nothing');
  const one = activate({ project, home, host: 'claude' });
  assert.deepEqual(one.actions.map((a) => a.host), ['claude']);
  assert.ok(fs.existsSync(path.join(project, ...CLAUDE_FILE)));
  assert.ok(!fs.existsSync(path.join(project, '.agents')), 'the other host is not touched');
  deactivate({ project, home, host: 'claude' });
  assert.ok(!fs.existsSync(path.join(project, ...CLAUDE_FILE)));
});

// The two files are the host's, not the project's: in a repository they would show up in every `git status` and in
// someone's commit. The kit keeps them out of the way locally, in .git/info/exclude, and takes that back too.
test('in a git repository the two paths are ignored locally, and deactivate removes that block', () => {
  const project = tmp('proj4');
  const home = tmp('home4');
  git(project, ['init', '-q']);
  const ignored = (rel) => git(project, ['check-ignore', '-q', rel]).status === 0;
  activate({ project, home });
  assert.ok(ignored('.agents/plugins.json'), 'the Antigravity file is ignored in this clone');
  assert.ok(ignored('.claude/settings.local.json'), 'the Claude Code file is ignored in this clone');
  assert.equal(git(project, ['status', '--porcelain']).stdout, '', 'nothing new shows up in git status');
  deactivate({ project, home });
  assert.ok(!ignored('.agents/plugins.json'), 'the block is taken back');
  const exclude = fs.readFileSync(path.join(project, '.git', 'info', 'exclude'), 'utf8');
  assert.doesNotMatch(exclude, /bearingkit/i);

  // A repository that already ignores the paths is left alone, and a project that is not a repository still activates.
  const own = tmp('proj5');
  git(own, ['init', '-q']);
  fs.writeFileSync(path.join(own, '.gitignore'), '.claude/\n.agents/\n');
  activate({ project: own, home });
  assert.doesNotMatch(fs.readFileSync(path.join(own, '.git', 'info', 'exclude'), 'utf8'), /bearingkit/i, 'nothing to add when the repository already ignores them');
  const plain = tmp('proj6');
  assert.deepEqual(activate({ project: plain, home }).actions.map((a) => a.kind), ['+', '+']);
  assert.ok(!fs.existsSync(path.join(plain, '.git')));
});

// One verb set, the same shape on every host: the commands a person types are the ones the docs print.
test('the six commands run from bin, with the same flags and the same three line shapes', () => {
  const bin = path.join(__dirname, '..', 'bin', 'bearingkit.cjs');
  const home = tmp('home8');
  const project = tmp('proj8');
  const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8', env: { ...process.env, USERPROFILE: home, HOME: home } });

  const off = run('status', '--project', project);
  assert.equal(off.status, 0);
  assert.match(off.stdout, /store: not installed/);
  assert.match(off.stdout, /antigravity: off/);
  assert.match(off.stdout, /claude: off/);

  const dry = run('activate', '--project', project, '--dry-run');
  assert.equal(dry.status, 0);
  assert.match(dry.stdout, /^\+ would be /m);
  assert.deepEqual(fs.readdirSync(project), []);

  assert.equal(run('activate', '--project', project).status, 0);
  const on = run('status', '--project', project);
  assert.match(on.stdout, /antigravity: on/);
  assert.match(on.stdout, /claude: on/);
  assert.equal(run('deactivate', '--project', project).status, 0);
  assert.deepEqual(fs.readdirSync(project), []);

  // install and uninstall carry the store; the Claude Code half prints commands instead of running the host.
  const installed = run('install', '--host', 'antigravity');
  assert.equal(installed.status, 0);
  assert.ok(fs.existsSync(path.join(storePath(home), 'skills', 'bk-spec', 'SKILL.md')));
  const claudeSide = run('install', '--host', 'claude');
  assert.match(claudeSide.stdout, /claude plugin marketplace add/);
  assert.match(claudeSide.stdout, /claude plugin install bearingkit@bearingkit/);
  assert.match(claudeSide.stdout, /autoUpdate/);
  assert.equal(run('uninstall', '--host', 'antigravity').status, 0);
  assert.ok(!fs.existsSync(storePath(home)));

  // An unknown host is a usage error, not a silent success, and update without a pull still refreshes the store.
  const bad = run('activate', '--host', 'nope', '--project', project);
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /nope/);
  run('install', '--host', 'antigravity');
  const upd = run('update', '--host', 'antigravity', '--no-pull');
  assert.equal(upd.status, 0);
  assert.match(upd.stdout, /store refreshed/);
  // update prints the host's update command, not its install commands.
  const updClaude = run('update', '--host', 'claude', '--no-pull');
  assert.match(updClaude.stdout, /claude plugin update bearingkit@bearingkit/);
  assert.doesNotMatch(updClaude.stdout, /marketplace add/);
});

// A file that exists but does not parse is somebody's broken edit, not an absent file: overwriting it would throw
// their settings away without a word.
test('a host file that is not valid JSON stops the command and is left exactly as it was', () => {
  const home = tmp('home9');
  for (const which of [AGENTS_FILE, CLAUDE_FILE]) {
    const project = tmp('proj9');
    const file = path.join(project, ...which);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, '{ "entries": [  // half an edit\n');
    assert.throws(() => activate({ project, home }), /not valid JSON/);
    assert.equal(fs.readFileSync(file, 'utf8'), '{ "entries": [  // half an edit\n');
    assert.throws(() => deactivate({ project, home }), /not valid JSON/);
    // status only reads, so it reports the broken file instead of throwing.
    const s = status({ project, home, root: path.join(__dirname, '..') });
    const host = which === AGENTS_FILE ? 'antigravity' : 'claude';
    assert.equal(s.hosts[host].activated, false);
    assert.match(String(s.hosts[host].unreadable), /not valid JSON/);
  }
});

// JSON whose root is not an object (an array, a string, a number) would be spread into an object and lose
// everything it held. It is as broken, for this purpose, as a file that does not parse.
test('a host file whose root is not an object is refused, not merged', () => {
  const home = tmp('home10');
  for (const [which, body] of [[AGENTS_FILE, '[{"path":"~/x"}]'], [CLAUDE_FILE, '"a string"']]) {
    const project = tmp('proj10');
    const file = path.join(project, ...which);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
    assert.throws(() => activate({ project, home }), /not a JSON object/);
    assert.equal(fs.readFileSync(file, 'utf8'), body, 'left as it was');
  }
});

// doctor reads the store when it exists and the global copy when it does not; status has to say the same thing,
// or the two commands contradict each other on the same machine. --dest names a copy somewhere else, for both.
test('status finds the global copy when there is no store, and follows --dest', () => {
  const root = path.join(__dirname, '..');
  const home = tmp('home11');
  const project = tmp('proj11');
  const globalCopy = path.join(home, '.gemini', 'config', 'plugins', 'bearingkit');
  require('../scripts/antigravity.cjs').install({ root, dest: globalCopy });
  const s = status({ project, home, root });
  assert.deepEqual([s.store.present, s.store.current, s.store.which], [true, true, 'global copy']);
  assert.equal(s.store.path, globalCopy);
  // With a store as well, the store is the one reported, as doctor does.
  require('../scripts/antigravity.cjs').install({ root, dest: storePath(home) });
  assert.deepEqual([status({ project, home, root }).store.path, status({ project, home, root }).store.which], [storePath(home), 'store']);
  // A copy somewhere else is read when it is named.
  const elsewhere = path.join(tmp('elsewhere'), 'copy');
  require('../scripts/antigravity.cjs').install({ root, dest: elsewhere });
  assert.equal(status({ project, home, root, dest: elsewhere }).store.path, elsewhere);
});

// Switching one host off must not un-ignore the other host's file, which is still in use: the ignore block holds
// one line per host and only the line of the host being switched goes.
test('deactivating one host leaves the other host ignored', () => {
  const project = tmp('proj12');
  const home = tmp('home12');
  git(project, ['init', '-q']);
  const ignored = (rel) => git(project, ['check-ignore', '-q', rel]).status === 0;
  activate({ project, home });
  deactivate({ project, home, host: 'claude' });
  assert.ok(ignored('.agents/plugins.json'), 'the host still switched on keeps its file ignored');
  assert.equal(git(project, ['status', '--porcelain']).stdout, '', 'and nothing new shows up in git status');
  deactivate({ project, home, host: 'antigravity' });
  assert.doesNotMatch(fs.readFileSync(path.join(project, '.git', 'info', 'exclude'), 'utf8'), /bearingkit/i, 'the last one out removes the block');
});

// A store installed somewhere else (--dest) has to be the path a project then names; otherwise activate writes an
// entry pointing at a store that is not there.
test('--dest is the store activate names and status reads', () => {
  const project = tmp('proj13');
  const home = tmp('home13');
  const root = path.join(__dirname, '..');
  const dest = path.join(tmp('customstore'), 'kit');
  require('../scripts/antigravity.cjs').install({ root, dest });
  activate({ project, home, dest, host: 'antigravity' });
  const entry = JSON.parse(fs.readFileSync(path.join(project, ...AGENTS_FILE), 'utf8')).entries[0].path;
  assert.equal(entry, dest.replace(/\\/g, '/'));
  const s = status({ project, home, root, dest });
  assert.deepEqual([s.store.present, s.hosts.antigravity.activated], [true, true]);
  deactivate({ project, home, dest, host: 'antigravity' });
  assert.ok(!fs.existsSync(path.join(project, ...AGENTS_FILE)), 'and it is the entry that goes');
});

test('status answers three things: is the store there, is it current, is this project on', () => {
  const project = tmp('proj7');
  const home = tmp('home7');
  const root = path.join(__dirname, '..');
  const before = status({ project, home, root });
  assert.equal(before.store.present, false);
  assert.deepEqual([before.hosts.antigravity.activated, before.hosts.claude.activated], [false, false]);

  require('../scripts/antigravity.cjs').install({ root, dest: storePath(home) });
  activate({ project, home });
  const after = status({ project, home, root });
  assert.deepEqual([after.store.present, after.store.current], [true, true]);
  assert.deepEqual([after.hosts.antigravity.activated, after.hosts.claude.activated], [true, true]);
  assert.equal(after.store.path, storePath(home));

  // A store older than the checkout is what "update" is for, so status has to see it.
  fs.writeFileSync(path.join(storePath(home), 'skills', 'bk-spec', 'SKILL.md'), 'stale');
  assert.equal(status({ project, home, root }).store.current, false);
});
