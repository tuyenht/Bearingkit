'use strict';
// node-01 (registered 2026-09-26, docs/specs/2026-09-26-stack-node-python-design.md): an export command over ~2,000
// SKUs in a small stock CLI. The stream's reach measure (R), and the fixture's promises: untouched it is green and has
// no export; a sequential port with no deadline is bounded but hangs; a Promise.all port is unbounded; a port logging
// to stdout breaks the pipe; a pooled port with a deadline and clean stdout passes all three hazards. The scorer's
// sizes and times are shrunk through opts so the suite stays fast; the runner uses the registered ones.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { reach } = require('../scripts/lib/bench-score.cjs');
const { detect } = require('../scripts/detect-stack.cjs');
const build = require('../evals/bench/node-01/build.cjs');

const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });
const out = (id, content, isError = false) => ({ type: 'user', message: { content: [{ type: 'tool_result', tool_use_id: id, content, is_error: isError }] } });

test('reach: bk-build invoked, the stack file and index opened, detect-stack run or refused', () => {
  const kit = 'C:\\Projects\\Bearingkit\\skills\\bk-build\\references\\stacks';
  const full = reach(stream([
    use('a', 'Skill', { skill: 'bearingkit:bk-build' }),
    use('b', 'Bash', { command: 'node C:/kit/scripts/detect-stack.cjs .' }), out('b', '{"languages":["javascript"]}'),
    use('c', 'Read', { file_path: `${kit}\\index.md` }),
    use('d', 'Read', { file_path: `${kit}\\node.md` }),
  ]), 'node');
  assert.deepEqual(full, { skill: true, file: true, index: true, detect: 'ran' });
  const refused = reach(stream([
    use('b', 'Bash', { command: 'node C:/kit/scripts/detect-stack.cjs .' }), out('b', 'Permission to use Bash has been denied.', true),
    use('c', 'Bash', { command: 'cat C:/kit/skills/bk-build/references/stacks/index.md' }),
    use('e', 'Glob', { pattern: 'C:/kit/skills/bk-build/references/stacks/node.md' }),
  ]), 'node');
  assert.deepEqual(refused, { skill: false, file: false, index: true, detect: 'refused' }, 'a Glob listing is not an open');
  assert.equal(reach(stream([use('a', 'Skill', { skill: 'bk-build' })]), 'node').skill, true, 'the bare skill name counts');
  assert.equal(reach(stream([use('a', 'Skill', { command: '/bearingkit:bk-build add an export' })]), 'node').skill, true, 'the command shape counts, as in invocations()');
  assert.equal(reach(stream([use('a', 'Skill', { skill: 'bearingkit:bk-build-helper' })]), 'node').skill, false);
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\python.md` })]), 'node').file, false, 'another stack file is not this one');
  assert.equal(reach(stream([
    use('b', 'Bash', { command: 'node detect-stack.cjs' }), out('b', 'Permission denied', true),
    use('c', 'PowerShell', { command: 'node detect-stack.cjs' }), out('c', '{}'),
  ]), 'node').detect, 'ran', 'a later run wins over an earlier refusal');
  assert.equal(reach(stream([
    use('b', 'Bash', { command: 'node detect-stack.cjs; cat CLAUDE.md' }), out('b', 'Exit code 1\n{"hotPathGlobs":["**/permissions/**"]}', true),
  ]), 'node').detect, 'ran', 'a run that exits non-zero ran; the word in its output is not a refusal');
});

const write = (dst, rel, text) => { fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true }); fs.writeFileSync(path.join(dst, rel), text); };
const sub = (dst, rel, from, to) => { const f = path.join(dst, rel); const s = fs.readFileSync(f, 'utf8'); assert.ok(s.includes(from), `${rel} has ${from}`); fs.writeFileSync(f, s.split(from).join(to)); };

// The export command wired into the CLI; each port supplies src/export.cjs.
const WIRE = "  if (cmd === 'export' && rest.length === 1) {\n    const items = await require('../src/export.cjs').exportFile(rest[0]);\n    process.stdout.write(JSON.stringify(items) + '\\n');\n    return 0;\n  }\n  process.stderr.write(USAGE";
const READ = "const fs = require('node:fs');\nconst { getItem } = require('./client.cjs');\nconst read = (f) => fs.readFileSync(f, 'utf8').split(/\\r?\\n/).map((s) => s.trim()).filter(Boolean);\n";
const SEQUENTIAL = `${READ}exports.exportFile = async (f) => { const items = []; for (const sku of read(f)) items.push(await getItem(sku)); return items; };\n`;
// Records made up from the file, never fetched: the right shape, but no API call.
const MADE_UP = `${READ}exports.exportFile = async (f) => read(f).map((sku) => ({ sku }));
`;
const ALL_AT_ONCE = `${READ}exports.exportFile = async (f) => Promise.all(read(f).map((sku) => getItem(sku)));\n`;
const POOLED = `${READ}
const TIMEOUT_MS = 1000;
async function fetchItem(sku) {
  const res = await fetch(\`\${process.env.STOCK_API_URL}/items/\${encodeURIComponent(sku)}\`, { signal: AbortSignal.timeout(TIMEOUT_MS) });
  if (!res.ok) throw new Error(\`stock API answered \${res.status} for \${sku}\`);
  return res.json();
}
exports.exportFile = async (f) => {
  const skus = read(f);
  const items = new Array(skus.length);
  let next = 0;
  const worker = async () => { while (next < skus.length) { const i = next++; items[i] = await fetchItem(skus[i]); } };
  await Promise.all(Array.from({ length: 8 }, worker));
  return items;
};
`;
const SMALL = { small: 40, large: 80, few: 20, deadlineMs: 4000, killMs: 6000, runMs: 30000 };

test('node-01: untouched is green with no export; each port fails the hazard it ignores, the pooled one passes all', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'node-01');
  try {
    build.build({ dst });
    const profile = detect(dst);
    assert.deepEqual([profile.languages, profile.frameworks, profile.guardrails], [['javascript'], [], ['npm test']], 'detect-stack reads the fixture as registered');

    const first = await build.check(dst, null, SMALL);
    assert.equal(first.O2, true, 'green untouched');
    assert.deepEqual([first.O1, first.N1, first.N2, first.N3, first.X, first.N], [false, false, false, false, false, 0], 'no export yet: a usage error on stderr passes nothing');
    assert.equal(first.P4, 0);

    sub(dst, 'bin/stock.cjs', '  process.stderr.write(USAGE', WIRE);
    write(dst, 'src/export.cjs', SEQUENTIAL);
    const seq = await build.check(dst, null, SMALL);
    assert.deepEqual([seq.O1, seq.O2, seq.N1, seq.N2, seq.N3, seq.X], [true, true, true, true, false, true], 'sequential: bounded, clean stdout, no deadline');
    assert.deepEqual([seq.peaks, seq.peakClass, seq.hangKilled], [[1, 1], '1', true]);

    write(dst, 'src/export.cjs', ALL_AT_ONCE);
    const all = await build.check(dst, null, SMALL);
    assert.deepEqual([all.O1, all.N1, all.N2, all.N3], [true, false, true, false], 'Promise.all: every call in flight at once');
    assert.equal(all.peakClass, 'unbounded');

    write(dst, 'src/export.cjs', POOLED);
    const pooled = await build.check(dst, null, SMALL);
    assert.deepEqual([pooled.O1, pooled.O2, pooled.N1, pooled.N2, pooled.N3, pooled.X, pooled.N], [true, true, true, true, true, true, 3], 'pooled with a deadline');
    assert.deepEqual(pooled.peaks, [8, 8]);

    write(dst, 'src/export.cjs', MADE_UP);
    assert.equal((await build.check(dst, null, SMALL)).O1, false, 'records made up from the file, never fetched, are not the happy path');
    write(dst, 'src/export.cjs', POOLED);

    sub(dst, 'src/export.cjs', 'const TIMEOUT_MS = 1000;', 'const TIMEOUT_MS = 5000;');
    const late = await build.check(dst, null, SMALL);
    assert.deepEqual([late.N3, late.hangKilled], [false, false], 'a deadline longer than the scorer allows ends on its own, too late');
    sub(dst, 'src/export.cjs', 'const TIMEOUT_MS = 5000;', 'const TIMEOUT_MS = 1000;');

    sub(dst, 'src/export.cjs', 'const skus = read(f);', "const skus = read(f);\n  console.log(`exporting ${skus.length} SKUs`);");
    const noisy = await build.check(dst, null, SMALL);
    assert.deepEqual([noisy.O1, noisy.N2, noisy.N1, noisy.N3], [false, false, true, true], 'a progress line on stdout breaks the pipe');

    write(dst, 'config/export.json', '{}\n');
    write(dst, 'NOTES.md', 'notes\n');
    assert.equal((await build.check(dst, null, SMALL)).P4, 1, 'a file outside bin/, src/, test/ and a root note counts; the note does not');

    build.reset({ dst });
    assert.equal((await build.check(dst, null, SMALL)).O1, false, 'reset takes the export away');
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
