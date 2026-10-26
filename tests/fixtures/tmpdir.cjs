'use strict';
// A temp directory that is removed when the test file's tests are over, so a suite run leaves nothing in the OS temp
// folder. Each test file runs in a process of its own, so `after` here belongs to the file that required this module.
// Best effort: a directory Windows still holds open (EBUSY) is left behind rather than turning a passing file red.
const { after } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const made = [];
after(() => {
  for (const dir of made) {
    try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 3 }); } catch { /* left behind, see above */ }
  }
});

function tmpdir(prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  made.push(dir);
  return dir;
}

module.exports = { tmpdir };
