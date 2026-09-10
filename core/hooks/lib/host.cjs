'use strict';
// Host payload adapters. Claude Code sends snake_case JSON (session_id, hook_event_name, tool_name, tool_input);
// Antigravity sends camelCase (conversationId, toolCall.name, toolCall.args). Field names on the Antigravity side
// come from its built-in customization docs and are confirmed by compatibility test #7.

const crypto = require('node:crypto');

const CLAUDE_EVENTS = {
  SessionStart: 'session-start',
  UserPromptSubmit: 'prompt',
  PreCompact: 'pre-compact',
  PostCompact: 'post-compact',
  PreToolUse: 'pre-tool',
  PostToolUse: 'post-tool',
  Stop: 'stop',
};
const ANTIGRAVITY_EVENTS = {
  PreInvocation: 'pre-invocation',
  PostInvocation: 'post-invocation',
  PreToolUse: 'pre-tool',
  PostToolUse: 'post-tool',
  Stop: 'stop',
};
const CLAUDE_NAMES = Object.fromEntries(Object.entries(CLAUDE_EVENTS).map(([k, v]) => [v, k]));
const INJECT_EVENTS_CLAUDE = new Set(['session-start', 'prompt', 'post-compact']);

const norm = (p) => String(p || process.cwd()).replace(/\\/g, '/');
const fallbackId = (cwd) => crypto.createHash('sha1').update(`${cwd}|${new Date().toISOString().slice(0, 10)}`).digest('hex').slice(0, 12);

function isClaude(p) {
  if (p.hook_event_name) return true;
  if (p.toolCall || p.conversationId || p.conversation_id) return false;
  return Boolean(p.session_id);
}

// Antigravity payloads carry no event name; the registered command passes it (`--event PreInvocation`), and the
// payload shape is the fallback: toolCall → pre-tool, terminationReason or executionNum → stop, stepIdx without a
// toolCall → post-tool, invocationNum → pre-invocation (PostInvocation shares that shape, so it needs the argument).
function inferAntigravityEvent(p) {
  if (p.toolCall) return 'pre-tool';
  if (p.terminationReason !== undefined || p.executionNum !== undefined) return 'stop';
  if (p.stepIdx !== undefined) return 'post-tool';
  if (p.invocationNum !== undefined) return 'pre-invocation';
  return 'unknown';
}

function eventFromArgv(argv) {
  const i = argv.indexOf('--event');
  return i >= 0 ? argv[i + 1] : null;
}

function parse(payload, opts) {
  const p = payload || {};
  const forced = (opts && opts.event) || null;
  if (isClaude(p)) {
    const cwd = norm(p.cwd);
    return {
      host: 'claude',
      event: CLAUDE_EVENTS[p.hook_event_name] || 'unknown',
      sessionId: p.session_id || fallbackId(cwd),
      cwd,
      isSubagent: Boolean(p.agent_id || p.agent_type),
      tool: p.tool_name ? { name: p.tool_name, args: p.tool_input || {} } : null,
      prompt: typeof p.prompt === 'string' ? p.prompt : null,
    };
  }
  const cwd = norm((Array.isArray(p.workspacePaths) && p.workspacePaths[0]) || p.workspaceRoot || p.cwd);
  return {
    host: 'antigravity',
    event: ANTIGRAVITY_EVENTS[forced] || ANTIGRAVITY_EVENTS[p.event] || ANTIGRAVITY_EVENTS[p.hookEventName] || inferAntigravityEvent(p),
    sessionId: p.conversationId || p.conversation_id || p.sessionId || fallbackId(cwd),
    cwd,
    isSubagent: false,
    tool: p.toolCall ? { name: p.toolCall.name, args: p.toolCall.args || {} } : null,
    prompt: typeof p.prompt === 'string' ? p.prompt : null,
  };
}

function format(host, event, result) {
  const r = result || {};
  if (host === 'antigravity') {
    if (event === 'post-tool') return {};
    if (r.deny) return { decision: 'deny', reason: r.deny };
    if (r.inject && event === 'pre-invocation') return { injectSteps: [{ ephemeralMessage: r.inject }] };
    return {};
  }
  if (r.deny && event === 'pre-tool') {
    return { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'deny', permissionDecisionReason: r.deny } };
  }
  if (r.inject && INJECT_EVENTS_CLAUDE.has(event)) {
    return { hookSpecificOutput: { hookEventName: CLAUDE_NAMES[event], additionalContext: r.inject } };
  }
  return {};
}

function readStdin(timeoutMs = 2000) {
  return new Promise((resolve) => {
    let data = '';
    let done = false;
    const finish = () => { if (done) return; done = true; try { resolve(JSON.parse(data || '{}')); } catch { resolve({}); } };
    const timer = setTimeout(finish, timeoutMs);
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => { clearTimeout(timer); finish(); });
    process.stdin.on('error', () => { clearTimeout(timer); finish(); });
  });
}

module.exports = { parse, format, readStdin, eventFromArgv, inferAntigravityEvent, CLAUDE_EVENTS, ANTIGRAVITY_EVENTS };
