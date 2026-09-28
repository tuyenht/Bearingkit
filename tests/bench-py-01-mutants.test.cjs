'use strict';
// The py-01 mutation harness (evals/bench/py-01/mutants.cjs) reads red or green from the exit code of `node --test`;
// the TAP output only gives the reason. Its first version counted `# fail N` in the TAP, which a reporter change can
// silently turn into all green (P3c-b, Node 25). Kept apart from bench-py-01.test.cjs, which runs Python.
const test = require('node:test');
const assert = require('node:assert/strict');
const { verdict } = require('../evals/bench/py-01/mutants.cjs');

const exited = (code) => Object.assign(new Error(`Command failed, exit ${code}`), { code });

test('mutants: red or green from the exit code, the TAP only for the reason', () => {
  assert.match(verdict(null, '# tests 5\n# pass 5\n# fail 0\n'), /^GREEN/);
  assert.match(verdict(exited(1), '# fail 1\nnot ok 3 - Y1\n  error: |-\n    peaks differ\n'), /^RED peaks differ/);
  assert.match(verdict(exited(1), 'ℹ tests 5\nℹ fail 1\n'), /^RED/, 'a failure the TAP count does not show is still red');
  assert.match(verdict(exited(1), ''), /^RED/, 'no output at all, non-zero exit');
  assert.match(verdict(null, 'ℹ fail 0\n'), /^GREEN/, 'exit 0 is green whatever the reporter');
  assert.match(verdict(null, '# fail 0\n# SKIP no pytest\n'), /^GREEN .*\[skip: no pytest\]/, 'a skip is named');
  assert.match(verdict(Object.assign(new Error('killed'), { code: null, killed: true, signal: 'SIGTERM' }), ''), /^NO RESULT/, 'a run killed at the timeout has no verdict');
});
