#!/usr/bin/env node
'use strict';
// One verb set for every host: install and update carry the store, activate and deactivate switch one project on or
// off in the host's own configuration file, status says where things stand, uninstall takes the store away. What only
// a host's own CLI may do is printed, never run (docs/hosts.md). `antigravity install|uninstall` stays as the older
// spelling of install and uninstall for that one host; `doctor` is the deeper read-only check, `evals` the harness.

const [cmd, ...args] = process.argv.slice(2);
const activation = () => require('../scripts/activation.cjs');

const commands = {
  install: () => activation().cli('install', args),
  update: () => activation().cli('update', args),
  activate: () => activation().cli('activate', args),
  deactivate: () => activation().cli('deactivate', args),
  status: () => activation().cli('status', args),
  uninstall: () => activation().cli('uninstall', args),
  antigravity: () => require('../scripts/antigravity.cjs').cli(args),
  evals: () => require('../scripts/evals.cjs').run(args),
  doctor: () => require('../scripts/doctor.cjs').cli(args),
};

// Object.hasOwn, not a truthiness test: `commands[cmd]` also resolves `constructor`, `toString` and the rest of
// Object.prototype, and those were dispatched as commands that did nothing and exited 0.
if (!Object.hasOwn(commands, String(cmd))) {
  console.error('usage: bearingkit <install|update|activate|deactivate|status|uninstall|doctor|evals|antigravity> [options]');
  process.exit(2);
}

// The call goes inside the promise: a command that throws synchronously — a host file that does not parse, a
// refused staging directory — would otherwise escape this handler and print a raw stack trace.
Promise.resolve().then(() => commands[cmd]()).catch((e) => { console.error(e && e.message ? e.message : String(e)); process.exit(1); });
