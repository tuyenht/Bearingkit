'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

// One name and one version across package.json and every host manifest; a mismatch is what a marketplace rejects.
test('every host manifest carries the package name and version', () => {
  const pkg = read('package.json');
  for (const file of ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json', 'gemini-extension.json', '.antigravity/plugin.json']) {
    const m = read(file);
    assert.equal(m.name, pkg.name, file + ': name');
    assert.equal(m.version, pkg.version, file + ': version');
  }
  const market = read('.claude-plugin/marketplace.json');
  assert.ok(market.plugins.some((p) => p.name === pkg.name), 'marketplace.json lists the plugin');
});

test('every path a manifest or hook names exists in the checkout', () => {
  for (const file of ['.codex-plugin/plugin.json', '.cursor-plugin/plugin.json']) {
    const m = read(file);
    for (const key of ['skills', 'agents', 'hooks']) if (m[key]) assert.ok(fs.existsSync(path.join(root, m[key])), file + ': ' + key + ' → ' + m[key]);
  }
  const claudeHooks = read('hooks/hooks.json');
  const cmd = claudeHooks.hooks.SessionStart[0].hooks[0].command;
  assert.match(cmd, /session-start\.cjs/, 'Claude SessionStart runs the bootstrap script');
  assert.ok(fs.existsSync(path.join(root, 'hooks', 'session-start.cjs')));
  const cursorHooks = read('hooks/hooks-cursor.json');
  assert.match(cursorHooks.hooks.sessionStart[0].command, /session-start\.cjs/);
  const gemini = read('gemini-extension.json');
  const contextFile = path.join(root, gemini.contextFileName);
  assert.ok(fs.existsSync(contextFile), 'Gemini context file exists');
  for (const line of fs.readFileSync(contextFile, 'utf8').split('\n').filter((l) => l.startsWith('@'))) {
    assert.ok(fs.existsSync(path.join(root, line.slice(1))), 'GEMINI.md import exists: ' + line);
  }
});
