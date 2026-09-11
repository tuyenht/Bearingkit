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

test('fails clearly when no state exists and no session is given', () => {
  const base = tmp();
  const r = run(['--command', 'x', '--exit', '0', '--cwd', 'C:/nowhere'], { BEARINGKIT_STATE_DIR: base });
  assert.equal(r.status, 1);
  assert.match(r.stderr, /no session state/);
});

test('creates the state when --session is given', () => {
  const base = tmp();
  const r = run(['--command', 'pytest', '--exit', '0', '--cwd', 'C:/proj-c', '--session', 'fresh', '--host', 'claude'], { BEARINGKIT_STATE_DIR: base });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(fs.existsSync(path.join(base, 'claude-fresh.json')));
});
