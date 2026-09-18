'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

// Spec §5.2 asks for every skill, command, rule set or agent of every source to be inventoried once. The item list is
// taken from the source tree by this script rather than from memory, so "every" can be checked
// (docs/plans/2026-09-18-item-inventory.md).
function tree(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-inv-'));
  for (const [rel, text] of Object.entries(files)) {
    const p = path.join(root, ...rel.split('/'));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, text);
  }
  return root;
}

const source = {
  'skills/alpha/SKILL.md': 'a\nb\nc\n',
  'skills/alpha/references/deep.md': 'part of alpha, not an item\n',
  'skills/alpha/agents/helper.md': 'part of alpha, not an item\n',
  'commands/ship.md': 'x\n',
  'commands/README.md': 'not an item\n',
  'agents/reviewer.md': 'y\nz\n',
  'plugins/lsp-only/.mcp.json': '{}\n',
  'external_plugins/tracker/.mcp.json': '{}\n',
  'external_plugins/chat/commands/configure.md': 'c\n',
  'plugins/full/skills/beta/SKILL.md': 'b\n',
  'plugins/full/hooks/hooks.json': '{}\n',
  'rules/react/.cursorrules': 'r\n',
  'rules/vue/vue.mdc': 'v\n',
  'toolkit/rules/core/NAMING.md': 'a markdown rule set\n',
  'toolkit/rules/README.md': 'not an item\n',
  'node_modules/pkg/SKILL.md': 'vendored dependency, not an item\n',
  '.git/SKILL.md': 'not an item\n',
};

test('list finds every item kind once, and nothing inside a skill or a dependency', () => {
  const { list } = require('../scripts/inventory-items.cjs');
  const items = list(tree(source));
  assert.deepEqual(items.map((i) => `${i.kind} ${i.id}`), [
    'agent agents/reviewer.md',
    'command commands/ship.md',
    'command external_plugins/chat/commands/configure.md',
    'plugin external_plugins/tracker',
    'hooks plugins/full/hooks/hooks.json',
    'skill plugins/full/skills/beta',
    'plugin plugins/lsp-only',
    'rule rules/react/.cursorrules',
    'rule rules/vue/vue.mdc',
    'skill skills/alpha',
    'rule toolkit/rules/core/NAMING.md',
  ]);
  assert.equal(items.find((i) => i.id === 'skills/alpha').lines, 3, 'a skill is sized by its SKILL.md');
});

test('check reports every item the inventory does not name, qualified by the source label', () => {
  const { list, check } = require('../scripts/inventory-items.cjs');
  const items = list(tree(source));
  const inventory = [
    '| 1 | `demo:skills/alpha` | bk-build | absorb | reason |',
    '| 2 | `demo:commands/ship.md` | bk-ship | idea | reason |',
    '| 3 | `other:agents/reviewer.md` | bk-review | drop | another source\'s row does not count |',
    '| 4 | demo:plugins/lsp-only | — | drop | an id outside backticks does not count |',
    '| 5 | `demo:skills/alph` | — | drop | a prefix of an id does not count |',
  ].join('\n');
  assert.deepEqual(check(inventory, items, 'demo'), [
    'agents/reviewer.md',
    'external_plugins/chat/commands/configure.md',
    'external_plugins/tracker',
    'plugins/full/hooks/hooks.json',
    'plugins/full/skills/beta',
    'plugins/lsp-only',
    'rules/react/.cursorrules',
    'rules/vue/vue.mdc',
    'toolkit/rules/core/NAMING.md',
  ]);
});

// The review of each batch rests on two more measurements: every row obeys §5.2 (one target, one decision, text only
// where the licence allows it), and the totals table matches the rows. Both ran from a session scratchpad until
// 2026-09-18, which the next session could not reproduce.
const header = '| # | Mục | Loại | Dòng | Làm gì | Skill đích | Quyết định | Lý do |';
const row = (n, id, kind, lines, target, decision, reason = 'why') => `| ${n} | \`${id}\` | ${kind} | ${lines} | what | ${target} | ${decision} | ${reason} |`;

test('rows accepts §5.2 rows and reports each way a row can break the rule', () => {
  const { rows } = require('../scripts/inventory-items.cjs');
  const good = [header, '|---|', row(1, 'demo:skills/a', 'skill', 3, 'bk-build', 'idea'), row(2, 'demo:skills/b', 'skill', 3, '—', 'drop'),
    row(3, 'demo:(tool)', 'tool', 0, 'kit', 'idea'), row(4, 'demo:group/ts', 'group', 5, 'bk-build', 'idea'),
    '| `demo:.codex/skills/a` | 1 | có | idea |', row(9, 'other:skills/a', 'skill', 3, 'nowhere', 'maybe')].join('\n');
  assert.deepEqual(rows(good, 'demo'), { counts: { absorb: 0, idea: 3, drop: 1 }, problems: [] });

  const bad = [
    row(1, 'demo:skills/a', 'skill', 3, 'bk-nowhere', 'idea'),
    row(2, 'demo:skills/b', 'skill', 3, '—', 'idea'),
    row(3, 'demo:skills/c', 'skill', 3, 'bk-build', 'absorb'),
    row(4, 'demo:skills/d', 'skill', 3, 'bk-build', 'maybe'),
    row(5, 'demo:skills/e', 'skill', 3, 'bk-build', 'drop', ''),
    row(6, 'demo:skills/a', 'skill', 3, 'bk-build', 'drop'),
    '| 7 | `demo:skills/f` | skill | 3 | a `x | y` cell | bk-build | idea | why |',
  ].join('\n');
  const { problems } = rows(bad, 'demo');
  for (const expected of ['unknown target', 'idea with no target', 'absorb where the licence allows no text', 'unknown decision', 'empty cell', 'duplicate', '9 cells']) {
    assert.ok(problems.some((p) => p.includes(expected)), 'expected a problem naming: ' + expected + '\n' + problems.join('\n'));
  }
  assert.deepEqual(rows(row(1, 'demo:skills/c', 'skill', 3, 'bk-build', 'absorb'), 'demo', { textAllowed: true }).problems, []);
});

test('totals counts items the way the totals table does and reports every mismatch', () => {
  const { totals } = require('../scripts/inventory-items.cjs');
  const doc = [
    '| Nguồn | Nhãn | Mục | absorb | idea | drop | Kiểm độ phủ |',
    '|---|---|---|---|---|---|---|',
    '| demo/one | `one` | 8 | 1 | 6 | 1 | 8/8 |',
    '| demo/two | `two` | 3 | 0 | 1 | 1 | wrong on purpose |',
    header, '|---|',
    row(1, 'one:skills/a', 'skill', 40, 'bk-build', 'absorb'),
    row(2, 'one:group/ts', 'group', 5, 'bk-build', 'idea'),
    row(3, 'one:rules/x.mdc', 'rule', 12, '—', 'drop'),
    '| `one:.codex/skills/a` | 1 | có | idea |',
    row(1, 'two:skills/a', 'skill', 9, 'bk-test', 'idea'),
    row(2, 'two:skills/b', 'skill', 9, '—', 'drop'),
    row(1, 'three:skills/a', 'skill', 9, '—', 'drop'),
  ].join('\n');
  const result = totals(doc);
  assert.deepEqual(result.counted.one, { items: 8, absorb: 1, idea: 6, drop: 1 }, 'a group counts its files, a mirror counts one');
  assert.deepEqual(result.mismatches.sort(), ['three: missing from the totals table', 'two: table 3/0/1/1, rows 2/0/1/1']);
});

test('every skill folder of the kit is a target the row check accepts', () => {
  const { TARGETS } = require('../scripts/inventory-items.cjs');
  for (const name of fs.readdirSync(path.join(__dirname, '..', 'skills'))) {
    if (fs.existsSync(path.join(__dirname, '..', 'skills', name, 'SKILL.md'))) assert.ok(TARGETS.has(name), name);
  }
});
