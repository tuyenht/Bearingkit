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
