#!/usr/bin/env node
'use strict';

const [cmd, ...args] = process.argv.slice(2);

const commands = {
  install: () => require('../scripts/install.cjs').install(args),
  uninstall: () => require('../scripts/install.cjs').uninstall(args),
  doctor: () => {
    console.error('doctor arrives in Phase 2');
    process.exit(2);
  },
  evals: () => require('../scripts/evals.cjs').run(args),
};

if (!commands[cmd]) {
  console.error('usage: bearingkit <install|uninstall|doctor|evals> [--dev <repo>] [--config-dir <dir>] [--dry-run]');
  process.exit(2);
}

Promise.resolve()
  .then(() => commands[cmd]())
  .catch((e) => {
    console.error(e && e.message ? e.message : String(e));
    process.exit(1);
  });
