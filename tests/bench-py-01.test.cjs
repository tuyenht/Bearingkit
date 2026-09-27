'use strict';
// py-01 (registered 2026-09-26, docs/specs/2026-09-26-stack-node-python-design.md): an export command over ~2,000 SKUs
// in a small asyncio stock tool, each record stamped with its export time. The stream's reach measure (R) for
// python.md, and the fixture's promises: untouched it is green and has no export; a sequential port with no deadline
// is bounded but hangs; an unbounded asyncio.gather port has no bound; a naive datetime.now() fails the zone; the
// reference port (Semaphore, asyncio.timeout, datetime.now(UTC)) passes all three and the control. Python runs only as
// `python -m pytest` and `python -m stock` on a copy of the fixture (question 35); with no interpreter the test skips
// and says why. The scorer's sizes and times are shrunk through opts so the suite stays fast.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { reach } = require('../scripts/lib/bench-score.cjs');
const { detect } = require('../scripts/detect-stack.cjs');
const build = require('../evals/bench/py-01/build.cjs');

const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });

test('reach for py-01 reads python.md, not another stack file', () => {
  const kit = 'C:\\Projects\\Bearingkit\\skills\\bk-build\\references\\stacks';
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\python.md` })]), 'python').file, true);
  assert.equal(reach(stream([use('d', 'Read', { file_path: `${kit}\\node.md` })]), 'python').file, false);
});

const write = (dst, rel, text) => { fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true }); fs.writeFileSync(path.join(dst, rel), text); };
const sub = (dst, rel, from, to) => { const f = path.join(dst, rel); const s = fs.readFileSync(f, 'utf8'); assert.ok(s.includes(from), `${rel} has ${from}`); fs.writeFileSync(f, s.split(from).join(to)); };

// The export command wired into the tool; each port supplies stock/export.py.
const WIRE = '    if len(argv) == 2 and argv[0] == "export":\n        from .export import export_file\n\n        print(json.dumps(asyncio.run(export_file(argv[1]))))\n        return 0\n    print(USAGE';
const READ = 'import asyncio\nfrom datetime import UTC, datetime\nfrom pathlib import Path\n\nfrom .client import get_item\n\n\ndef read(f):\n    return [s.strip() for s in Path(f).read_text().splitlines() if s.strip()]\n\n\n';
const SEQUENTIAL = `${READ}async def export_file(f):
    records = []
    for sku in read(f):
        item = await get_item(sku)
        records.append({**item, "exported_at": datetime.now(UTC).isoformat()})
    return records
`;
const GATHER = `${READ}async def one(sku):
    item = await get_item(sku)
    return {**item, "exported_at": datetime.now(UTC).isoformat()}


async def export_file(f):
    return await asyncio.gather(*(one(sku) for sku in read(f)))
`;
const REFERENCE = `${READ}LIMIT = 8
TIMEOUT_S = 1.0


async def export_file(f):
    limit = asyncio.Semaphore(LIMIT)

    async def one(sku):
        async with limit:
            try:
                async with asyncio.timeout(TIMEOUT_S):
                    item = await get_item(sku)
            except Exception as err:
                item = {"sku": sku, "error": str(err) or type(err).__name__}
        return {**item, "exported_at": datetime.now(UTC).isoformat()}

    return await asyncio.gather(*(one(sku) for sku in read(f)))
`;
const STUB = `${READ}async def export_file(f):\n    return [{"sku": "none", "exported_at": datetime.now(UTC).isoformat()}]\n`;
const MADE_UP = `${READ}async def export_file(f):\n    return [{"sku": sku, "exported_at": datetime.now(UTC).isoformat()} for sku in read(f)]\n`;
const SMALL = { small: 40, large: 80, few: 20, deadlineMs: 4000, killMs: 6000, runMs: 30000 };
const pick = (r, keys) => keys.map((k) => r[k]);

test('py-01: untouched is green with no export; each port fails the hazard it ignores, the reference passes all', async (t) => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-fixture-'));
  const dst = path.join(dir, 'py-01');
  try {
    build.build({ dst });
    const profile = detect(dst);
    assert.deepEqual([profile.languages, profile.frameworks.map((f) => f.name), profile.guardrails], [['python'], ['pytest'], ['pytest']], 'detect-stack reads the fixture as registered');
    assert.ok(profile.stackFiles.some((f) => f.endsWith('/stacks/python.md')), 'the profile names python.md');

    let first;
    try { first = await build.check(dst, null, SMALL); } catch (e) {
      if (e.code === 'ENOENT') { t.skip(`no Python interpreter to run the fixture: ${e.message}`); return; }
      throw e;
    }
    // pytest is the one outside package the fixture needs; where it is missing O2 cannot be read, and the test says so.
    const suite = !first.O2error;
    const o2 = (r, want, msg) => { if (suite) assert.equal(r.O2, want, msg); };
    o2(first, true, 'green untouched');
    assert.deepEqual(pick(first, ['O1', 'Y1', 'Y2', 'Y3', 'X', 'Y']), [false, false, false, false, false, 0], 'no export yet: a usage error on stderr passes nothing');
    assert.equal(first.P4, 0);

    sub(dst, 'stock/__main__.py', '    print(USAGE', WIRE);
    write(dst, 'stock/export.py', STUB);
    const stub = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(stub, ['O1', 'Y1', 'Y2', 'Y3', 'X']), [false, false, false, false, false], 'an export that asks for nothing passes nothing, though it prints stamped JSON');

    write(dst, 'stock/export.py', MADE_UP);
    const madeUp = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(madeUp, ['O1', 'Y1', 'Y3']), [false, false, false], 'records made up from the file, never fetched, are not the happy path');

    write(dst, 'stock/export.py', SEQUENTIAL);
    const seq = await build.check(dst, null, SMALL);
    o2(seq, true);
    assert.deepEqual(pick(seq, ['O1', 'Y1', 'Y2', 'Y3', 'X']), [true, true, false, true, false], 'sequential: bounded and zoned, no deadline, aborts on the 500');
    assert.deepEqual([seq.peaks, seq.peakClass, seq.hangKilled], [[1, 1], '1', true]);

    write(dst, 'stock/export.py', GATHER);
    const all = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(all, ['O1', 'Y1', 'Y2', 'Y3']), [true, false, false, true], 'asyncio.gather over every SKU: all in flight at once');
    assert.equal(all.peakClass, 'unbounded');

    write(dst, 'stock/export.py', REFERENCE);
    const ref = await build.check(dst, null, SMALL);
    o2(ref, true);
    assert.deepEqual(pick(ref, ['O1', 'Y1', 'Y2', 'Y3', 'X', 'Y']), [true, true, true, true, true, 3], 'reference: Semaphore, asyncio.timeout, datetime.now(UTC)');
    assert.deepEqual(ref.peaks, [8, 8]);
    assert.match(String(ref.sampleTime), /\+00:00$/);

    sub(dst, 'stock/export.py', 'return await asyncio.gather(*(one(sku) for sku in read(f)))', 'return (await asyncio.gather(*(one(sku) for sku in read(f))))[1:]');
    const short = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(short, ['O1', 'Y1', 'Y2', 'Y3']), [false, true, true, true], 'every SKU fetched but one record dropped is not the file\'s set');
    sub(dst, 'stock/export.py', 'return (await asyncio.gather(*(one(sku) for sku in read(f))))[1:]', 'return await asyncio.gather(*(one(sku) for sku in read(f)))');

    sub(dst, 'stock/export.py', 'LIMIT = 8', `LIMIT = ${SMALL.small}`);
    const wide = await build.check(dst, null, SMALL);
    assert.deepEqual([wide.Y1, wide.peaks], [false, [SMALL.small, SMALL.small]], 'a bound as large as the small file is no bound here');
    sub(dst, 'stock/export.py', `LIMIT = ${SMALL.small}`, 'LIMIT = 8');

    sub(dst, 'stock/export.py', 'limit = asyncio.Semaphore(LIMIT)', 'limit = asyncio.Semaphore(max(1, len(read(f)) // 10))');
    const grows = await build.check(dst, null, SMALL);
    assert.deepEqual([grows.Y1, grows.peaks], [false, [SMALL.small / 10, SMALL.large / 10]], 'a limit that grows with the file is no bound');
    sub(dst, 'stock/export.py', 'limit = asyncio.Semaphore(max(1, len(read(f)) // 10))', 'limit = asyncio.Semaphore(LIMIT)');

    sub(dst, 'stock/export.py', 'TIMEOUT_S = 1.0', 'TIMEOUT_S = 5.0');
    const late = await build.check(dst, null, SMALL);
    assert.deepEqual([late.Y2, late.hangKilled], [false, false], 'a deadline longer than the scorer allows ends on its own, too late');
    sub(dst, 'stock/export.py', 'TIMEOUT_S = 5.0', 'TIMEOUT_S = 1.0');

    sub(dst, 'stock/export.py', 'datetime.now(UTC)', 'datetime.now()');
    const naive = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(naive, ['O1', 'Y1', 'Y2', 'Y3', 'X']), [true, true, true, false, true], 'a naive timestamp fails the zone only');
    sub(dst, 'stock/export.py', 'datetime.now()', 'datetime.now(UTC)');

    sub(dst, 'stock/export.py', '{**item, "exported_at": datetime.now(UTC).isoformat()}', 'item');
    const bare = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(bare, ['O1', 'Y3', 'Y1', 'Y2']), [false, false, true, true], 'no export time fails O1 and the zone');
    sub(dst, 'stock/export.py', '        return item\n', '        return {**item, "exported_at": datetime.now(UTC).timestamp()}\n');
    const epoch = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(epoch, ['O1', 'Y3']), [true, true], 'an epoch number carries no zone to lose');

    sub(dst, 'stock/__main__.py', '        from .export import export_file\n', '        from .export import export_file\n\n        print("exporting")\n');
    const noisy = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(noisy, ['O1', 'X', 'Y1', 'Y2']), [false, false, true, true], 'a progress line on stdout breaks the JSON');

    sub(dst, 'stock/__main__.py', '        print("exporting")\n', '');
    sub(dst, 'stock/__main__.py', 'export_file(argv[1]))))\n        return 0', 'export_file(argv[1]))))\n        return 1');
    const failing = await build.check(dst, null, SMALL);
    assert.deepEqual(pick(failing, ['O1', 'Y1', 'Y2', 'Y3', 'X']), [false, true, true, true, true], 'the right output with a failing exit is not the happy path');

    write(dst, 'tests/test_broken.py', 'def test_broken():\n    assert False\n');
    write(dst, 'config/export.toml', '\n');
    write(dst, 'NOTES.md', 'notes\n');
    const broken = await build.check(dst, null, SMALL);
    o2(broken, false, 'a red test is a red suite');
    assert.equal(broken.P4, 1, 'a file outside stock/, tests/ and a root note counts; the note does not');

    build.reset({ dst });
    assert.equal((await build.check(dst, null, SMALL)).O1, false, 'reset takes the export away');
    await t.test('O2 on each tree (python -m pytest)', { skip: suite ? false : `not checked: ${first.O2error}` }, () => {});
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
