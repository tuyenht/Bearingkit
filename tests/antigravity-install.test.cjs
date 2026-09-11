'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { install, uninstall, MARKER } = require('../scripts/antigravity.cjs');

// A throwaway kit and a throwaway destination: the test never points at the checkout's live plugin copy.
function fakeKit() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bk-kit-'));
  fs.mkdirSync(path.join(root, '.antigravity'), { recursive: true });
  fs.writeFileSync(path.join(root, '.antigravity', 'plugin.json'), '{"name":"bearingkit","version":"0.0.0","description":"t"}\n');
  fs.mkdirSync(path.join(root, 'skills', 'bk-protocol', 'references'), { recursive: true });
  fs.writeFileSync(path.join(root, 'skills', 'bk-protocol', 'SKILL.md'), '---\nname: bk-protocol\ndescription: "p"\n---\n\n# Bearingkit\n\n## Autonomy Gate\n\ntext\n');
  fs.writeFileSync(path.join(root, 'skills', 'bk-protocol', 'references', 'x.md'), '# x\n');
  fs.mkdirSync(path.join(root, 'skills', 'bk-spec'), { recursive: true });
  fs.writeFileSync(path.join(root, 'skills', 'bk-spec', 'SKILL.md'), '---\nname: bk-spec\ndescription: "s"\n---\nbody\n');
  fs.mkdirSync(path.join(root, 'scripts', 'lib'), { recursive: true });
  for (const s of ['scripts/detect-stack.cjs', 'scripts/record-guardrail.cjs', 'scripts/lib/state.cjs']) fs.writeFileSync(path.join(root, ...s.split('/')), '// stub\n');
  return root;
}

test('install composes plugin.json, skills and the always-on rule, and refreshes an earlier copy', () => {
  const root = fakeKit();
  const dest = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bk-dest-')), 'bearingkit');
  const dry = install({ root, dest, dryRun: true });
  assert.ok(!fs.existsSync(dest), 'dry run writes nothing');
  assert.ok(dry.actions.some((a) => a.includes('rules')));
  install({ root, dest });
  for (const f of ['plugin.json', 'skills/bk-protocol/SKILL.md', 'skills/bk-protocol/references/x.md', 'skills/bk-spec/SKILL.md', 'scripts/detect-stack.cjs', 'scripts/record-guardrail.cjs', 'scripts/lib/state.cjs', 'rules/bearingkit.md', MARKER]) assert.ok(fs.existsSync(path.join(dest, f)), f);
  const rule = fs.readFileSync(path.join(dest, 'rules', 'bearingkit.md'), 'utf8');
  assert.ok(rule.includes('Kit root') && rule.includes(dest), 'the rule names the copy as the kit root, so skills can run the scripts');
  assert.ok(rule.startsWith('---\ntrigger: always_on\n---\n# Bearingkit'), 'rule starts with the always-on frontmatter then the body');
  assert.ok(!rule.includes('user-invocable') && !rule.includes('name: bk-protocol'), 'skill frontmatter stripped');
  assert.ok(rule.includes('## Antigravity host note') && rule.includes('view_file'), 'the host note that makes the model open SKILL.md first is appended');
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
