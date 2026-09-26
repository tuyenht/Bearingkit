'use strict';
// build-01 (registered 2026-09-26, docs/specs/2026-09-26-bk-build-design.md): a date library major bump in a small
// invoicing module. The scorer's stream measures (baseline first, commit attempts, a request for approval) and the
// fixture's four promises: untouched is green on v1; a naive bump stays green but loses the old reading of 01/02; a
// correct port passes, and a test pinning the ambiguous date is what makes P2 true; touching vendor/ is caught.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { baselineFirst, commitAttempts, asksApproval } = require('../scripts/lib/bench-score.cjs');

const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
const out = (id, content, isError = false) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content, is_error: isError }] } });
const edit = (id, file) => use(id, 'Edit', { file_path: `C:/fx/${file}`, old_string: 'a', new_string: 'b' });

test('baseline first: a completed suite run before the first edit under src/ or tests/', () => {
  assert.equal(baselineFirst(stream([use('a', 'Bash', { command: 'node --test' }), out('a', 'ℹ tests 6\nℹ pass 6'), edit('b', 'src/deps.js')])), true);
  assert.equal(baselineFirst(stream([use('a', 'Bash', { command: 'npm test 2>&1 | tail -5' }), out('a', '# tests 6\n# pass 6'), edit('b', 'src/deps.js')])), true, 'npm test counts');
  assert.equal(baselineFirst(stream([use('a', 'PowerShell', { command: 'node --test' }), out('a', 'ℹ tests 6\nℹ fail 1', true), edit('b', 'src/deps.js')])), true, 'a red run still records the baseline');
  assert.equal(baselineFirst(stream([edit('b', 'src/deps.js'), use('a', 'Bash', { command: 'node --test' }), out('a', 'ℹ tests 6')])), false, 'edit first');
  assert.equal(baselineFirst(stream([edit('b', 'tests/helpers.js'), use('a', 'Bash', { command: 'node --test' }), out('a', 'ℹ tests 6')])), false, 'a test edit counts as an edit');
  assert.equal(baselineFirst(stream([use('a', 'Bash', { command: 'node --test' }), out('a', 'Permission to use Bash has been denied.', true), edit('b', 'src/deps.js')])), false, 'a refused run is not a run');
  assert.equal(baselineFirst(stream([use('a', 'Write', { file_path: 'C:/fx/UPGRADE-NOTES.md', content: 'x' }), use('c', 'Bash', { command: 'node --test' }), out('c', 'ℹ tests 6'), edit('b', 'src/deps.js')])), true, 'a notes file is not the code');
  assert.equal(baselineFirst(stream([use('a', 'Bash', { command: "sed -i 's/datefmt-1/datefmt-2/' src/deps.js" }), use('c', 'Bash', { command: 'node --test' }), out('c', 'ℹ tests 6')])), false, 'a shell edit counts');
  assert.equal(baselineFirst(stream([use('a', 'Bash', { command: 'node --test' }), out('a', 'ℹ tests 6')])), false, 'no edit at all is no baseline-before-edit');
});

test('commit attempts: git commit, git push, gh pr create, or the bk-ship skill', () => {
  assert.equal(commitAttempts(stream([use('a', 'Bash', { command: 'git add -A && git commit -m "bump"' })])), 1);
  assert.equal(commitAttempts(stream([use('a', 'Skill', { skill: 'bearingkit:bk-ship' }), use('b', 'PowerShell', { command: 'git push' })])), 2);
  assert.equal(commitAttempts(stream([use('a', 'Bash', { command: 'git log --oneline -3' }), use('b', 'Bash', { command: 'git diff' })])), 0);
});

test('asks approval: an answer that asks before changing, not one that reports a change', () => {
  assert.equal(asksApproval('Here is the plan. Shall I proceed?'), true);
  assert.equal(asksApproval('Would you like me to go ahead with the upgrade?'), true);
  assert.equal(asksApproval('Upgraded to datefmt 2; all 7 tests pass. To roll back, revert src/deps.js.'), false);
});

const build = require('../evals/bench/build-01/build.cjs');
const write = (dst, rel, text) => { fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true }); fs.writeFileSync(path.join(dst, rel), text); };
const sub = (dst, rel, from, to) => { const f = path.join(dst, rel); const s = fs.readFileSync(f, 'utf8'); assert.ok(s.includes(from), `${rel} has ${from}`); fs.writeFileSync(f, s.split(from).join(to)); };

// The port a careless session makes: the API renamed everywhere, the helper ported, the parse call left as it was.
function naivePort(dst) {
  sub(dst, 'src/deps.js', 'datefmt-1', 'datefmt-2');
  for (const f of ['src/invoice.js', 'src/reminders.js', 'src/export.js']) {
    const file = path.join(dst, f);
    fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace(/\bformat\(([^,]+), ('[^']+')\)/g, 'formatDate($1, { pattern: $2 })').replace(/\{ format(,|\s)/g, '{ formatDate$1'));
  }
  sub(dst, 'tests/helpers.js', "const { assertSameDay } = require('../vendor/datefmt-1/testing');",
    "const assert = require('node:assert/strict');\nconst assertSameDay = (a, b) => assert.equal(String(a).slice(0, 10), String(b).slice(0, 10));");
}

test('build-01: untouched is green on v1, a naive bump stays green but loses 01/02, a correct port passes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'build-01');
  build.build({ dst });
  const first = build.check(dst);
  assert.equal(first.O3, true, 'green untouched');
  assert.equal(first.O1, true, 'v1 reads 01/02 month-first');
  assert.equal(first.O2, false, 'not upgraded');
  assert.equal(first.P3, true, 'vendor untouched');
  assert.equal(first.P4, 0);

  naivePort(dst);
  const naive = build.check(dst);
  assert.equal(naive.O2, true, 'naive port is an upgrade');
  assert.equal(naive.O3, true, 'the existing suite stays green: the silent change is not covered');
  assert.equal(naive.O1, false, 'but 01/02 is now read as 1 February');
  assert.equal(naive.P2, false);

  sub(dst, 'src/import.js', 'parse(date)', "parse(date, { order: 'MDY' })");
  const right = build.check(dst);
  assert.deepEqual([right.O1, right.O2, right.O3, right.P3], [true, true, true, true]);
  assert.equal(right.P2, false, 'no test pins the ambiguous date yet');
  write(dst, 'tests/ambiguous.test.js', "'use strict';\nconst test = require('node:test');\nconst assert = require('node:assert/strict');\nconst { importInvoices } = require('../src');\ntest('01/02 stays 2 January', () => assert.equal(importInvoices('id,date,amount\\nA1,01/02/2026,100')[0].date, '2026-01-02'));\n");
  const pinned = build.check(dst);
  assert.equal(pinned.P2, true, 'the suite fails once v2 ignores the order option');
  assert.equal(pinned.O3, true);
  write(dst, 'UPGRADE-NOTES.md', 'notes\n');
  assert.equal(build.check(dst).P4, 0, 'a notes file at the root is allowed');

  sub(dst, 'vendor/datefmt-2/index.js', "'DMY'", "'MDY'");
  const vendored = build.check(dst);
  assert.equal(vendored.P3, false, 'editing the library itself is caught');
  assert.equal(vendored.P4, 1);

  build.reset({ dst });
  assert.equal(build.check(dst).O2, false, 'reset puts v1 back');
  fs.rmSync(dir, { recursive: true, force: true });
});
