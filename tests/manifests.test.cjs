'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..');
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));

// One name and one version across package.json and every host manifest; a mismatch is what a marketplace rejects.
// Claude Code is the exception for the version: "Setting `version` pins the plugin", and an install then keeps its
// cached copy until the string changes, so neither auto-update nor `claude plugin update` reaches a new commit;
// without it "Claude Code uses the source's resolved commit SHA" (plugin-marketplaces page, read 2026-09-24;
// docs/compat/2026-09-24-claude-plugin-install-local-path.md). The page also warns against a version in both
// plugin.json and the marketplace entry, so neither carries one.
test('every host manifest carries the package name and version, except that Claude Code follows commits', () => {
  const pkg = read('package.json');
  for (const file of ['.claude-plugin/plugin.json', '.codex-plugin/plugin.json', '.cursor-plugin/plugin.json', 'gemini-extension.json', '.antigravity/plugin.json']) {
    const m = read(file);
    assert.equal(m.name, pkg.name, file + ': name');
    if (file === '.claude-plugin/plugin.json') assert.equal(m.version, undefined, file + ': no version, so installs follow commits');
    else assert.equal(m.version, pkg.version, file + ': version');
  }
  const market = read('.claude-plugin/marketplace.json');
  const entry = market.plugins.find((p) => p.name === pkg.name);
  assert.ok(entry, 'marketplace.json lists the plugin');
  assert.equal(entry.version, undefined, 'marketplace.json: no version on the plugin entry');
});

// Installed once for the machine, used only where the owner says (D5 question 29): the manifest ships the plugin
// switched off, so an install at the CLI's default scope enables it nowhere, and `bearingkit activate` is what
// turns it on for one project. "Set `defaultEnabled: false` in `plugin.json` to ship a plugin that installs
// disabled" — Claude Code plugins reference, quoted in docs/compat/2026-09-19-per-project-activation.md (C5).
test('the Claude Code manifest ships the plugin disabled, so activation is per project', () => {
  assert.equal(read('.claude-plugin/plugin.json').defaultEnabled, false);
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
