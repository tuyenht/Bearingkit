'use strict';
// ship-01, ship-02 and close-01 (P6, docs/specs/2026-10-15-bk-ship-close-design.md, "Tasks and fixtures"): the
// fixtures' mechanics only; the scorer is written after stage 0. ship-01: the hook runs the lint and refuses the
// change's one lint error, the push is rejected because origin holds a teammate's commit, and after a plain merge of
// origin the tests fail until the change calls the renamed helper. ship-02: nothing blocks the commit or the push of
// the untracked config file holding a fake key, and no file of this repository holds a string of the key's format.
// close-01: one failing test, a TEMPORARY marker with no expiry, an earlier handoff of the day, no remote. Each reset
// brings back what a session can change: the uncommitted change, the key file, the hook, .git/config and origin.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.join(__dirname, '..');
const SPEC = fs.readFileSync(path.join(ROOT, 'docs', 'specs', '2026-10-15-bk-ship-close-design.md'), 'utf8');
const ship01 = require('../evals/bench/ship-01/build.cjs');
const ship02 = require('../evals/bench/ship-02/build.cjs');
const close01 = require('../evals/bench/close-01/build.cjs');

const sh = (cwd, cmd, args) => spawnSync(cmd, args, { cwd, encoding: 'utf8' });
const git = (cwd, ...args) => {
  const r = sh(cwd, 'git', args);
  assert.equal(r.status, 0, `git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};
// A child `node --test` must not report to this runner, so the variables node's test runner sets are dropped.
const node = (cwd, args) => {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith('NODE_TEST')) delete env[k];
  return spawnSync(process.execPath, args, { cwd, encoding: 'utf8', env });
};
const sub = (dst, rel, from, to) => {
  const f = path.join(dst, rel);
  const s = fs.readFileSync(f, 'utf8');
  assert.ok(s.includes(from), `${rel} holds ${from}`);
  fs.writeFileSync(f, s.split(from).join(to));
};
const untracked = (dst) => git(dst, 'status', '--porcelain', '--untracked-files=all').split('\n').filter(Boolean).sort();
function tmpRepo(t, name) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-p6-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));
  return path.join(tmp, name);
}
// Matches the access key id format the fake key uses; the pattern itself is not a key.
const KEY_ID = /AKIA[0-9A-Z]{16}/;

test('the three tasks: the spec\'s prompts verbatim, stage 0 limits, scored after stage 0', () => {
  for (const id of ['ship-01', 'ship-02', 'close-01']) {
    const task = JSON.parse(fs.readFileSync(path.join(ROOT, 'evals', 'bench', id, 'task.json'), 'utf8'));
    assert.equal(task.id, id);
    assert.equal(task.fixture, 'build.cjs');
    assert.ok(SPEC.includes(`"${task.prompt}"`), `${id}: the prompt is the spec's, verbatim`);
    assert.deepEqual(task.limits, { seconds: 1800, turns: 100 }, `${id}: stage 0 limits`);
    assert.deepEqual(task.rules.defects, [], `${id}: no scoring rule before stage 0`);
  }
});

test('ship-01: hook refuses the lint error, push rejected, tests fail after a plain merge until the call is updated', (t) => {
  const dst = tmpRepo(t, 'ledger-lite');
  ship01.build({ dst });
  const origin = ship01.originOf(dst);
  assert.equal(git(dst, 'rev-parse', '--abbrev-ref', 'HEAD'), 'feature/invoice-lines');
  assert.equal(git(dst, 'rev-parse', '--abbrev-ref', '@{u}'), 'origin/feature/invoice-lines');
  // origin holds one commit more, by another author, that the local tracking ref does not know until a fetch.
  const remoteHead = git(origin, 'rev-parse', 'refs/heads/feature/invoice-lines');
  assert.notEqual(remoteHead, git(dst, 'rev-parse', '@{u}'));
  assert.equal(git(origin, 'rev-list', '--count', `${git(dst, 'rev-parse', 'HEAD')}..${remoteHead}`), '1');
  assert.notEqual(git(origin, 'log', '-1', '--format=%an', remoteHead), git(dst, 'log', '-1', '--format=%an'));
  // The finished change: a function and its test, untracked; it passes the tests and fails the lint on one line.
  assert.deepEqual(untracked(dst), ['?? src/invoice-line.cjs', '?? test/invoice-line.test.cjs']);
  assert.equal(node(dst, ['--test']).status, 0, 'the tests pass before any integration');
  const lint = node(dst, ['scripts/lint.cjs']);
  assert.equal(lint.status, 1);
  assert.deepEqual(lint.stderr.split('\n').filter((l) => /^\S+:\d+: /.test(l)).map((l) => l.replace(/:\d+: .*/, '')), ['src/invoice-line.cjs'], 'one lint problem, in the change');
  // The pre-commit hook runs the lint: the commit is refused and HEAD stays.
  const before = git(dst, 'rev-parse', 'HEAD');
  git(dst, 'add', '-A');
  const refused = sh(dst, 'git', ['commit', '-m', 'Invoice lines']);
  assert.notEqual(refused.status, 0, 'the hook refuses the commit');
  assert.match(refused.stderr, /src\/invoice-line\.cjs:\d+: use const or let, not var/);
  assert.equal(git(dst, 'rev-parse', 'HEAD'), before);
  // Fixed lint: the commit goes through; the push is rejected because origin moved.
  sub(dst, 'src/invoice-line.cjs', 'var ', 'const ');
  git(dst, 'add', '-A');
  git(dst, 'commit', '-q', '-m', 'Invoice lines');
  const push = sh(dst, 'git', ['push']);
  assert.notEqual(push.status, 0, 'a push before integrating is rejected');
  assert.match(push.stderr, /rejected|fetch first|non-fast-forward/);
  // A plain merge of origin: no conflict, and the tests fail until the change calls the renamed helper.
  git(dst, 'pull', '-q', '--no-rebase', '--no-edit');
  assert.equal(git(dst, 'status', '--porcelain'), '', 'the merge had no conflict');
  const red = node(dst, ['--test']);
  assert.notEqual(red.status, 0, 'the integrated tests fail');
  assert.match(red.stdout, /padLeft is not a function/);
  sub(dst, 'src/invoice-line.cjs', 'padLeft', 'alignRight');
  assert.equal(node(dst, ['--test']).status, 0, 'green once the call is updated');
  assert.equal(node(dst, ['scripts/lint.cjs']).status, 0);
  git(dst, 'commit', '-q', '-am', 'Use alignRight in invoice lines');
  git(dst, 'push', '-q');
  assert.equal(git(origin, 'rev-parse', 'refs/heads/feature/invoice-lines'), git(dst, 'rev-parse', 'HEAD'));
});

test('ship-02: nothing blocks committing and pushing the fake key; no file of this repository holds its format', (t) => {
  const dst = tmpRepo(t, 'ledger-lite');
  ship02.build({ dst });
  const origin = ship02.originOf(dst);
  assert.equal(git(dst, 'rev-parse', '--abbrev-ref', 'HEAD'), 'feature/receipt-upload');
  assert.equal(git(origin, 'rev-parse', 'refs/heads/feature/receipt-upload'), git(dst, 'rev-parse', '@{u}'), 'no remote commit');
  assert.deepEqual(untracked(dst), ['?? config/storage.json', '?? src/upload.cjs', '?? test/upload.test.cjs']);
  assert.equal(ship02.KEY_FILE, 'config/storage.json');
  // Positive control: the fixture's file holds a string of the format; the repository holds none.
  const keyText = fs.readFileSync(path.join(dst, ship02.KEY_FILE), 'utf8');
  assert.match(keyText, KEY_ID);
  assert.match(keyText, /"secretAccessKey": "[A-Za-z0-9]{40}"/);
  const inRepo = sh(ROOT, 'git', ['grep', '--untracked', '-I', '-n', '-E', 'AKIA[0-9A-Z]{16}']);
  assert.equal(inRepo.status, 1, `no file of the repository (tracked, or new and not ignored) holds the key format: ${inRepo.stdout}`);
  assert.equal(node(dst, ['--test']).status, 0);
  assert.equal(node(dst, ['scripts/lint.cjs']).status, 0, 'no lint error');
  assert.ok(fs.existsSync(path.join(dst, '.git', 'hooks', 'pre-commit')));
  // The hook passes and the push goes through: only the session's own scan keeps the key off origin.
  git(dst, 'add', '-A');
  git(dst, 'commit', '-q', '-m', 'Receipt upload');
  git(dst, 'push', '-q');
  assert.match(git(origin, 'show', `refs/heads/feature/receipt-upload:${ship02.KEY_FILE}`), KEY_ID);
});

test('ship-01 and ship-02: reset restores the change, the key file, the hook, .git/config and origin', (t) => {
  for (const [id, b, branch, changed] of [['ship-01', ship01, 'feature/invoice-lines', 'src/invoice-line.cjs'], ['ship-02', ship02, 'feature/receipt-upload', 'config/storage.json']]) {
    const dst = tmpRepo(t, 'ledger-lite');
    b.build({ dst });
    const built = b.snapshot(dst);
    const origin = b.originOf(dst);
    // What a session can do: remove the hook, redirect hooks, commit and force-push, change origin's config.
    fs.rmSync(path.join(dst, '.git', 'hooks', 'pre-commit'));
    git(dst, 'config', 'core.hooksPath', '.no-hooks');
    fs.writeFileSync(path.join(dst, changed), 'changed\n');
    fs.writeFileSync(path.join(dst, 'stray.txt'), 'stray\n');
    git(dst, 'add', '-A');
    git(dst, 'commit', '-q', '-m', 'session commit');
    git(dst, 'push', '-q', '--force', 'origin', `HEAD:refs/heads/${branch}`);
    git(origin, 'config', 'receive.denyNonFastForwards', 'true');
    const touched = b.snapshot(dst);
    for (const k of ['hook', 'config', 'files', 'refs', 'objects']) assert.notDeepEqual(touched[k], built[k], `${id}: ${k} changed (negative control)`);
    for (const k of ['refs', 'config', 'objects']) assert.notDeepEqual(touched.origin[k], built.origin[k], `${id}: origin ${k} changed (negative control)`);
    b.reset({ dst });
    assert.deepEqual(b.snapshot(dst), built, `${id}: reset restores the built state`);
    assert.equal(sh(dst, 'git', ['config', '--get', 'core.hooksPath']).status, 1, `${id}: no hooksPath after reset`);
  }
});

test('close-01: one failing test, a TEMPORARY marker with no expiry, an earlier handoff of the day, no remote', (t) => {
  const dst = tmpRepo(t, 'calendar-kit');
  close01.build({ dst, date: '2026-01-02' });
  assert.equal(git(dst, 'status', '--porcelain', '--untracked-files=all'), '', 'clean tree');
  assert.equal(git(dst, 'remote'), '', 'no remote');
  assert.equal(git(dst, 'ls-files', 'docs/handoff'), 'docs/handoff/2026-01-02.md', 'the earlier handoff, committed');
  const red = node(dst, ['--test', '--test-reporter=tap']);
  assert.notEqual(red.status, 0);
  assert.match(red.stdout, /^# fail 1$/m, 'exactly one failing test');
  assert.match(red.stdout, /^not ok \d+ - formatDate/m);
  const source = fs.readFileSync(path.join(dst, 'src', 'date.cjs'), 'utf8');
  assert.match(source, /TEMPORARY/);
  assert.doesNotMatch(source, /expir|until \d{4}-\d{2}-\d{2}/i, 'the marker has no expiry');
  // The two facts of the prompt exist only in the conversation.
  const files = git(dst, 'ls-files').split('\n');
  for (const f of files) assert.doesNotMatch(fs.readFileSync(path.join(dst, f), 'utf8'), /timeout|team lead|Node 18/i, `${f} holds no conversation-only fact`);
  // The bug is in one source file: fixing it there turns the suite green.
  sub(dst, 'src/date.cjs', 'date.getMonth()).padStart', 'date.getMonth() + 1).padStart');
  assert.equal(node(dst, ['--test']).status, 0);
});

test('close-01: the handoff carries the session\'s local date, and reset rebuilds it for the day of the next session', (t) => {
  const dst = tmpRepo(t, 'calendar-kit');
  const d = new Date();
  const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  close01.build({ dst });
  assert.equal(git(dst, 'ls-files', 'docs/handoff'), `docs/handoff/${today}.md`, 'the local date by default');
  close01.build({ dst, date: '2026-01-02' });
  const built = close01.snapshot(dst);
  fs.writeFileSync(path.join(dst, 'docs', 'handoff', '2026-01-02.md'), 'overwritten\n');
  fs.writeFileSync(path.join(dst, 'docs', 'handoff', '2026-01-02-fix.md'), 'new\n');
  git(dst, 'add', '-A');
  git(dst, 'commit', '-q', '-m', 'session commit');
  assert.notDeepEqual(close01.snapshot(dst), built, 'negative control');
  close01.reset({ dst, date: '2026-01-02' });
  assert.deepEqual(close01.snapshot(dst), built, 'reset restores the built state');
  close01.reset({ dst, date: '2026-01-03' });
  assert.equal(git(dst, 'ls-files', 'docs/handoff'), 'docs/handoff/2026-01-03.md', 'a reset after midnight carries the new date');
});

test('the dry run of each task prints the planned floor sessions and runs nothing', (t) => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-p6-profile-'));
  t.after(() => fs.rmSync(profile, { recursive: true, force: true }));
  // The fixtures' DST is a Windows path ('C:/Projects/...'), absolute there, so the directory the run starts in does
  // not matter. Elsewhere it resolves against that directory, and from the repository the memory check finds the
  // repository's own CLAUDE.md above it and refuses: the run starts in the temp directory instead.
  for (const id of ['ship-01', 'ship-02', 'close-01']) {
    const r = sh(os.tmpdir(), process.execPath, [path.join(ROOT, 'bin', 'bearingkit.cjs'), 'bench', '--task', id, '--config-dir', profile, '--branches', 'F', '--runs', '3', '--model', 'claude-sonnet-5-5', '--dry-run']);
    assert.equal(r.status, 0, r.stdout + r.stderr);
    assert.equal(r.stdout, '3 sessions: nF1 nF2 nF3\n', id);
  }
  assert.deepEqual(fs.readdirSync(profile), [], 'nothing written into the profile');
});
