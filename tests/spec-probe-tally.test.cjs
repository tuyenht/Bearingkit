'use strict';
// The tally of the bk-spec head probe (docs/specs/2026-10-09-bk-spec-head-probe-design.md, "Planned registration"):
// each definition read on hand-written stream lines and check files.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { segments, runsDetect, analyse, readFolder, readingRow } = require('../evals/analysis/spec-probe-tally.cjs');

const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
const res = (id, body, isError = false) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content: body, is_error: isError }] } });
const init = { type: 'system', subtype: 'init', model: 'claude-sonnet-5-5', claude_code_version: '2.1.291', session_id: 's' };
const done = { type: 'result', subtype: 'success', is_error: false, total_cost_usd: 0.2, duration_ms: 49000, usage: { input_tokens: 10, output_tokens: 5 }, permission_denials: [] };
const stream = (...ev) => ev.map((e) => JSON.stringify(e)).join('\n');
const PY = 'C:\\\\Projects\\\\Bearingkit\\\\skills\\\\bk-build\\\\references\\\\stacks\\\\python.md';
const FULL = `{\n  "vcs": "git",\n  "stackFiles": [\n    "${PY}"\n  ]\n}`;
const DETECT = 'node C:/Projects/Bearingkit/scripts/detect-stack.cjs';

test('segments split on ;, &&, || and newlines, then on single pipes', () => {
  assert.deepStrictEqual(segments('cd app && node x.cjs | head -40; ls'), [['cd app'], ['node x.cjs', 'head -40'], ['ls']]);
  assert.deepStrictEqual(segments('a || b\nc'), [['a'], ['b'], ['c']]);
});

test('a run of detect-stack is the first stage of a pipeline; a mention that does not run it is not', () => {
  assert.deepStrictEqual(runsDetect(`${DETECT} 2>&1 | head -40`), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect(`cd /x && node "C:\\Projects\\Bearingkit\\scripts\\detect-stack.cjs" | Select-Object -First 30`), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect(`& node C:/k/scripts/detect-stack.cjs | select -Last 5`), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect(`${DETECT} | sed -n 1,30p`), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect(`${DETECT} | grep -A5 stackFiles`), { runs: true, cut: false });
  assert.deepStrictEqual(runsDetect(DETECT), { runs: true, cut: false });
  assert.deepStrictEqual(runsDetect(`${DETECT} | tail -20`), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect(`${DETECT} | more`), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect(`cat CLAUDE.md AGENTS.md 2>/dev/null | head -50; ${DETECT}`), { runs: true, cut: false });
  assert.deepStrictEqual(runsDetect('cat scripts/detect-stack.cjs | head -20'), { runs: false, cut: false });
  assert.deepStrictEqual(runsDetect('grep -n stackFiles scripts/detect-stack.cjs'), { runs: false, cut: false });
  assert.deepStrictEqual(runsDetect('Get-Content scripts/detect-stack.cjs | Select-Object -First 5'), { runs: false, cut: false });
});

test('runs in a subshell, an assignment or a quoted node path, and sed -ne, are read; a quoted pipe is not a stage', () => {
  assert.deepStrictEqual(runsDetect('(cd app; node x/detect-stack.cjs) | head -30'), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect('$out = node x/detect-stack.cjs | Select-Object -First 40'), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect('out=$(node x/detect-stack.cjs | head -40)'), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect("& 'C:\\Program Files\\nodejs\\node.exe' C:/k/scripts/detect-stack.cjs | head -5"), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect(`${DETECT} | sed -ne '1,30p'`), { runs: true, cut: true });
  assert.deepStrictEqual(runsDetect(`${DETECT} | grep -E "stackFiles|head"`), { runs: true, cut: false });
});

test('a head-cut output: T, Rrun, and no L', () => {
  const cut = '{\n  "vcs": "git",\n  "stackFiles": [';
  const a = analyse(stream(init, use('a', 'Bash', { command: `${DETECT} | head -40` }), res('a', cut), done), 'python');
  assert.strictEqual(a.T, true); assert.strictEqual(a.Rrun, true); assert.strictEqual(a.L, false); assert.strictEqual(a.first, 'none');
});

test('a grep that keeps the list, a full output, and a compact one-line JSON are L; an empty list or another file is not', () => {
  const grepKept = `  "stackFiles": [\n    "${PY}"`;
  const a = analyse(stream(use('a', 'Bash', { command: `${DETECT} | grep -A3 stackFiles` }), res('a', grepKept)), 'python');
  assert.strictEqual(a.L, true); assert.strictEqual(a.Lrun, true); assert.strictEqual(a.T, false);
  assert.strictEqual(analyse(stream(use('a', 'Bash', { command: DETECT }), res('a', [{ type: 'text', text: FULL }])), 'python').L, true);
  const compact = `{"vcs":"git","stackFiles":["${PY}"]}`;
  assert.strictEqual(analyse(stream(use('a', 'Bash', { command: DETECT }), res('a', compact)), 'python').L, true);
  assert.strictEqual(analyse(stream(use('a', 'Bash', { command: DETECT }), res('a', '{"stackFiles": []}')), 'python').L, false);
  assert.strictEqual(analyse(stream(use('a', 'Bash', { command: DETECT }), res('a', '{"stackFiles": ["C:/k/stacks/node.md"]}')), 'python').L, false);
});

test('the list seen in the output of a call that is not a detect-stack run is L, recorded as not a run', () => {
  const a = analyse(stream(use('a', 'Read', { file_path: 'C:/tmp/out.json' }), res('a', FULL)), 'python');
  assert.strictEqual(a.L, true); assert.strictEqual(a.Lrun, false); assert.strictEqual(a.Rrun, false);
});

test('a refused run is not Rrun; a run that exits non-zero is', () => {
  assert.strictEqual(analyse(stream(use('a', 'Bash', { command: DETECT }), res('a', 'Permission to use Bash has been denied.', true)), 'python').Rrun, false);
  assert.strictEqual(analyse(stream(use('a', 'Bash', { command: DETECT }), res('a', 'Exit code 1\n{"permissions": ["**/permissions/**"]}', true)), 'python').Rrun, true);
});

test('a refused run whose message names no refusal is not Rrun: the permission_denied event decides', () => {
  const msg = 'Compound command changes working directory (Set-Location/Push-Location) - relative paths cannot be validated';
  const ev = { type: 'system', subtype: 'permission_denied', tool_name: 'PowerShell', tool_use_id: 'a', message: msg };
  assert.strictEqual(analyse(stream(use('a', 'PowerShell', { command: `Set-Location C:/app; ${DETECT}` }), ev, res('a', msg, true)), 'python').Rrun, false);
});

test('a run whose only result is an exit-code error is Rrun, flagged as exit-code only', () => {
  const a = analyse(stream(use('a', 'Bash', { command: `cat CLAUDE.md AGENTS.md && ${DETECT} | head -40` }), res('a', 'Exit code 1\ncat: AGENTS.md: No such file', true)), 'python');
  assert.strictEqual(a.Rrun, true); assert.strictEqual(a.RrunExitOnly, true);
  assert.strictEqual(analyse(stream(use('a', 'Bash', { command: DETECT }), res('a', FULL)), 'python').RrunExitOnly, false);
});

test('first: the first call naming the file against the first edit', () => {
  const read = use('r', 'Read', { file_path: 'C:\\k\\skills\\bk-build\\references\\stacks\\python.md' });
  const edit = use('e', 'Edit', { file_path: 'C:/app/x.py' });
  assert.strictEqual(analyse(stream(read, res('r', 'rules'), edit, res('e', 'ok')), 'python').first, 'before-edit');
  assert.strictEqual(analyse(stream(edit, res('e', 'ok'), read, res('r', 'rules')), 'python').first, 'after-edit');
  assert.strictEqual(analyse(stream(read, res('r', 'rules')), 'python').first, 'no-edit');
});

test('content: a Read, a Grep on the path, or a shell reader of the path with a clean result is yes; a failed Read, an ls or a Grep whose pattern names it is no', () => {
  const f = 'C:/k/skills/bk-build/references/stacks/python.md';
  assert.strictEqual(analyse(stream(use('r', 'Read', { file_path: f }), res('r', 'rules')), 'python').content, 'yes');
  assert.strictEqual(analyse(stream(use('g', 'Grep', { pattern: 'x', path: f }), res('g', 'hit')), 'python').content, 'yes');
  assert.strictEqual(analyse(stream(use('b', 'Bash', { command: `cat ${f}` }), res('b', 'rules')), 'python').content, 'yes');
  assert.strictEqual(analyse(stream(use('p', 'PowerShell', { command: `Get-Content ${f}` }), res('p', 'rules')), 'python').content, 'yes');
  assert.strictEqual(analyse(stream(use('r', 'Read', { file_path: f }), res('r', 'File does not exist.', true)), 'python').content, 'no');
  assert.strictEqual(analyse(stream(use('b', 'Bash', { command: `ls ${f}` }), res('b', f)), 'python').content, 'no');
  assert.strictEqual(analyse(stream(use('g', 'Grep', { pattern: 'stacks/python.md', path: 'C:/k' }), res('g', 'hit')), 'python').content, 'no');
  assert.strictEqual(analyse(stream(use('x', 'Bash', { command: 'ls' }), res('x', '')), 'python').content, 'none');
  assert.strictEqual(analyse(stream(use('b', 'Bash', { command: 'grep -rn "stacks/python.md" C:/k' }), res('b', 'hit')), 'python').content, 'no');
  assert.strictEqual(analyse(stream(use('b', 'Bash', { command: `grep -n rules ${f}` }), res('b', 'hit')), 'python').content, 'yes');
});

function folder(t, meta, sessions) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'probe-')) + path.sep + '2026-10-14-bench-py-01-natural-claude-sonnet-5-5';
  t.after(() => fs.rmSync(path.dirname(dir), { recursive: true, force: true }));
  fs.mkdirSync(dir);
  fs.writeFileSync(path.join(dir, 'meta.json'), JSON.stringify(meta));
  for (const [base, raw, check] of sessions) {
    fs.writeFileSync(path.join(dir, `${base}.raw.jsonl`), raw);
    if (check) fs.writeFileSync(path.join(dir, `${base}.check.json`), JSON.stringify(check));
  }
  return dir;
}

test('a folder: Rfile from check.json; cut, not completed and sleep-hit sessions counted Rfile no and flagged; S sessions not read', (t) => {
  const ok = stream(init, done);
  const dir = folder(t, { kit: { branch: 'bk-spec-reach' }, cut: ['02-natural-K2'] }, [
    ['01-natural-K1', ok, { Rfile: true, Rdetect: 'ran', O1: true }],
    ['02-natural-K2', ok, { Rfile: true }],
    ['03-natural-K3', stream(init), { Rfile: true }],
    ['04-natural-K4', ok, { Rfile: true }],
    ['05-natural-S1', ok, { Rfile: true }],
  ]);
  const f = readFolder(dir, { branch: 'bk-spec-reach', sleep: ['K4'] });
  assert.deepStrictEqual(f.rows.map((r) => [r.base, r.Rfile, r.flags.join(',')]), [
    ['01-natural-K1', true, ''], ['02-natural-K2', false, 'cut'], ['03-natural-K3', false, 'not-completed'], ['04-natural-K4', false, 'sleep'],
  ]);
  assert.strictEqual(f.rows[0].model, 'claude-sonnet-5-5'); assert.strictEqual(f.rows[0].host, '2.1.291'); assert.strictEqual(f.rows[0].stack, 'python');
});

test('a folder of another branch, or with no kit.branch, is skipped and named when a branch is asked', (t) => {
  assert.match(readFolder(folder(t, { kit: { branch: 'p4a-php' } }, []), { branch: 'p4c-build-reach' }).skipped, /p4a-php/);
  assert.match(readFolder(folder(t, {}, []), { branch: 'p4c-build-reach' }).skipped, /no kit.branch/);
});

test('two init events with different models are both shown', (t) => {
  const raw = stream(init, { ...init, model: 'claude-opus-5-5' }, done);
  const r = readFolder(folder(t, { kit: { branch: 'b' } }, [['01-natural-K1', raw, { Rfile: false }]]), {}).rows[0];
  assert.strictEqual(r.model, 'claude-sonnet-5-5+claude-opus-5-5'); assert.strictEqual(r.inits, 2);
});

test('with no Rfile or Rdetect in check.json, the scorer reach() reads the stream', (t) => {
  const raw = stream(init, use('d', 'Bash', { command: DETECT }), res('d', FULL), use('r', 'Read', { file_path: 'C:/k/stacks/python.md' }), res('r', 'x'), done);
  const r = readFolder(folder(t, { kit: { branch: 'b' } }, [['01-natural-K1', raw, { O1: true }]]), {}).rows[0];
  assert.strictEqual(r.Rfile, true); assert.strictEqual(r.RfileFrom, 'reach'); assert.strictEqual(r.Rdetect, 'ran');
});

test('the reading rows, tried in order, over eight sessions only', () => {
  const rows = (rrun, t, l) => Array.from({ length: 8 }, (_, i) => ({ Rrun: i < rrun, T: i < t, L: i < l }));
  assert.strictEqual(readingRow(rows(2, 8, 0)), 1);
  assert.strictEqual(readingRow(rows(6, 6, 2)), 2);
  assert.strictEqual(readingRow(rows(6, 6, 5)), 3);
  assert.strictEqual(readingRow(rows(6, 4, 3)), 4);
  assert.strictEqual(readingRow(rows(6, 6, 2).slice(0, 7)), null);
  assert.strictEqual(readingRow(rows(3, 8, 0)), 2); assert.strictEqual(readingRow(rows(8, 5, 2)), 2);
  assert.strictEqual(readingRow(rows(8, 5, 3)), 4); assert.strictEqual(readingRow(rows(8, 0, 4)), 4);
  assert.strictEqual(readingRow(rows(8, 0, 5)), 3);
  assert.strictEqual(readingRow(rows(7, 7, 5).slice(0, 7), 8), 3);
});
