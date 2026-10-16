'use strict';
// Lint for src/ and test/: no `var`, no trailing whitespace, lines of at most 100 characters.
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

function files(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) return files(full);
    return /\.c?js$/.test(e.name) ? [full] : [];
  });
}

const problems = [];
for (const file of [...files(path.join(ROOT, 'src')), ...files(path.join(ROOT, 'test'))]) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach((line, i) => {
    if (/^\s*var\s/.test(line)) problems.push(`${rel}:${i + 1}: use const or let, not var`);
    if (/[ \t]+$/.test(line)) problems.push(`${rel}:${i + 1}: trailing whitespace`);
    if (line.length > 100) problems.push(`${rel}:${i + 1}: line longer than 100 characters`);
  });
}

for (const p of problems) console.error(p);
if (problems.length) {
  console.error(`lint: ${problems.length} problem${problems.length === 1 ? '' : 's'}`);
  process.exit(1);
}
console.log('lint: ok');
