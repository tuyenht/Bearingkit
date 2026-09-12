#!/usr/bin/env node
'use strict';
// Bearingkit has no installer: each host installs the kit with its own command (docs/hosts.md). This bin carries the
// two things a host command cannot do: the Antigravity plugin copy and the activation evals.

const [cmd, ...args] = process.argv.slice(2);

const commands = {
  antigravity: () => require('../scripts/antigravity.cjs').cli(args),
  evals: () => require('../scripts/evals.cjs').run(args),
  doctor: () => require('../scripts/doctor.cjs').cli(args),
};

if (!commands[cmd]) {
  console.error('usage: bearingkit <antigravity install|antigravity uninstall|evals|doctor> [options]');
  process.exit(2);
}

Promise.resolve(commands[cmd]()).catch((e) => { console.error(e && e.stack ? e.stack : String(e)); process.exit(1); });
