'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const bin = path.join(__dirname, '..', 'bin', 'bearingkit.cjs');
const run = (...args) => spawnSync(process.execPath, [bin, ...args], { encoding: 'utf8' });

test('an unknown command prints usage and exits 2', () => {
  const r = run('nope');
  assert.equal(r.status, 2);
  assert.match(r.stderr, /usage: bearingkit/);
});

// The command table is an object literal, so `commands[cmd]` also finds everything on Object.prototype: `constructor`
// and `toString` were dispatched as commands, did nothing, and exited 0 — a silent success for a command that does
// not exist, which is the one outcome a CLI must never produce.
test('a name inherited from Object.prototype is not a command', () => {
  for (const name of ['constructor', 'toString', 'hasOwnProperty', 'valueOf']) {
    const r = run(name);
    assert.equal(r.status, 2, `${name} must not dispatch`);
    assert.match(r.stderr, /usage: bearingkit/, name);
  }
});
