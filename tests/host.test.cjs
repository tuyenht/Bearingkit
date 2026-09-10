'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { parse, format } = require('../core/hooks/lib/host.cjs');

const fx = (n) => require(`./fixtures/payloads/${n}.json`);

test('claude prompt payload', () => {
  const e = parse(fx('claude-prompt'));
  assert.equal(e.host, 'claude');
  assert.equal(e.event, 'prompt');
  assert.equal(e.sessionId, 's1');
  assert.equal(e.cwd, 'C:/x');
  assert.equal(e.isSubagent, false);
  assert.equal(e.prompt, 'add invoices');
  assert.equal(e.tool, null);
});

test('claude pre-tool inside a subagent', () => {
  const e = parse(fx('claude-subagent-pretool'));
  assert.equal(e.event, 'pre-tool');
  assert.equal(e.isSubagent, true);
  assert.equal(e.tool.name, 'Bash');
  assert.equal(e.tool.args.command, 'git push');
});

test('claude post-compact and session-start', () => {
  assert.equal(parse(fx('claude-postcompact')).event, 'post-compact');
  assert.equal(parse({ session_id: 's', cwd: 'C:/x', hook_event_name: 'SessionStart' }).event, 'session-start');
});

test('antigravity pre-invocation', () => {
  const e = parse(fx('antigravity-preinvocation'));
  assert.equal(e.host, 'antigravity');
  assert.equal(e.event, 'pre-invocation');
  assert.equal(e.sessionId, 'c1');
  assert.equal(e.cwd, 'C:/x');
});

test('antigravity pre-tool', () => {
  const e = parse(fx('antigravity-pretool'));
  assert.equal(e.event, 'pre-tool');
  assert.equal(e.tool.name, 'run_command');
  assert.equal(e.tool.args.command, 'git push');
});

test('missing session id falls back to a stable id per cwd and day', () => {
  const a = parse({ hook_event_name: 'UserPromptSubmit', cwd: 'C:/x' });
  const b = parse({ hook_event_name: 'UserPromptSubmit', cwd: 'C:/x' });
  assert.equal(a.sessionId, b.sessionId);
  assert.match(a.sessionId, /^[0-9a-f]{12}$/);
});

test('format inject on both hosts', () => {
  assert.deepEqual(format('claude', 'prompt', { inject: 'X' }), { hookSpecificOutput: { hookEventName: 'UserPromptSubmit', additionalContext: 'X' } });
  assert.deepEqual(format('claude', 'session-start', { inject: 'X' }), { hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: 'X' } });
  assert.deepEqual(format('claude', 'post-compact', { inject: 'X' }), { hookSpecificOutput: { hookEventName: 'PostCompact', additionalContext: 'X' } });
  assert.deepEqual(format('antigravity', 'pre-invocation', { inject: 'X' }), { injectSteps: [{ ephemeralMessage: 'X' }] });
});

test('format deny on both hosts', () => {
  const c = format('claude', 'pre-tool', { deny: 'why' });
  assert.equal(c.hookSpecificOutput.permissionDecision, 'deny');
  assert.equal(c.hookSpecificOutput.permissionDecisionReason, 'why');
  assert.deepEqual(format('antigravity', 'pre-tool', { deny: 'why' }), { decision: 'deny', reason: 'why' });
});

test('format nothing, and antigravity post-tool is always empty', () => {
  assert.deepEqual(format('claude', 'prompt', {}), {});
  assert.deepEqual(format('antigravity', 'post-tool', { inject: 'ignored' }), {});
  assert.deepEqual(format('claude', 'pre-tool', { inject: 'not an inject event' }), {});
});
