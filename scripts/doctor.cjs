#!/usr/bin/env node
'use strict';
// bearingkit doctor. It reads and prints; it never writes a byte, into the kit or into a host profile — the invariant
// tests/doctor.test.cjs measures by running it in a home of its own and comparing the tree before and after. Every
// install and every repair stays a command the owner types. Scope: the daily profile, which today means ~/.gemini.
//
// The Antigravity copy is the only part of an install that can silently rot: the host loads a real directory copied
// out of the checkout, and 3d7b4eb shipped one that had lost its host note. tests/antigravity-install.test.cjs proves
// the installer writes that note; only this reads the copy the host actually loads.
//
// It does not shell out to `claude`: booting a host binary to list plugins cannot be shown to write nothing, and the
// no-write invariant outranks the check. The listing is reported as not run, with the command to run it.
//
//   node bin/bearingkit.cjs doctor

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { MARKER, SCRIPTS, ruleText } = require('./antigravity.cjs');

const ROOT = path.resolve(__dirname, '..');

const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '');

function files(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? files(path.join(dir, e.name), base) : [path.relative(base, path.join(dir, e.name)).split(path.sep).join('/')]))
    .sort();
}

// Same files, same bytes. A copy made before the checkout moved on differs here, which is what "older" means once the
// copy carries no version of its own.
const sameFile = (a, b) => fs.existsSync(a) && fs.existsSync(b) && fs.readFileSync(a).equals(fs.readFileSync(b));

function sameTree(a, b) {
  const from = files(a);
  const to = files(b);
  return from.length === to.length && from.every((rel, i) => to[i] === rel && fs.readFileSync(path.join(a, rel)).equals(fs.readFileSync(path.join(b, rel))));
}

// `dest` mirrors `antigravity install --dest`: without it, a copy installed anywhere else reads as absent here, and
// the repair line doctor prints would install a second copy at the default location instead of refreshing the one
// the host actually loads.
function run({ root = ROOT, home = os.homedir(), dest: destOpt, log = () => {} } = {}) {
  // Two copies can exist: the store a project declares for itself (the way since D5 question 29) and the older
  // global copy under ~/.gemini, which Antigravity loads in every workspace. Without --dest, doctor reads whichever
  // is on disk, store first, so it never reports the copy the host is not loading.
  const store = path.join(home, '.bearingkit', 'antigravity', 'plugins', 'bearingkit');
  const global = path.join(home, '.gemini', 'config', 'plugins', 'bearingkit');
  // With neither on disk the store is the one to report missing: it is what `bearingkit install` makes now, and the
  // repair line has to be that command rather than the older one, which installs a copy every workspace would load.
  const dest = destOpt ? path.resolve(destOpt)
    : fs.existsSync(path.join(store, MARKER)) ? store
      : fs.existsSync(path.join(global, MARKER)) ? global : store;
  const refresh = destOpt || dest === global ? `node ${path.join(root, 'bin', 'bearingkit.cjs')} antigravity install${dest === global && !destOpt ? '' : ` --dest ${dest}`}` : `node ${path.join(root, 'bin', 'bearingkit.cjs')} install --host antigravity`;
  const checks = [];
  const add = (name, ok, fix) => { checks.push({ name, ok, fix }); return ok; };

  if (add(`antigravity copy present (${destOpt ? 'named by --dest' : dest === store ? 'store' : 'global copy'})`, fs.existsSync(path.join(dest, MARKER)), refresh)) {
    add('antigravity copy marker names this kit', read(path.join(dest, MARKER)).trim() === root, refresh);
    // The rule is generated from the protocol, the host note and the kit root, so the only honest comparison is with
    // the text the installer would write now; checking for a few markers passed a note whose wording had changed.
    const rule = read(path.join(dest, 'rules', 'bearingkit.md'));
    add('antigravity rule carries the protocol, the host note and the kit root, as the installer writes them now',
      rule === ruleText(root, dest), refresh);
    // The skills in the copy run these scripts, so a script older than the checkout is as stale as an older skill.
    add('antigravity copy of the scripts the skills call matches this checkout',
      SCRIPTS.every((s) => sameFile(path.join(root, ...s.split('/')), path.join(dest, ...s.split('/')))), refresh);
    add('antigravity copy of skills/ matches this checkout', sameTree(path.join(root, 'skills'), path.join(dest, 'skills')), refresh);
  }

  // The bootstrap every other host installs through its own command: if this stops printing the protocol, or stops
  // naming the kit root the skills run their scripts from, the plugin is installed and still inert.
  const hook = path.join(root, 'hooks', 'session-start.cjs');
  const r = spawnSync(process.execPath, [hook], { encoding: 'utf8' });
  let context = '';
  try { context = JSON.parse(r.stdout).hookSpecificOutput.additionalContext; } catch { context = ''; }
  add('session-start bootstrap prints the protocol and the kit root',
    r.status === 0 && context.includes('<bearingkit-protocol>') && context.includes(root), `node ${hook}`);

  add('claude code plugin listing: not read, it needs the host', null, 'claude plugin list');

  for (const c of checks) log(`${c.ok === null ? 'skip' : c.ok ? 'ok  ' : 'FAIL'}  ${c.name}`);
  const commands = [...new Set(checks.filter((c) => c.ok !== true).map((c) => c.fix))];
  if (commands.length) log('\nrun these yourself; doctor changes nothing:');
  for (const c of commands) log(`  ${c}`);
  return { ok: checks.every((c) => c.ok !== false), checks, dest };
}

function cli(argv = []) {
  const i = argv.indexOf('--dest');
  const dest = i !== -1 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : undefined;
  if (!run({ dest, log: (l) => process.stdout.write(l + '\n') }).ok) process.exitCode = 1;
}

if (require.main === module) cli();

module.exports = { run, cli, sameTree, files };
