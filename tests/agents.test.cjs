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
