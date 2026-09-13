'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { State } = require('../scripts/lib/state.cjs');

const script = path.join(__dirname, '..', 'scripts', 'record-guardrail.cjs');
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bk-rg-'));
const run = (args, env) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8', env: { ...process.env, ...env } });

test('appends a guardrail run to the newest state for the directory', () => {
  const base = tmp();
  const cwd = 'C:/proj-a';
  new State({ host: 'claude', sessionId: 's1', cwd, baseDir: base });
  const r1 = run(['--command', 'pnpm test', '--exit', '0', '--cwd', cwd], { BEARINGKIT_STATE_DIR: base });
  assert.equal(r1.status, 0, r1.stderr);
  const r2 = run(['--command', 'pnpm exec tsc --noEmit', '--exit', '2', '--cwd', cwd], { BEARINGKIT_STATE_DIR: base });
  assert.equal(r2.status, 0, r2.stderr);
  const d = State.latest({ cwd, baseDir: base }).read();
  assert.equal(d.guardrailRuns.length, 2);
  assert.deepEqual(d.guardrailRuns.map((g) => [g.command, g.exitCode]), [['pnpm test', 0], ['pnpm exec tsc --noEmit', 2]]);
});

test('records an independent review with its scope', () => {
  const base = tmp();
  const cwd = 'C:/proj-b';
  new State({ host: 'antigravity', sessionId: 'c9', cwd, baseDir: base });
  const r = run(['--review', 'src/auth/login.ts, src/auth/session.ts', '--by', 'reviewer-7', '--cwd', cwd], { BEARINGKIT_STATE_DIR: base });
  assert.equal(r.status, 0, r.stderr);
  const d = State.latest({ cwd, baseDir: base }).read();
  assert.equal(d.independentReview.bySessionId, 'reviewer-7');
  assert.deepEqual(d.independentReview.scope, ['src/auth/login.ts', 'src/auth/session.ts']);
});

// This used to assert the opposite: with no state and no --session the recorder failed, and the error told the user
// to start a session so "the stack-profile hook" would create one. That hook was deleted with the rule layer in the
// v2 restructure and nothing replaced it, so the exact command bk-ship/SKILL.md tells the model to run — no --session
// — could only fail. The recorder is the only writer of this store left, so it creates its own file.
test('records without --session by creating the state for the directory, since nothing else creates it', () => {
  const base = tmp();
  const cwd = 'C:/proj-fresh';
  const r = run(['--command', 'pnpm test', '--exit', '0', '--cwd', cwd], { BEARINGKIT_STATE_DIR: base });
  assert.equal(r.status, 0, r.stderr);
  const d = State.latest({ cwd, baseDir: base }).read();
  assert.deepEqual(d.guardrailRuns.map((g) => [g.command, g.exitCode]), [['pnpm test', 0]]);
});

test('a second record the same day in the same directory lands in the same file, not a new one', () => {
  const base = tmp();
  const cwd = 'C:/proj-same-day';
  assert.equal(run(['--command', 'a', '--exit', '0', '--cwd', cwd], { BEARINGKIT_STATE_DIR: base }).status, 0);
  assert.equal(run(['--command', 'b', '--exit', '1', '--cwd', cwd], { BEARINGKIT_STATE_DIR: base }).status, 0);
  assert.equal(fs.readdirSync(base).filter((f) => f.endsWith('.json')).length, 1);
  const d = State.latest({ cwd, baseDir: base }).read();
  assert.deepEqual(d.guardrailRuns.map((g) => g.command), ['a', 'b']);
});

test('an unwritable state directory fails loudly, and the message names no hook that does not exist', () => {
  const r = run(['--command', 'x', '--exit', '0', '--cwd', 'C:/proj-x'], { BEARINGKIT_STATE_DIR: path.join(__dirname, 'fixtures', 'fake-kit.cjs') });
  assert.equal(r.status, 1);
  assert.doesNotMatch(r.stderr, /stack-profile/);
});

test('creates the state when --session is given', () => {
  const base = tmp();
  const r = run(['--command', 'pytest', '--exit', '0', '--cwd', 'C:/proj-c', '--session', 'fresh', '--host', 'claude'], { BEARINGKIT_STATE_DIR: base });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(base, 'claude-fresh.json')));
});
