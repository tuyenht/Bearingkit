'use strict';
// The three review-loop tasks score what the spec registered: written sample answers against the term rules, and each
// fixture against the state the spec claims, read through the kit's own review-loop script.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { tmpdir } = require('./fixtures/tmpdir.cjs');
const { scoreAnswer } = require('../scripts/lib/bench-score.cjs');

const bench = path.join(__dirname, '..', 'evals', 'bench');
const task = (id) => JSON.parse(fs.readFileSync(path.join(bench, id, 'task.json'), 'utf8'));
const script = path.join(__dirname, '..', 'scripts', 'review-loop.cjs');
const start = (cwd) => spawnSync(process.execPath, [script, 'start'], { cwd, encoding: 'utf8' });

test('every term of the three tasks is a valid pattern', () => {
  for (const id of ['review-loop-01', 'review-loop-02', 'review-loop-03']) {
    const t = task(id);
    for (const r of [...t.rules.defects, ...t.rules.decoys]) for (const g of [...(r.all || []), r.unless || []]) for (const x of g) new RegExp(x, 'i');
  }
});

// A sample named pass-* passes the term rules; fail-* does not. The expected ids are fixed here, so a rule that drifts
// shows as a red test, not as a silently different score.
const EXPECTED = {
  'review-loop-02': {
    'pass-fix-only.md': { found: ['N1'], decoys: [] },
    'fail-whole-change.md': { found: ['N1'], decoys: ['X1', 'X2'] },
    'fail-misses-n1.md': { found: [], decoys: [] },
    'pass-positive-wording.md': { found: ['N1'], decoys: [] },
    'pass-left-as-is.md': { found: ['N1'], decoys: [] },
    'fail-header-cell.md': { found: [], decoys: [] },
    'fail-x1-labelled.md': { found: ['N1'], decoys: ['X1'] },
    'pass-x1-out-of-scope.md': { found: ['N1'], decoys: [] },
  },
  'review-loop-03': {
    'pass-stops.md': { found: ['CAP'], decoys: [] },
    'pass-never-reviewed.md': { found: ['CAP'], decoys: [] },
    'fail-fourth-round.md': { found: [], decoys: ['X3'] },
    'fail-loose-words.md': { found: [], decoys: [] },
  },
};

for (const [id, samples] of Object.entries(EXPECTED)) {
  test(`${id}: the sample answers score as registered`, () => {
    const t = task(id);
    const dir = path.join(bench, id, 'samples');
    assert.deepEqual(fs.readdirSync(dir).sort(), Object.keys(samples).sort());
    for (const [name, want] of Object.entries(samples)) {
      const sc = scoreAnswer(fs.readFileSync(path.join(dir, name), 'utf8'), t.rules);
      assert.deepEqual({ found: sc.found, decoys: sc.decoys }, want, name);
    }
  });
}

test('review-loop-02: round 2, the fix diff only, and both round-1 findings handed back', () => {
  const dst = path.join(tmpdir('bk-bench-loop-'), 'fx');
  require(path.join(bench, 'review-loop-02', 'build.cjs')).build({ dst });
  const r = start(dst);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /round 2 of 3/);
  const [, a, b] = r.stdout.match(/git diff ([0-9a-f]{40}) ([0-9a-f]{40})/);
  const files = spawnSync('git', ['diff', '--name-only', a, b], { cwd: dst, encoding: 'utf8' }).stdout.trim().split('\n').sort();
  assert.deepEqual(files, ['src/csv.js', 'src/paginate.js', 'test/csv.test.js']);
  assert.match(r.stdout, /off-by-one page count/);
  const check = require(path.join(bench, 'review-loop-02', 'build.cjs')).check(dst);
  assert.equal(check['C-dup'], false);
});

test('review-loop-03: the script refuses round 4 and the check reads the file still at round 3', () => {
  const dst = path.join(tmpdir('bk-bench-loop-'), 'fx');
  const fx = require(path.join(bench, 'review-loop-03', 'build.cjs'));
  fx.build({ dst });
  assert.equal(start(dst).status, 3);
  assert.deepEqual(fx.check(dst), { round: '3', 'C-r4': false, K3: true });
});

test('review-loop-01: a review counts only after an edit', () => {
  const fx = require(path.join(bench, 'review-loop-01', 'build.cjs'));
  const call = (name, input) => JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name, input }] } });
  const reviewedAfter = [call('Read', { file_path: 'x' }), call('Edit', { file_path: 'src/paginate.js' }), call('Skill', { skill: 'bearingkit:bk-review' })].join('\n');
  const reviewedBefore = [call('Skill', { skill: 'bearingkit:bk-review' }), call('Edit', { file_path: 'src/paginate.js' })].join('\n');
  const dst = tmpdir('bk-bench-loop-');
  assert.equal(fx.check(dst, reviewedAfter).R1, true);
  assert.equal(fx.check(dst, reviewedBefore).R1, false);
  assert.equal(fx.check(dst, call('Edit', {}) + '\n' + call('Agent', { subagent_type: 'superpowers:code-reviewer' })).R2, true);
});
