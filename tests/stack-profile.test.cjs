'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildBlock, run } = require('../core/hooks/stack-profile.cjs');

const profile = { languages: ['typescript'], versionCard: 'Next 15, React 19, Prisma 7', packageManager: 'pnpm', guardrails: ['pnpm test', 'pnpm exec tsc --noEmit'] };
const git = { branch: 'feat/123-invoices', dirtyCount: 3 };
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bk-sp-'));
const deps = (over = {}) => ({ detect: () => profile, git: () => git, plan: () => null, handoff: () => null, baseDir: tmp(), ...over });

test('block is short and complete', () => {
  const b = buildBlock(profile, git, { path: 'plans/260911-0900-invoices', phase: 2 }, 'docs/handoff/2026-09-10.md', false);
  assert.match(b, /^\[bearingkit\] stack: typescript · Next 15/);
  assert.match(b, /guardrails: pnpm test; pnpm exec tsc --noEmit/);
  assert.match(b, /branch: feat\/123-invoices \(dirty: 3 files\) · plan: plans\/260911-0900-invoices phase 2/);
  assert.match(b, /hot path touched: no · handoff: docs\/handoff\/2026-09-10.md/);
  assert.ok(b.split(/\s+/).length <= 90, 'roughly 120 tokens or fewer');
});

test('block degrades without git, plan or handoff', () => {
  const b = buildBlock({ languages: [], guardrails: [] }, null, null, null, true);
  assert.match(b, /no framework detected/);
  assert.match(b, /guardrails: none detected/);
  assert.match(b, /no git/);
  assert.match(b, /hot path touched: yes/);
});

test('injects once, then stays silent until state changes', async () => {
  const d = deps();
  const p = { session_id: 's', cwd: 'C:/x', hook_event_name: 'UserPromptSubmit', prompt: 'hi' };
  const first = await run(p, d);
  assert.ok(first.hookSpecificOutput && first.hookSpecificOutput.additionalContext.includes('[bearingkit]'));
  const second = await run(p, d);
  assert.deepEqual(second, {});
  const changed = await run(p, { ...d, git: () => ({ branch: 'main', dirtyCount: 0 }) });
  assert.ok(changed.hookSpecificOutput, 're-injects when the branch changed');
});

test('re-injects after compaction', async () => {
  const d = deps();
  const p = { session_id: 's', cwd: 'C:/x', hook_event_name: 'UserPromptSubmit' };
  await run(p, d);
  const compact = await run({ ...p, hook_event_name: 'PostCompact' }, d);
  assert.ok(compact.hookSpecificOutput && compact.hookSpecificOutput.hookEventName === 'PostCompact');
});

test('antigravity pre-invocation uses ephemeralMessage', async () => {
  const out = await run({ conversationId: 'c1', workspaceRoot: 'C:/x', event: 'PreInvocation' }, deps());
  assert.ok(out.injectSteps && out.injectSteps[0].ephemeralMessage.includes('[bearingkit]'));
});

test('no-op inside subagents and on unrelated events', async () => {
  const d = deps();
  assert.deepEqual(await run({ session_id: 's', cwd: 'C:/x', hook_event_name: 'UserPromptSubmit', agent_type: 'Explore' }, d), {});
  assert.deepEqual(await run({ session_id: 's', cwd: 'C:/x', hook_event_name: 'PreToolUse', tool_name: 'Bash', tool_input: {} }, d), {});
});

test('never throws when detection fails', async () => {
  const out = await run({ session_id: 's', cwd: 'C:/x', hook_event_name: 'SessionStart' }, deps({ detect: () => { throw new Error('no-manifest'); } }));
  assert.ok(out.hookSpecificOutput.additionalContext.includes('no framework detected'));
});
