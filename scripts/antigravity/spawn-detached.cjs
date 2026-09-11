// Launches a node script fully detached from this shell (survives the tool call), logging to a file.
// Usage: node spawn-detached.cjs <logfile> <script> [args...]
'use strict';
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const [log, script, ...args] = process.argv.slice(2);
const out = fs.openSync(log, 'a');
const child = spawn(process.execPath, [script, ...args], { detached: true, stdio: ['ignore', out, out], windowsHide: true });
child.unref();
console.log('detached pid', child.pid, 'log', log);
