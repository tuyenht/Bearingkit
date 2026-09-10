'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { State } = require('../core/hooks/lib/state.cjs');

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bk-state-'));

test('creates a file with defaults and reads it back', () => {
  const s = new State({ host: 'claude', sessionId: 'abc', cwd: 'C:\\x', baseDir: tmp() });
  const d = s.read();
  assert.equal(d.schema, 1);
  assert.equal(d.host, 'claude');
  assert.equal(d.cwd, 'C:/x');
  assert.deepEqual(d.guardrailRuns, []);
  assert.equal(d.independentReview, null);
  assert.ok(fs.existsSync(s.file));
  assert.equal(path.basename(s.file), 'claude-abc.json');
});

test('update merges fields atomically and leaves no temp file', () => {
  const s = new State({ host: 'antigravity', sessionId: 'c1', cwd: 'C:/x', baseDir: tmp() });
  s.update({ hotPathTouched: true, codeFilesChanged: ['a.ts'] });
  s.update({ codeFilesChanged: ['a.ts', 'b.ts'] });
  const d = s.read();
  assert.equal(d.hotPathTouched, true);
  assert.deepEqual(d.codeFilesChanged, ['a.ts', 'b.ts']);
  assert.ok(!fs.existsSync(s.file + '.tmp'));
  assert.match(d.updatedAt, /^\d{4}-\d{2}-\d{2}T/);
});

test('prune removes files older than seven days and keeps fresh ones', () => {
  const base = tmp();
  const old = path.join(base, 'claude-old.json');
  fs.writeFileSync(old, '{}');
  const t = Date.now() / 1000 - 8 * 86400;
  fs.utimesSync(old, t, t);
  const fresh = new State({ host: 'claude', sessionId: 'new', cwd: 'C:/x', baseDir: base });
  fresh.prune();
  assert.ok(!fs.existsSync(old));
  assert.ok(fs.existsSync(fresh.file));
});

test('latest finds the newest state file for a working directory', () => {
  const base = tmp();
  const a = new State({ host: 'claude', sessionId: 'a', cwd: 'C:/proj', baseDir: base });
  a.update({ branch: 'old' });
  const aFile = a.file;
  const past = Date.now() / 1000 - 3600;
  fs.utimesSync(aFile, past, past);
  const b = new State({ host: 'claude', sessionId: 'b', cwd: 'C:/proj', baseDir: base });
  b.update({ branch: 'new' });
  new State({ host: 'claude', sessionId: 'other', cwd: 'C:/elsewhere', baseDir: base });
  const found = State.latest({ cwd: 'C:\\proj', baseDir: base });
  assert.equal(found.read().branch, 'new');
  assert.equal(State.latest({ cwd: 'C:/nowhere', baseDir: base }), null);
});

test('BEARINGKIT_STATE_DIR overrides the default location', () => {
  const base = tmp();
  process.env.BEARINGKIT_STATE_DIR = base;
  try {
    const s = new State({ host: 'claude', sessionId: 'env', cwd: 'C:/x' });
    assert.equal(path.dirname(s.file), base);
  } finally {
    delete process.env.BEARINGKIT_STATE_DIR;
  }
});
