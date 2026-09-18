#!/usr/bin/env node
'use strict';
// Lists the items of an upstream source for the item-level inventory of spec §5.2, and checks an inventory file
// against them, so "every item has a row" is a measurement rather than a claim
// (docs/plans/2026-09-18-item-inventory.md). An item is a folder with a SKILL.md (its whole subtree belongs to it),
// a commands/, agents/ or rules/ markdown file, a hooks.json, a Cursor rule file, or a plugin folder holding none of
// those. `rows` checks that each row of a source obeys §5.2, and `totals` that the totals table matches the rows.
//
//   node scripts/inventory-items.cjs list <source dir>
//   node scripts/inventory-items.cjs check <inventory.md> <source dir> <label>
//   node scripts/inventory-items.cjs rows <inventory.md> <label> [--text-allowed]
//   node scripts/inventory-items.cjs totals <inventory.md>

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
      // A markdown file under rules/ is a rule set too: the Spartan toolkit ships 29 of them, and addyosmani one.
      else if (md && segments.includes('rules')) kind = 'rule';
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

// What a row may name as its target (spec §5.1): the eighteen skills, the optional packs, `kit` for the kit's own
// machinery (install channel, test format, benchmark), and `—` for a drop that lands nowhere.
const TARGETS = new Set([
  'bk-protocol', 'bk-map', 'bk-research', 'bk-spec', 'bk-audit', 'bk-plan', 'bk-build', 'bk-test', 'bk-debug',
  'bk-review', 'bk-ship', 'bk-close', 'bk-next', 'bk-design', 'bk-perf', 'bk-db', 'bk-ops', 'bk-setup',
  'bk-product', 'bk-ux', 'bk-agent', 'bk-deps', 'bk-preview', 'bk-guard', 'kit', '—',
]);
const DECISIONS = ['absorb', 'idea', 'drop'];
const cellsOf = (line) => line.split('|').slice(1, -1).map((c) => c.trim());

// A row is `| n | `<label>:<id>` | kind | lines | what | target | decision | reason |`. Lines that do not start with a
// number (a mirror table, the totals table) are not rows.
function rows(inventoryText, label, { textAllowed = false } = {}) {
  const counts = { absorb: 0, idea: 0, drop: 0 };
  const problems = [];
  const seen = new Set();
  for (const line of inventoryText.split('\n')) {
    if (!/^\| \d+ \| /.test(line) || !line.includes('`' + label + ':')) continue;
    const cells = cellsOf(line);
    const id = (cells[1] || '').replace(/`/g, '');
    if (cells.length !== 8) { problems.push(`${id}: ${cells.length} cells, not 8 (a | inside a cell?)`); continue; }
    const [, , , , what, target, decision, reason] = cells;
    if (seen.has(id)) problems.push(`${id}: duplicate`);
    seen.add(id);
    if (!TARGETS.has(target)) problems.push(`${id}: unknown target "${target}"`);
    if (!what || !reason) problems.push(`${id}: empty cell`);
    if (!DECISIONS.includes(decision)) { problems.push(`${id}: unknown decision "${decision}"`); continue; }
    if (decision !== 'drop' && target === '—') problems.push(`${id}: ${decision} with no target`);
    if (decision === 'absorb' && !textAllowed) problems.push(`${id}: absorb where the licence allows no text`);
    counts[decision]++;
  }
  return { counts, problems };
}

// Counts per item, as the totals table does: a `group` row counts its files (the Dòng cell), and a mirror-table line
// (`| `<label>:<id>` | <original row> | <identical?> | <decision> |`) counts one item with its original's decision.
function totals(inventoryText) {
  const lines = inventoryText.split('\n');
  const counted = {};
  const add = (label, decision, n) => {
    const c = (counted[label] ||= { items: 0, absorb: 0, idea: 0, drop: 0 });
    if (!DECISIONS.includes(decision)) return;
    c.items += n;
    c[decision] += n;
  };
  for (const line of lines) {
    const m = line.match(/^\| \d+ \| `([a-z0-9-]+):/);
    if (m) {
      const cells = cellsOf(line);
      if (cells.length === 8) add(m[1], cells[6], cells[2] === 'group' ? Number(cells[3]) : 1);
      continue;
    }
    const mirror = line.match(/^\| `([a-z0-9-]+):[^`]+` \| \d+ \| [^|]+ \| (absorb|idea|drop) \|$/);
    if (mirror) add(mirror[1], mirror[2], 1);
  }
  const table = {};
  for (const line of lines) {
    const m = line.match(/^\| [^|]+ \| `([a-z0-9-]+)` \| (\d+) \| (\d+) \| (\d+) \| (\d+) \|/);
    if (m) table[m[1]] = { items: +m[2], absorb: +m[3], idea: +m[4], drop: +m[5] };
  }
  const f = (c) => `${c.items}/${c.absorb}/${c.idea}/${c.drop}`;
  const mismatches = [];
  for (const [label, c] of Object.entries(counted)) {
    if (!table[label]) mismatches.push(`${label}: missing from the totals table`);
    else if (f(table[label]) !== f(c)) mismatches.push(`${label}: table ${f(table[label])}, rows ${f(c)}`);
  }
  for (const label of Object.keys(table)) if (!counted[label]) mismatches.push(`${label}: in the totals table, no rows`);
  return { counted, table, mismatches };
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
  } else if (cmd === 'rows' && a && b) {
    const { counts, problems } = rows(fs.readFileSync(path.resolve(a), 'utf8'), b, { textAllowed: process.argv.includes('--text-allowed') });
    for (const p of problems) process.stdout.write(`problem ${p}\n`);
    process.stdout.write(`${b}: ${counts.absorb} absorb, ${counts.idea} idea, ${counts.drop} drop, ${problems.length} problems\n`);
    process.exitCode = problems.length ? 1 : 0;
  } else if (cmd === 'totals' && a) {
    const { counted, mismatches } = totals(fs.readFileSync(path.resolve(a), 'utf8'));
    for (const m of mismatches) process.stdout.write(`mismatch ${m}\n`);
    const all = Object.values(counted).reduce((s, c) => ({ items: s.items + c.items, absorb: s.absorb + c.absorb, idea: s.idea + c.idea, drop: s.drop + c.drop }), { items: 0, absorb: 0, idea: 0, drop: 0 });
    process.stdout.write(`${Object.keys(counted).length} sources, ${all.items} items: ${all.absorb} absorb, ${all.idea} idea, ${all.drop} drop, ${mismatches.length} mismatches\n`);
    process.exitCode = mismatches.length ? 1 : 0;
  } else {
    process.stdout.write('usage: inventory-items.cjs list <source dir> | check <inventory.md> <source dir> <label> | rows <inventory.md> <label> [--text-allowed] | totals <inventory.md>\n');
    process.exitCode = 2;
  }
}

module.exports = { list, check, rows, totals, TARGETS };
