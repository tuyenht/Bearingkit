'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(__dirname, '..', 'core', 'skills');
const ALLOWED_KEYS = new Set(['name', 'description', 'context', 'background', 'user-invocable', 'disable-model-invocation', 'allowed-tools']);

function frontmatter(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n');
  assert.equal(lines[0], '---', file + ': frontmatter must open on line 1');
  const end = lines.indexOf('---', 1);
  assert.ok(end > 1, file + ': frontmatter must close');
  const entries = [];
  for (const line of lines.slice(1, end)) {
    if (!line.trim()) continue;
    const m = line.match(/^([A-Za-z-]+):\s?(.*)$/);
    assert.ok(m, file + ': every frontmatter line is key: value, got ' + JSON.stringify(line));
    entries.push([m[1], m[2]]);
  }
  return { entries, body: lines.slice(end + 1).join('\n') };
}

// Antigravity's YAML parser is strict: a bare value with ": " inside is a parse error and the skill is dropped
// (ten of eleven skills vanished on 2026-09-10). Claude Code tolerated it, which is why it went unnoticed.
test('every skill frontmatter is strict-YAML safe: values with ": " are quoted, keys are known', () => {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const { entries } = frontmatter(file);
    for (const [key, value] of entries) {
      assert.ok(ALLOWED_KEYS.has(key), name + ': unknown frontmatter key ' + key);
      const quoted = /^"(?:[^"\\]|\\.)*"$/.test(value) || /^'[^']*'$/.test(value);
      if (/:\s/.test(value)) assert.ok(quoted, name + ': ' + key + ' contains ": " and must be quoted');
      if (quoted && value.startsWith('"')) assert.doesNotMatch(value.slice(1, -1), /(^|[^\\])"/, name + ': unescaped quote inside ' + key);
    }
  }
});

test('every skill has a name matching its folder and a description within the budget', () => {
  for (const name of fs.readdirSync(dir)) {
    const file = path.join(dir, name, 'SKILL.md');
    if (!fs.existsSync(file)) continue;
    const { entries } = frontmatter(file);
    const get = (k) => { const e = entries.find(([key]) => key === k); return e ? e[1].replace(/^"(.*)"$/, '$1') : null; };
    assert.equal(get('name'), name, name + ': name must equal the folder');
    const d = get('description');
    assert.ok(d && d.length > 0, name + ': description required');
    assert.ok(d.length <= 300, name + ': description ' + d.length + ' chars, budget 300');
    if (name !== 'bk-protocol') assert.match(d, /Use when/, name + ': description carries cues ("Use when")');
  }
});
