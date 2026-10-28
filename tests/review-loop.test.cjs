'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { tmpdir } = require('./fixtures/tmpdir.cjs');

const script = path.join(__dirname, '..', 'scripts', 'review-loop.cjs');
const run = (cwd, ...args) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
const git = (cwd, ...args) => {
  const r = spawnSync('git', ['-c', 'user.name=T', '-c', 'user.email=t@example.com', '-c', 'core.autocrlf=false', ...args], { cwd, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  return r.stdout.trim();
};
const write = (dir, rel, text) => { fs.mkdirSync(path.dirname(path.join(dir, rel)), { recursive: true }); fs.writeFileSync(path.join(dir, rel), text); };
const loopFile = (dir) => fs.readFileSync(path.join(dir, '.review-loop.md'), 'utf8');

// A repository with one commit and an uncommitted change: the state a review loop starts from.
function repo() {
  const dir = tmpdir('bk-rl-');
  git(dir, 'init', '-q');
  write(dir, 'src/a.js', 'module.exports = 1;\n');
  git(dir, 'add', '-A');
  git(dir, 'commit', '-q', '-m', 'base');
  write(dir, 'src/a.js', 'module.exports = 2;\n');
  return dir;
}

test('the first run opens round 1 on the whole change and writes the header', () => {
  const dir = repo();
  const r = run(dir, 'start');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /round 1 of 3/i);
  assert.match(r.stdout, /whole change/i);
  const text = loopFile(dir);
  assert.match(text, new RegExp(`^Head: ${git(dir, 'rev-parse', 'HEAD')}$`, 'm'));
  assert.match(text, /^Round: 1$/m);
  assert.match(text, /^Snapshot: [0-9a-f]{40}$/m);
  assert.match(text, /^## Round 1$/m);
});

test('the file is kept out of commits with the same exclude line the owner\'s hook writes, once', () => {
  const dir = repo();
  run(dir, 'start');
  run(dir, 'start');
  const exclude = fs.readFileSync(path.join(dir, '.git', 'info', 'exclude'), 'utf8');
  assert.equal(exclude.split(/\s+/).filter((w) => w === '/.review-loop.md').length, 1);
  assert.doesNotMatch(git(dir, 'status', '--porcelain'), /review-loop/);
});

test('a later round names only the diff since the previous round, untracked files included', () => {
  const dir = repo();
  write(dir, 'src/b.js', 'module.exports = "b";\n');
  run(dir, 'start');
  fs.appendFileSync(path.join(dir, '.review-loop.md'), '- `src/a.js:1` · wrong constant · exports 2\n');
  write(dir, 'src/a.js', 'module.exports = 3;\n');
  write(dir, 'src/c.js', 'module.exports = "c";\n');
  const r = run(dir, 'start');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /round 2 of 3/i);
  const m = r.stdout.match(/git diff ([0-9a-f]{40}) ([0-9a-f]{40})/);
  assert.ok(m, r.stdout);
  const diff = git(dir, 'diff', '--name-only', m[1], m[2]).split('\n').sort();
  assert.deepEqual(diff, ['src/a.js', 'src/c.js']);
  // the findings already posted come back, so the reviewer never posts them again
  assert.match(r.stdout, /src\/a\.js:1` · wrong constant/);
  assert.match(loopFile(dir), /^Round: 2$/m);
  assert.match(loopFile(dir), /wrong constant[\s\S]*^## Round 2$/m);
});

test('the snapshot never contains the loop file itself, ignored or not', () => {
  const dir = repo();
  run(dir, 'start');
  run(dir, 'start');
  const ignored = loopFile(dir).match(/^Snapshot: ([0-9a-f]{40})$/m)[1];
  assert.doesNotMatch(git(dir, 'ls-tree', '-r', '--name-only', ignored), /review-loop/);
  // a host where the exclude line cannot be written: the exclude file is a directory, so the loop file is not ignored
  const exclude = path.join(dir, '.git', 'info', 'exclude');
  fs.rmSync(exclude);
  fs.mkdirSync(exclude);
  const r = run(dir, 'start');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /never stage \.review-loop\.md/);
  const plain = loopFile(dir).match(/^Snapshot: ([0-9a-f]{40})$/m)[1];
  assert.doesNotMatch(git(dir, 'ls-tree', '-r', '--name-only', plain), /review-loop/);
});

test('a new commit starts a fresh loop and drops the old findings', () => {
  const dir = repo();
  run(dir, 'start');
  fs.appendFileSync(path.join(dir, '.review-loop.md'), '- `src/a.js:1` · old finding · gone after the commit\n');
  run(dir, 'start');
  git(dir, 'add', 'src');
  git(dir, 'commit', '-q', '-m', 'fixed');
  write(dir, 'src/a.js', 'module.exports = 4;\n');
  const r = run(dir, 'start');
  assert.match(r.stdout, /round 1 of 3/i);
  assert.doesNotMatch(loopFile(dir), /old finding/);
});

test('a fourth round on an ordinary change is refused and changes nothing', () => {
  const dir = repo();
  for (let i = 1; i <= 3; i++) { write(dir, 'src/a.js', `module.exports = ${10 + i};\n`); assert.equal(run(dir, 'start').status, 0); }
  const before = loopFile(dir);
  write(dir, 'src/a.js', 'module.exports = 99;\n');
  const r = run(dir, 'start');
  assert.equal(r.status, 3);
  assert.match(r.stdout, /cap/i);
  assert.match(r.stdout, /owner/i);
  assert.equal(loopFile(dir), before);
});

test('the owner\'s word lets a hot path go beyond the cap', () => {
  const dir = repo();
  for (let i = 1; i <= 3; i++) { write(dir, 'src/a.js', `module.exports = ${20 + i};\n`); run(dir, 'start'); }
  write(dir, 'src/a.js', 'module.exports = 30;\n');
  const r = run(dir, 'start', '--beyond-cap');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /round 4/i);
  assert.match(loopFile(dir), /^Round: 4$/m);
});

test('a file another host wrote without head or snapshot keeps its round and falls back to the whole change', () => {
  const dir = repo();
  write(dir, '.review-loop.md', 'Round: 1\n\n- `src/a.js:1` · wrong constant · posted by another host\n');
  const r = run(dir, 'start');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /round 2 of 3/i);
  assert.match(r.stdout, /no usable snapshot/i);
  assert.match(r.stdout, /posted by another host/);
});

test('a repository with no commit yet still opens a loop', () => {
  const dir = tmpdir('bk-rl-');
  git(dir, 'init', '-q');
  write(dir, 'src/a.js', 'module.exports = 1;\n');
  const r = run(dir, 'start');
  assert.equal(r.status, 0, r.stderr);
  assert.match(loopFile(dir), /^Head: none$/m);
});

test('outside a git repository it says so and exits non-zero', () => {
  const dir = tmpdir('bk-rl-');
  const r = run(dir, 'start');
  assert.equal(r.status, 2);
  assert.match(r.stdout + r.stderr, /not a git repository/i);
});

test('an unchanged tree is the same round again, so a retry or a second look spends no round', () => {
  const dir = repo();
  run(dir, 'start');
  const before = loopFile(dir);
  const r = run(dir, 'start');
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /round 1 of 3/i);
  assert.match(r.stdout, /this is round 1 again/i);
  assert.equal(loopFile(dir), before);
  // and a round 2 asked twice keeps its own scope
  write(dir, 'src/a.js', 'module.exports = 6;\n');
  const scope = run(dir, 'start').stdout.match(/git diff [0-9a-f]{40} [0-9a-f]{40}/)[0];
  const again = run(dir, 'start');
  assert.match(again.stdout, /round 2 of 3/i);
  assert.ok(again.stdout.includes(scope), again.stdout);
});

test('at the cap a retry on the same tree is round 3 again, and only a changed tree is refused', () => {
  const dir = repo();
  for (let i = 1; i <= 3; i++) { write(dir, 'src/a.js', `module.exports = ${40 + i};\n`); run(dir, 'start'); }
  const again = run(dir, 'start');
  assert.equal(again.status, 0, again.stdout);
  assert.match(again.stdout, /round 3 again/i);
  write(dir, 'src/a.js', 'module.exports = 50;\n');
  assert.equal(run(dir, 'start').status, 3);
  // past the cap on the owner's word, a retry of round 4 needs no second word; the next change does
  assert.equal(run(dir, 'start', '--beyond-cap').status, 0);
  const four = run(dir, 'start');
  assert.equal(four.status, 0, four.stdout);
  assert.match(four.stdout, /round 4 again/i);
  write(dir, 'src/a.js', 'module.exports = 51;\n');
  assert.equal(run(dir, 'start').status, 3);
});

test('a snapshot git cannot read is never reported as "no change"', () => {
  const dir = repo();
  run(dir, 'start');
  const text = loopFile(dir).replace(/^Snapshot: .*$/m, `Snapshot: ${'0'.repeat(40)}`);
  fs.writeFileSync(path.join(dir, '.review-loop.md'), text);
  write(dir, 'src/a.js', 'module.exports = 7;\n');
  const r = run(dir, 'start');
  assert.match(r.stdout, /round 2 of 3/i);
  assert.match(r.stdout, /no usable snapshot/i);
  assert.doesNotMatch(r.stdout, /no change since/i);
});

test('in a linked worktree the exclude line goes where git reads it', () => {
  const main = repo();
  git(main, 'add', '-A');
  git(main, 'commit', '-q', '-m', 'change');
  const wt = path.join(tmpdir('bk-rl-wt-'), 'wt');
  git(main, 'worktree', 'add', '-q', wt);
  write(wt, 'src/a.js', 'module.exports = 8;\n');
  assert.equal(run(wt, 'start').status, 0);
  assert.doesNotMatch(git(wt, 'status', '--porcelain'), /review-loop/);
});

test('a loop file with Windows line endings keeps one header', () => {
  const dir = repo();
  run(dir, 'start');
  fs.writeFileSync(path.join(dir, '.review-loop.md'), loopFile(dir).replace(/\n/g, '\r\n') + '- `src/a.js:1` · wrong constant · x\r\n');
  write(dir, 'src/a.js', 'module.exports = 9;\n');
  run(dir, 'start');
  const text = loopFile(dir);
  assert.equal(text.match(/^# Review loop/gm).length, 1);
  assert.equal(text.match(/^Findings posted in this loop/gm).length, 1);
  assert.match(text, /wrong constant/);
});
