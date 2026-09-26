#!/usr/bin/env node
'use strict';
const { getItem } = require('../src/client.cjs');

const USAGE = 'usage: stock show <sku>';

async function main(argv) {
  const [cmd, ...rest] = argv;
  if (cmd === 'show' && rest.length === 1) {
    const item = await getItem(rest[0]);
    process.stdout.write(JSON.stringify(item, null, 2) + '\n');
    return 0;
  }
  process.stderr.write(USAGE + '\n');
  return 2;
}

main(process.argv.slice(2)).then(
  (code) => { process.exitCode = code; },
  (err) => { process.stderr.write(`stock: ${err.message}\n`); process.exitCode = 1; },
);
