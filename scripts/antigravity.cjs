#!/usr/bin/env node
'use strict';
// Antigravity install. The host scans ~/.gemini/config/plugins/ and does not follow directory junctions (isolated on
// 2.0, 2026-09-11), so the kit is copied into a real directory: plugin.json, skills/ and an always-on rule that
// carries the protocol body. Running install again refreshes the copy; uninstall removes only a directory this
// script created, which it recognises by its marker file. Nothing else under ~/.gemini is touched.
//
//   node scripts/antigravity.cjs install [--dest <dir>] [--dry-run]
//   node scripts/antigravity.cjs uninstall [--dest <dir>] [--dry-run]

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { stripFrontmatter } = require('../hooks/session-start.cjs');

const ROOT = path.resolve(__dirname, '..');
const MARKER = '.bearingkit-copy';

function defaultDest() { return path.join(os.homedir(), '.gemini', 'config', 'plugins', 'bearingkit'); }

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { out[a.slice(2)] = next; i++; } else { out[a.slice(2)] = true; }
    } else out._.push(a);
  }
  return out;
}

// Antigravity has no skill tool, so the protocol alone leaves the model naming a skill and exploring the code instead
// of opening it (measured on 2026-09-10 and again on 2026-09-11 after this note was dropped from the v2 copy). The
// note below restored the small-change and feature intents to 10/10 on the sixty-prompt set in Phase 1.
const HOST_NOTE = [
  '## Antigravity host note',
  '',
  'This host has no skill tool. Invoking a skill means opening its file, `skills/<name>/SKILL.md` inside the bearingkit plugin (the path the Customizations panel shows), with `view_file` as the first action, and then following it. That holds for a one-line rename as much as for a feature: a small change still opens `bk-build`, a new capability opens `bk-spec`, before any list, grep, read or edit of the project. Reading a skill to explain what it does is not an invocation.',
].join('\n');

function ruleText(root) {
  const protocol = fs.readFileSync(path.join(root, 'skills', 'bk-protocol', 'SKILL.md'), 'utf8');
  return '---\ntrigger: always_on\n---\n' + stripFrontmatter(protocol).trim() + '\n\n' + HOST_NOTE + '\n';
}

// The copy is composed from the checkout: the Antigravity manifest, every skill folder (files dereferenced), and the
// protocol as an always-on rule. hooks.json is not written; the eval driver adds its own when a run is armed.
function install(opts = {}) {
  const root = opts.root || ROOT;
  const dest = opts.dest || defaultDest();
  const log = opts.log || (() => {});
  const dryRun = Boolean(opts.dryRun);
  const marker = path.join(dest, MARKER);
  if (fs.existsSync(dest) && !fs.existsSync(marker)) throw new Error(`${dest} exists and was not created by bearingkit; remove it yourself or pass --dest`);
  const manifest = path.join(root, '.antigravity', 'plugin.json');
  const skills = path.join(root, 'skills');
  for (const p of [manifest, skills]) if (!fs.existsSync(p)) throw new Error(`missing ${p}`);
  const actions = [];
  if (fs.existsSync(dest)) actions.push(`- remove previous copy ${dest}`);
  actions.push(`+ copy ${manifest} → ${path.join(dest, 'plugin.json')}`);
  actions.push(`+ copy ${skills} → ${path.join(dest, 'skills')} (dereferenced)`);
  actions.push(`+ write ${path.join(dest, 'rules', 'bearingkit.md')} (protocol body, trigger: always_on)`);
  actions.push(`+ write ${marker}`);
  for (const a of actions) log(a);
  if (!dryRun) {
    if (fs.existsSync(dest)) fs.rmSync(dest, { recursive: true, force: true });
    fs.mkdirSync(path.join(dest, 'rules'), { recursive: true });
    fs.copyFileSync(manifest, path.join(dest, 'plugin.json'));
    fs.cpSync(skills, path.join(dest, 'skills'), { recursive: true, dereference: true });
    fs.writeFileSync(path.join(dest, 'rules', 'bearingkit.md'), ruleText(root));
    fs.writeFileSync(marker, root + '\n');
  }
  return { dest, actions, dryRun };
}

function uninstall(opts = {}) {
  const dest = opts.dest || defaultDest();
  const log = opts.log || (() => {});
  const dryRun = Boolean(opts.dryRun);
  if (!fs.existsSync(dest)) { log(`= nothing at ${dest}`); return { dest, removed: false, reason: 'absent' }; }
  if (!fs.existsSync(path.join(dest, MARKER))) { log(`! kept ${dest}: not created by bearingkit`); return { dest, removed: false, reason: 'foreign' }; }
  log(`- remove ${dest}`);
  if (!dryRun) fs.rmSync(dest, { recursive: true, force: true });
  return { dest, removed: !dryRun, reason: dryRun ? 'dry-run' : 'removed' };
}

function cli(argv) {
  const args = parseArgs(argv);
  const cmd = args._[0];
  const opts = { dest: args.dest ? path.resolve(String(args.dest)) : undefined, dryRun: Boolean(args['dry-run']), log: (l) => process.stdout.write(l + '\n') };
  if (cmd === 'install') { const r = install(opts); process.stdout.write(`${r.dryRun ? 'dry run: ' : ''}bearingkit copied for Antigravity at ${r.dest}\n`); return; }
  if (cmd === 'uninstall') { uninstall(opts); return; }
  process.stderr.write('usage: bearingkit antigravity <install|uninstall> [--dest <dir>] [--dry-run]\n');
  process.exitCode = 2;
}

if (require.main === module) cli(process.argv.slice(2));

module.exports = { install, uninstall, cli, defaultDest, ruleText, MARKER };
