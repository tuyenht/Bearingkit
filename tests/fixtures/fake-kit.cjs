'use strict';
// A throwaway kit: the smallest tree scripts/antigravity.cjs will copy, plus the real session-start hook, so a doctor
// run pointed at this kit exercises the bootstrap check too. Shared by the install test and the doctor test; neither
// ever points at the checkout's live plugin copy.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const HOOK = path.join(__dirname, '..', '..', 'hooks', 'session-start.cjs');

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
  fs.mkdirSync(path.join(root, 'hooks'), { recursive: true });
  fs.copyFileSync(HOOK, path.join(root, 'hooks', 'session-start.cjs'));
  return root;
}

// A byte-level fingerprint of a directory: every entry, its size, mtime and content hash. Two equal snapshots mean
// nothing under the directory was created, removed, rewritten or touched.
function snapshot(dir, base = dir) {
  const crypto = require('node:crypto');
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const p = path.join(dir, e.name);
    const rel = path.relative(base, p).split(path.sep).join('/');
    if (e.isDirectory()) { out.push(`d ${rel}`); out.push(...snapshot(p, base)); continue; }
    const st = fs.statSync(p);
    out.push(`f ${rel} ${st.size} ${st.mtimeMs} ${crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')}`);
  }
  return out;
}

// The four properties tests/antigravity-install.test.cjs proves the installer writes into the copied rule. The doctor
// test asserts the same four on a live copy before it breaks one of them; doctor itself checks them on disk.
function assertRuleComplete(rule, dest) {
  const assert = require('node:assert/strict');
  assert.ok(rule.startsWith('---\ntrigger: always_on\n---\n# Bearingkit'), 'rule starts with the always-on frontmatter then the body');
  assert.ok(!rule.includes('user-invocable') && !rule.includes('name: bk-protocol'), 'skill frontmatter stripped');
  assert.ok(rule.includes('## Antigravity host note') && rule.includes('view_file'), 'the host note that makes the model open SKILL.md first is appended');
  assert.ok(rule.includes('Kit root') && rule.includes(dest), 'the rule names the copy as the kit root, so skills can run the scripts');
}

module.exports = { fakeKit, snapshot, assertRuleComplete };
