#!/usr/bin/env node
'use strict';
// Helper hook: injects a short stack block (≤120 tokens) only when the session state changed.
// Claude Code: SessionStart, UserPromptSubmit, PostCompact. Antigravity: PreInvocation.
// No-op inside subagents. Never throws; prints {} when there is nothing to say.

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { parse, format, readStdin } = require('./lib/host.cjs');
const { State } = require('./lib/state.cjs');
const { detect } = require('../../scripts/detect-stack.cjs');

const sha = (s) => crypto.createHash('sha1').update(s).digest('hex');
const EVENTS = new Set(['session-start', 'prompt', 'post-compact', 'pre-invocation']);

function gitInfo(cwd) {
  const opts = { cwd, stdio: ['ignore', 'pipe', 'ignore'], timeout: 3000 };
  try {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], opts).toString().trim();
    const dirtyCount = execFileSync('git', ['status', '--porcelain'], opts).toString().split('\n').filter(Boolean).length;
    return { branch, dirtyCount };
  } catch {
    return null;
  }
}

// Active plan: session state first, then the branch name matched against plan folders, else none.
function activePlan(cwd, branch, state) {
  if (state && state.activePlan) return state.activePlan;
  const slug = String(branch || '').split('/').pop().replace(/^\d+-/, '');
  if (!slug || slug === 'main' || slug === 'master' || slug === 'HEAD') return null;
  for (const rel of ['plans', path.join('docs', 'plans')]) {
    const dir = path.join(cwd, rel);
    if (!fs.existsSync(dir)) continue;
    const hit = fs.readdirSync(dir).find((d) => d.includes(slug));
    if (hit) return { path: `${rel.replace(/\\/g, '/')}/${hit}`, phase: null };
  }
  return null;
}

function latestHandoff(cwd) {
  const dir = path.join(cwd, 'docs', 'handoff');
  if (!fs.existsSync(dir)) return null;
  const f = fs.readdirSync(dir).filter((x) => x.endsWith('.md')).sort().pop();
  if (!f) return null;
  return Date.now() - fs.statSync(path.join(dir, f)).mtimeMs < 14 * 86400000 ? `docs/handoff/${f}` : null;
}

function buildBlock(profile, git, plan, handoff, hotPathTouched) {
  const p = profile || {};
  const languages = (p.languages && p.languages.length) ? p.languages.join(', ') : 'unknown';
  const l1 = `[bearingkit] stack: ${languages} · ${p.versionCard || 'no framework detected'} · ${p.packageManager || 'no package manager'}`;
  const l2 = `guardrails: ${(p.guardrails && p.guardrails.length) ? p.guardrails.join('; ') : 'none detected'}`;
  const l3 = git
    ? `branch: ${git.branch}${git.dirtyCount ? ` (dirty: ${git.dirtyCount} files)` : ''}${plan ? ` · plan: ${plan.path}${plan.phase ? ` phase ${plan.phase}` : ''}` : ''}`
    : 'no git';
  const l4 = `hot path touched: ${hotPathTouched ? 'yes' : 'no'}${handoff ? ` · handoff: ${handoff}` : ''}`;
  return [l1, l2, l3, l4].join('\n');
}

async function run(payload, deps = {}) {
  const e = parse(payload);
  if (e.isSubagent || !EVENTS.has(e.event)) return {};
  const state = new State({ host: e.host, sessionId: e.sessionId, cwd: e.cwd, baseDir: deps.baseDir });
  if (e.event === 'session-start') state.prune();
  if (e.event === 'post-compact') state.update({ lastInjectionHash: '' });

  let profile;
  try { profile = (deps.detect || detect)(e.cwd); } catch { profile = { languages: [], guardrails: [] }; }
  const git = (deps.git || gitInfo)(e.cwd);
  const current = state.read();
  const plan = (deps.plan || activePlan)(e.cwd, git && git.branch, current);
  const handoff = (deps.handoff || latestHandoff)(e.cwd);

  const block = buildBlock(profile, git, plan, handoff, current.hotPathTouched);
  const hash = sha(block);
  if (hash === current.lastInjectionHash) return {};
  state.update({
    lastInjectionHash: hash,
    stackHash: sha(JSON.stringify(profile)),
    branch: (git && git.branch) || '',
    dirty: Boolean(git && git.dirtyCount),
    activePlan: plan,
    handoffPresent: Boolean(handoff),
  });
  return format(e.host, e.event, { inject: block });
}

if (require.main === module) {
  readStdin()
    .then((p) => run(p))
    .then((out) => process.stdout.write(JSON.stringify(out)))
    .catch((err) => { process.stderr.write(String(err && err.stack ? err.stack : err)); process.stdout.write('{}'); });
}

module.exports = { buildBlock, run, activePlan, latestHandoff, gitInfo };
