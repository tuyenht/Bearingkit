'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');

function frontmatter(text) {
  const lines = text.split('\n');
  assert.equal(lines[0], '---');
  const end = lines.indexOf('---', 1);
  const out = {};
  for (const line of lines.slice(1, end)) { const m = line.match(/^([A-Za-z-]+):\s?(.*)$/); if (m) out[m[1]] = m[2]; }
  return out;
}

// Spec §12 gives the four agent listings 300 tokens. On 2026-09-17 `/context` read them at 116, 110, 108 and 80
// (414) for descriptions of 269, 247, 254 and 210 characters, the name and tool list adding about 25 each; 140
// characters keeps an agent near 75. What an agent must not do lives in its body, which the listing never loads.
test('every agent description fits the listing budget', () => {
  for (const f of fs.readdirSync(path.join(root, 'agents'))) {
    const fm = frontmatter(fs.readFileSync(path.join(root, 'agents', f), 'utf8'));
    assert.ok(fm.description.length <= 140, `agents/${f}: description is ${fm.description.length} characters, budget 140`);
  }
});

// personas.md is the single source; agents/ carries one hand-written file per persona for hosts with agent definitions.
test('every persona has an agent file with the same name, a description and a model', () => {
  const personas = fs.readFileSync(path.join(root, 'skills', 'bk-protocol', 'references', 'personas.md'), 'utf8');
  const names = [...personas.matchAll(/^## (bk-[a-z-]+)$/gm)].map((m) => m[1]);
  assert.ok(names.length >= 4, 'personas.md lists the personas');
  for (const name of names) {
    const file = path.join(root, 'agents', name + '.md');
    assert.ok(fs.existsSync(file), 'agents/' + name + '.md exists');
    const fm = frontmatter(fs.readFileSync(file, 'utf8'));
    assert.equal(fm.name, name);
    assert.ok(fm.description && fm.description.length > 20, name + ': description');
    assert.ok(fm.model, name + ': model');
  }
  for (const f of fs.readdirSync(path.join(root, 'agents'))) assert.ok(names.includes(f.replace(/\.md$/, '')), 'agents/' + f + ' has a persona');
});
