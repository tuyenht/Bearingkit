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
  ]);
});
