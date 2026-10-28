'use strict';
// Fixture of benchmark task review-loop-02, and the shared parts of review-loop-01 and -03: a small Node project that
// exports orders as CSV. HEAD holds 0-based pagination; the uncommitted change under review adds the CSV export.
// The state is round 2 of a review loop: `.review-loop.md` records round 1 (its findings and the snapshot of the tree
// it reviewed), and the working tree holds the author's fix on top of that snapshot.
//   F1  posted in round 1: unescaped CSV field (cell and header). The fix quotes a value that holds a comma, a quote or
//       a newline, and runs the header through it too.
//   N1  in the fix diff, the defect to find: a quote inside a quoted value is not doubled, so `a"b,c` gives `"a"b,c"`.
//   X2  in the fix diff, posted in round 1 and still open: pageCount floors (the fix only renames its parameter).
//       Posting it again as a new finding is a repeat.
//   X1  outside the fix diff, present since round 1 and never posted: exportPage past the last page hands toCsv an
//       empty array and `Object.keys(rows[0])` throws. A later round that reviews only the fix does not raise it.
// Built outside the checkout, like every measured fixture, so no memory file of this repository sits above it.
// Usage: node build.cjs [--dst <dir>] [--reset]
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DST = 'C:/Projects/.bearingkit-evals/bench/review-loop-02';

const gitIn = (dst) => (args, env) => {
  const r = spawnSync('git', ['-c', 'user.name=Dana Tran', '-c', 'user.email=dana@orders.example', '-c', 'core.autocrlf=false', ...args], { cwd: dst, encoding: 'utf8', env: env ? { ...process.env, ...env } : process.env });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
};

const writeAll = (dst, files) => {
  for (const [rel, text] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true });
    fs.writeFileSync(path.join(dst, rel), text);
  }
};

const HEAD = {
  'package.json': '{\n  "name": "orders-export",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": { "test": "node --test" }\n}\n',
  'docs/api.md': '# API\n\n## paginate(items, page, size)\n\nPages are 0-based: page 0 holds the first `size` items.\n',
  'src/paginate.js': `'use strict';
// Pages are 0-based: page 0 holds the first \`size\` items (docs/api.md).
function paginate(items, page, size) {
  const start = page * size;
  return items.slice(start, start + size);
}

module.exports = { paginate };
`,
  'test/paginate.test.js': `'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { paginate } = require('../src/paginate.js');

test('page 0 is the first page', () => {
  assert.deepEqual(paginate([1, 2, 3, 4, 5], 0, 2), [1, 2]);
  assert.deepEqual(paginate([1, 2, 3, 4, 5], 2, 2), [5]);
});
`,
};

const PAGINATE_WITH_COUNT = (param) => `'use strict';
// Pages are 0-based: page 0 holds the first \`size\` items (docs/api.md).
function paginate(items, page, size) {
  const start = page * size;
  return items.slice(start, start + size);
}

// How many pages paginate() produces for \`total\` items${param === 'size' ? '' : `, \`${param}\` to a page`}.
function pageCount(total, ${param}) {
  return Math.floor(total / ${param});
}

module.exports = { paginate, pageCount };
`;

const CSV = (cellBody, headerLine) => `'use strict';
// Orders as CSV for the accounting export: one header row, then one row per order.
function cell(value) {
${cellBody}
}

function toCsv(rows) {
  const header = Object.keys(rows[0]);
  ${headerLine}
  for (const row of rows) lines.push(header.map((k) => cell(row[k])).join(','));
  return lines.join('\\n');
}

module.exports = { toCsv };
`;

const EXPORT = `'use strict';
const { paginate } = require('./paginate.js');
const { toCsv } = require('./csv.js');

// One page of orders as CSV, for the export button of the orders list.
function exportPage(orders, page, size) {
  return toCsv(paginate(orders, page, size));
}

module.exports = { exportPage };
`;

const CSV_TEST = (extra) => `'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { toCsv } = require('../src/csv.js');

test('one header row, then one row per order', () => {
  assert.equal(toCsv([{ id: 1, total: 9.5 }, { id: 2, total: 3 }]), 'id,total\\n1,9.5\\n2,3');
});
${extra}`;

// The change as round 1 reviewed it.
const ROUND1 = {
  'src/paginate.js': PAGINATE_WITH_COUNT('size'),
  'src/csv.js': CSV('  return String(value);', "const lines = [header.join(',')];"),
  'src/export.js': EXPORT,
  'test/csv.test.js': CSV_TEST(''),
};

// The author's fix of round 1's findings.
const FIX1 = {
  'src/paginate.js': PAGINATE_WITH_COUNT('pageSize'),
  'src/csv.js': CSV('  const s = String(value);\n  return /[",\\n]/.test(s) ? `"${s}"` : s;', "const lines = [header.map(cell).join(',')];"),
  'test/csv.test.js': CSV_TEST(`
test('a value with a comma is quoted', () => {
  assert.equal(toCsv([{ name: 'Tran, Dana' }]), 'name\\n"Tran, Dana"');
});
`),
};

const ROUND1_FINDINGS = [
  '- `src/csv.js:4` · unescaped CSV field · a value with a comma, a quote or a line break splits or corrupts its row; the same class in the header row (`src/csv.js:9`)',
  '- `src/paginate.js:10` · off-by-one page count · `Math.floor` drops the last partial page: 5 items in pages of 2 give 2 pages where paginate() serves 3. Open: the owner deferred it to the next change.',
];

// The tree as the kit's review-loop script snapshots it (untracked files included, the loop file left out), built the
// same way here so the fixture does not depend on the checkout under test.
function treeOf(dst, head) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bench-loop-'));
  const env = { GIT_INDEX_FILE: path.join(tmp, 'index') };
  const git = gitIn(dst);
  try {
    git(['read-tree', head], env);
    git(['add', '-A'], env);
    git(['rm', '--cached', '-q', '--ignore-unmatch', '--', '.review-loop.md'], env);
    return git(['write-tree'], env);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
}

function loopFile({ head, round, snapshot, rounds }) {
  const intro = 'Findings posted in this loop, one line each: `file:line` · bug class · what. A finding here is never posted again; one still unfixed is listed as open with its round. Written by bk-review (`scripts/review-loop.cjs start`); git-ignored, and a new commit starts a fresh loop.';
  const body = rounds.map((lines, i) => [`## Round ${i + 1}`, ...lines].join('\n')).join('\n\n');
  return ['# Review loop', '', `Head: ${head}`, `Round: ${round}`, `Snapshot: ${snapshot}`, '', intro, '', body, ''].join('\n');
}

// HEAD committed; then each step of the loop written in turn, the snapshot taken after the step the last round saw.
function buildLoop({ dst, steps, rounds }) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.mkdirSync(dst, { recursive: true });
  const git = gitIn(dst);
  writeAll(dst, HEAD);
  git(['init', '-q', '-b', 'main']);
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'Paginate orders, 0-based pages']);
  const head = git(['rev-parse', 'HEAD']);
  fs.appendFileSync(path.join(dst, '.git', 'info', 'exclude'), '\n/.review-loop.md\n');
  let snapshot = null;
  for (const [i, step] of steps.entries()) {
    writeAll(dst, step);
    if (i === rounds.length - 1) snapshot = treeOf(dst, head);
  }
  writeAll(dst, { '.review-loop.md': loopFile({ head, round: rounds.length, snapshot, rounds }) });
  return { dst, head: head.slice(0, 7), snapshot };
}

const build = ({ dst = DST } = {}) => buildLoop({ dst, steps: [ROUND1, FIX1], rounds: [ROUND1_FINDINGS] });

const readLoop = (dst) => { try { return fs.readFileSync(path.join(dst, '.review-loop.md'), 'utf8'); } catch { return ''; } };
const section = (text, n) => { const m = text.split(new RegExp(`^## Round ${n}\\s*$`, 'm'))[1]; return m === undefined ? null : m.split(/^## Round \d+\s*$/m)[0]; };

// After the session: what the loop file says now. C-rec: findings recorded for round 2 with file:line. C-dup (a
// hazard, true when present): round 1's still-open page-count finding written again as a round-2 finding.
function check(dst = DST) {
  const text = readLoop(dst);
  const r2 = section(text, 2);
  const lines = r2 === null ? [] : r2.split('\n').filter((l) => /^\s*[-*] /.test(l));
  return {
    round: (text.match(/^Round:\s*(\d+)/m) || [])[1] || null,
    'C-rec': lines.some((l) => /`[^`]+:\d+`/.test(l)),
    'C-dup': lines.some((l) => /pageCount|page count|Math\.floor|floor/i.test(l)),
  };
}

module.exports = { DST, build, reset: (opts) => build(opts), check, HEAD, ROUND1, FIX1, ROUND1_FINDINGS, CSV, PAGINATE_WITH_COUNT, CSV_TEST, buildLoop, writeAll, gitIn, readLoop, section };

if (require.main === module) {
  const args = process.argv.slice(2);
  const at = args.indexOf('--dst');
  const r = build({ dst: at >= 0 ? args[at + 1] : DST });
  console.log(`${args.includes('--reset') ? 'reset' : 'built'} ${r.dst} at ${r.head}, round-1 snapshot ${r.snapshot}`);
}
