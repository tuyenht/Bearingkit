#!/usr/bin/env node
'use strict';
// Lists the items of an upstream source for the item-level inventory of spec §5.2, and checks an inventory file
// against them, so "every item has a row" is a measurement rather than a claim
// (docs/plans/2026-09-18-item-inventory.md). An item is a folder with a SKILL.md (its whole subtree belongs to it),
// a commands/ or agents/ markdown file, a hooks.json, a Cursor rule file, or a plugin folder holding none of those.
//
//   node scripts/inventory-items.cjs list <source dir>
//   node scripts/inventory-items.cjs check <inventory.md> <source dir> <label>

const fs = require('node:fs');
const path = require('node:path');

const SKIP = new Set(['.git', 'node_modules']);

function list(root) {
  const items = [];
  const rel = (p) => path.relative(root, p).split(path.sep).join('/');
  const lines = (f) => fs.readFileSync(f, 'utf8').split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    if (entries.some((e) => e.isFile() && e.name === 'SKILL.md')) {
      items.push({ kind: 'skill', id: rel(dir), lines: lines(path.join(dir, 'SKILL.md')) });
      return;
    }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(p); continue; }
      const segments = rel(p).split('/');
      const md = e.name.endsWith('.md') && e.name !== 'README.md';
      let kind = null;
      if (e.name === 'hooks.json') kind = 'hooks';
      else if (e.name === '.cursorrules' || e.name.endsWith('.mdc')) kind = 'rule';
      else if (md && segments.includes('commands')) kind = 'command';
      else if (md && segments.includes('agents')) kind = 'agent';
      if (kind) items.push({ kind, id: rel(p), lines: lines(p) });
    }
  }
  walk(root);
  // A plugin folder with nothing listable inside (an MCP or LSP configuration, an output style) still gets a row.
  // Plugins are the folders under plugins/ or external_plugins/: in claude-plugins-official 14 of the 39 under
  // plugins/ carry no .claude-plugin/plugin.json, so the manifest cannot be what defines one.
  for (const group of ['plugins', 'external_plugins']) {
    const dir = path.join(root, group);
    if (!fs.existsSync(dir)) continue;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const id = `${group}/${e.name}`;
      if (!items.some((i) => i.id.startsWith(id + '/'))) items.push({ kind: 'plugin', id, lines: 0 });
    }
  }
  return items.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

// An item is covered when the inventory names it in backticks as `<label>:<id>`: the label keeps two sources with
// the same relative path apart, and the closing backtick keeps an id from matching a longer one.
function check(inventoryText, items, label) {
  return items.filter((i) => !inventoryText.includes('`' + label + ':' + i.id + '`')).map((i) => i.id);
}

if (require.main === module) {
  const [cmd, a, b, c] = process.argv.slice(2);
  if (cmd === 'list' && a) {
    const items = list(path.resolve(a));
    for (const i of items) process.stdout.write(`${i.kind.padEnd(8)} ${String(i.lines).padStart(5)}  ${i.id}\n`);
    const byKind = {};
    for (const i of items) byKind[i.kind] = (byKind[i.kind] || 0) + 1;
    process.stdout.write(`${items.length} items: ${Object.entries(byKind).map(([k, n]) => `${k} ${n}`).join(', ')}\n`);
  } else if (cmd === 'check' && a && b && c) {
    const items = list(path.resolve(b));
    const missing = check(fs.readFileSync(path.resolve(a), 'utf8'), items, c);
    for (const m of missing) process.stdout.write(`missing ${c}:${m}\n`);
    process.stdout.write(`${items.length - missing.length}/${items.length} items of ${c} have a row\n`);
    process.exitCode = missing.length ? 1 : 0;
  } else {
    process.stdout.write('usage: inventory-items.cjs list <source dir> | check <inventory.md> <source dir> <label>\n');
    process.exitCode = 2;
  }
}

module.exports = { list, check };
