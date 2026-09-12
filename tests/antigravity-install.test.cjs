'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { install, uninstall, MARKER } = require('../scripts/antigravity.cjs');
// A throwaway kit and a throwaway destination: the test never points at the checkout's live plugin copy. The fixture
// and the rule assertions are shared with tests/doctor.test.cjs, which checks the same properties on a live copy.
const { fakeKit, assertRuleComplete } = require('./fixtures/fake-kit.cjs');

test('install composes plugin.json, skills and the always-on rule, and refreshes an earlier copy', () => {
  const root = fakeKit();
  const dest = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bk-dest-')), 'bearingkit');
  const dry = install({ root, dest, dryRun: true });
  assert.ok(!fs.existsSync(dest), 'dry run writes nothing');
  assert.ok(dry.actions.some((a) => a.includes('rules')));
  install({ root, dest });
  for (const f of ['plugin.json', 'skills/bk-protocol/SKILL.md', 'skills/bk-protocol/references/x.md', 'skills/bk-spec/SKILL.md', 'scripts/detect-stack.cjs', 'scripts/record-guardrail.cjs', 'scripts/lib/state.cjs', 'rules/bearingkit.md', MARKER]) assert.ok(fs.existsSync(path.join(dest, f)), f);
  assertRuleComplete(fs.readFileSync(path.join(dest, 'rules', 'bearingkit.md'), 'utf8'), dest);
  fs.writeFileSync(path.join(dest, 'skills', 'stale.md'), 'old');
  install({ root, dest });
  assert.ok(!fs.existsSync(path.join(dest, 'skills', 'stale.md')), 'refresh replaces the copy');
});

test('a destination not created by bearingkit is refused on install and kept on uninstall', () => {
  const root = fakeKit();
  const dest = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bk-dest-')), 'bearingkit');
  fs.mkdirSync(dest, { recursive: true });
  fs.writeFileSync(path.join(dest, 'plugin.json'), '{}');
  assert.throws(() => install({ root, dest }), /not created by bearingkit/);
  assert.equal(uninstall({ dest }).reason, 'foreign');
  assert.ok(fs.existsSync(path.join(dest, 'plugin.json')));
});

test('uninstall removes only a marked copy', () => {
  const root = fakeKit();
  const dest = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bk-dest-')), 'bearingkit');
  install({ root, dest });
  assert.equal(uninstall({ dest, dryRun: true }).removed, false);
  assert.ok(fs.existsSync(dest));
  assert.equal(uninstall({ dest }).reason, 'removed');
  assert.ok(!fs.existsSync(dest));
  assert.equal(uninstall({ dest }).reason, 'absent');
});
