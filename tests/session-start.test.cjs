'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');
const { buildContext, output, stripFrontmatter } = require('../hooks/session-start.cjs');

test('the bootstrap carries the protocol body without its frontmatter', () => {
  const ctx = buildContext();
  assert.ok(ctx.startsWith('<bearingkit-protocol>') && ctx.endsWith('</bearingkit-protocol>'));
  assert.ok(!/^---\n/m.test(ctx.split('\n').slice(0, 4).join('\n')), 'no frontmatter fence in the context');
  assert.ok(!/user-invocable/.test(ctx), 'frontmatter keys stripped');
  for (const heading of ['## Autonomy Gate', '## Router', '## Evidence', '## Security baseline', '## Host notes']) assert.ok(ctx.includes(heading), heading);
  assert.ok(ctx.includes('Kit root') && ctx.includes(path.resolve(__dirname, '..')), 'the injected context names the kit root so skills can run detect-stack');
  assert.equal(stripFrontmatter('---\na: b\n---\n\nbody\n'), 'body\n');
  assert.equal(stripFrontmatter('body only'), 'body only');
});

// A request that is one line stating a symptom ("Uploads over 5 MB silently disappear.") was read as more session
// context, and the model answered "what would you like to work on?" instead of routing it: on 2026-09-10 under v1, and
// again in the gate of 2026-09-16. v1 had fixed it with this clause, verified by a rerun; the v2 restructure dropped the
// clause along with the old block format, and nothing tested for it.
test('the bootstrap says that a one-line symptom after it is the request', () => {
  const opening = buildContext().split('\n')[1];
  assert.match(opening, /Everything after the closing tag is the user's request, even a single line that only states a symptom\./);
});

test('the output carries the three keys the hosts read, with the same text', () => {
  const o = output('X');
  assert.equal(o.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.equal(o.hookSpecificOutput.additionalContext, 'X');
  assert.equal(o.additionalContext, 'X');
  assert.equal(o.additional_context, 'X');
});

test('the script prints one JSON line from any working directory', () => {
  const r = spawnSync(process.execPath, [path.join(__dirname, '..', 'hooks', 'session-start.cjs')], { cwd: os.tmpdir(), encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.trim().split('\n');
  assert.equal(lines.length, 1);
  const o = JSON.parse(lines[0]);
  assert.ok(o.hookSpecificOutput.additionalContext.includes('## Autonomy Gate'));
});
