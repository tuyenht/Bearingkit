'use strict';
// Builds the wrapper plugin that lets the runner load the two source skills of shell.md, which ship for Antigravity
// (`.agent/skills/`) with no Claude Code plugin manifest: `_build/wrappers/antigravity-core-shell/` (untracked) with
// a manifest and byte-for-byte copies of the two SKILL.md files as committed at the pin. Not the source "as it ships":
// the manifest is the kit's. The runner's checkSources verifies the pin and the copies before every S run.
// Usage, from the repository root: node evals/bench/shell-01-src/wrap.cjs
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const task = JSON.parse(fs.readFileSync(path.join(__dirname, 'task.json'), 'utf8'));
const src = task.sources[0];
const clone = path.join(ROOT, src.wraps.clone);
const pin = JSON.parse(fs.readFileSync(path.join(ROOT, 'upstream', 'sources.json'), 'utf8')).sources.find((s) => s.name === src.source).sha;
const head = String(spawnSync('git', ['rev-parse', 'HEAD'], { cwd: clone, encoding: 'utf8' }).stdout || '').trim();
if (head !== pin) { console.error(`${src.wraps.clone} is at ${head.slice(0, 12) || '?'}, pinned ${pin.slice(0, 12)}: not built`); process.exit(1); }
const dst = path.join(ROOT, src.dir);
fs.rmSync(dst, { recursive: true, force: true });
fs.mkdirSync(path.join(dst, '.claude-plugin'), { recursive: true });
fs.writeFileSync(path.join(dst, '.claude-plugin', 'plugin.json'), JSON.stringify({
  name: src.plugin,
  version: '0.0.0',
  description: `Measurement wrapper, not a release: ${Object.values(src.wraps.files).join(' and ')} of ${src.source} at ${pin.slice(0, 12)}, copied unchanged.`,
}, null, 2) + '\n');
for (const [to, from] of Object.entries(src.wraps.files)) {
  fs.mkdirSync(path.dirname(path.join(dst, to)), { recursive: true });
  // The committed file at the pin, not the working tree (which a line-ending conversion may have changed).
  const blob = spawnSync('git', ['cat-file', 'blob', `${pin}:${from}`], { cwd: clone, maxBuffer: 1 << 26 });
  if (blob.status !== 0) { console.error(`${from}: not in ${src.wraps.clone} at the pin`); process.exit(1); }
  fs.writeFileSync(path.join(dst, to), blob.stdout);
}
console.log(`built ${src.dir} from ${src.wraps.clone}@${pin.slice(0, 12)}: ${Object.keys(src.wraps.files).join(', ')}`);
