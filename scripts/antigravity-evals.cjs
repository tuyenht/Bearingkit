'use strict';
// Antigravity side of the activation evals: arm a queue of prompts behind the eval driver hook, score the
// conversations from their transcripts, disarm. The owner's only manual step is opening a fresh conversation on the
// staged fixture and typing the trigger phrase once per prompt.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const DEFAULT_PLUGIN_DIR = path.join(os.homedir(), '.gemini', 'config', 'plugins', 'bearingkit');
const DEFAULT_EVAL_DIR = process.env.BEARINGKIT_EVAL_DIR || path.join(os.homedir(), '.bearingkit', 'antigravity-eval');
const HOOK_NAME = 'bearingkit-eval';
const DRIVER_SRC = path.join(__dirname, 'antigravity', 'eval-driver.cjs');

function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }

// A model that finds no answer in the fixture widens its search, and the folder above holds the kit's checkout (prompt
// files with their expected labels, this scorer) and the eval queue: on 2026-09-19 conversations opened both, then
// answered. Reading them before the routing decision (the first skill opened, or the whole conversation when none
// is) leaves the decision no evidence, so the result carries readHarness. Paths compare lower-cased with forward
// slashes; a search tool's relative results are resolved against the folder it searched.
const HARNESS_ROOTS = [path.resolve(__dirname, '..'), DEFAULT_EVAL_DIR];
const slash = (s) => String(s).replace(/%3a/gi, ':').replace(/\\+/g, '/').replace(/\/+/g, '/').toLowerCase();
const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (v && typeof v === 'object') for (const x of Object.values(v)) strings(x, out);
  return out;
};

function harnessMatcher(roots) {
  const rs = roots.map((r) => slash(r).replace(/\/$/, ''));
  const patterns = rs.map((r) => new RegExp(r.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z0-9._-])'));
  return {
    named: (s) => patterns.some((p) => p.test(s)),
    under: (p) => rs.some((r) => p === r || p.startsWith(r + '/')),
  };
}

// Which skill a conversation activated: the first tool call that reads a SKILL.md, by its folder name; else none.
// A text item (kind: "text") passes when its expected text appears in any planner response.
function activationFromTranscript(text, item, opts = {}) {
  const harness = harnessMatcher(opts.harnessRoots || HARNESS_ROOTS);
  const allLines = String(text || '').split('\n');
  // The driver's prompt arrives as a later user turn; the model's reaction to the trigger line before it does not
  // count. Scoring starts at the user input that carries the item's prompt (whole transcript if it is not found).
  let start = 0;
  let promptSeen = false;
  if (item && item.prompt) {
    for (let i = 0; i < allLines.length; i++) {
      let o;
      try { o = JSON.parse(allLines[i]); } catch { continue; }
      if (o && o.type === 'USER_INPUT' && typeof o.content === 'string' && o.content.includes(item.prompt)) { start = i + 1; promptSeen = true; break; }
    }
  }
  const lines = allLines.slice(start);
  let injected = false;
  const responses = [];
  let got = null;
  for (const line of allLines) {
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    // The eval driver's own note: proof that the harness, not the owner, put the prompt in. (v1 looked for the kit's
    // [bearingkit] block; v2 loads the protocol as an always-on rule, which a transcript never records.)
    if (o && o.type === 'EPHEMERAL_MESSAGE' && /\[bearingkit-eval\]/.test(typeof o.content === 'string' ? o.content : JSON.stringify(o.content || ''))) injected = true;
  }
  let pos = 0;
  let skillAt = null;
  let harnessAt = null;
  let searched = [];
  for (const line of lines) {
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    if (!o) continue;
    if (o.type === 'PLANNER_RESPONSE') {
      if (typeof o.content === 'string') responses.push(o.content);
      searched = [];
      for (const call of Array.isArray(o.tool_calls) ? o.tool_calls : []) {
        if (got) break;
        pos++;
        const blob = JSON.stringify(call.args || {});
        const m = blob.match(/skills[\\/]+(?:\\\\)?([A-Za-z0-9._-]+)[\\/]+(?:\\\\)?SKILL\.md/i);
        if (m) got = m[1];
        else if (typeof call.name === 'string' && /^bk-[a-z]+$/.test(call.name)) got = call.name;
        if (got) { skillAt = pos; break; }
        const args = slash(blob);
        if (harnessAt === null && harness.named(args)) harnessAt = pos;
        for (const d of args.match(/[a-z]:\/[^"'\s,}]*/g) || []) searched.push(d.replace(/\/$/, ''));
      }
    } else if (!got && harnessAt === null && o.type !== 'USER_INPUT' && o.type !== 'EPHEMERAL_MESSAGE') {
      pos++;
      const result = slash(strings(o).join('\n'));
      const relative = result.match(/(?<![a-z0-9._:/-])[a-z0-9._-]+(?:\/[a-z0-9._-]+)+/g) || [];
      if (harness.named(result) || relative.some((p) => searched.some((d) => harness.under(`${d}/${p}`)))) harnessAt = pos;
    }
  }
  const readHarness = harnessAt !== null && (skillAt === null || harnessAt < skillAt);
  if (item && item.kind === 'text') return { got: responses.some((r) => r.includes(item.expect)) ? item.expect : 'none', injected, promptSeen, readHarness };
  return { got: got || 'none', injected, promptSeen, readHarness };
}

// The trigger is an instruction that keeps the model still on the first turn; the driver then injects the real
// prompt as the next user turn, which is the turn that is scored.
const DEFAULT_TRIGGER = 'Reply with OK and wait for my next message.';

function arm(prompts, opts = {}) {
  const pluginDir = opts.pluginDir || DEFAULT_PLUGIN_DIR;
  const evalDir = opts.evalDir || DEFAULT_EVAL_DIR;
  const hooksFile = path.join(pluginDir, 'hooks.json');
  if (!fs.existsSync(pluginDir)) throw new Error(`no plugin directory at ${pluginDir}; run \`bearingkit antigravity install\` first`);
  fs.mkdirSync(path.join(pluginDir, 'hooks'), { recursive: true });
  fs.copyFileSync(DRIVER_SRC, path.join(pluginDir, 'hooks', 'eval-driver.cjs'));
  const hooks = readJson(hooksFile, {});
  delete hooks['bearingkit-probe'];
  hooks[HOOK_NAME] = { PreInvocation: [{ type: 'command', command: 'node hooks/eval-driver.cjs', timeout: 20 }] };
  fs.writeFileSync(hooksFile, JSON.stringify(hooks, null, 2) + '\n');
  fs.rmSync(path.join(pluginDir, 'probe'), { recursive: true, force: true });
  fs.mkdirSync(evalDir, { recursive: true });
  const queue = { armedAt: new Date().toISOString(), trigger: opts.trigger || DEFAULT_TRIGGER, tag: opts.tag || '', pending: prompts.map((p) => ({ id: p.id, intent: p.intent, lang: p.lang, prompt: p.prompt, expect: p.expect, kind: p.kind || 'skill' })), done: [] };
  fs.writeFileSync(path.join(evalDir, 'queue.json'), JSON.stringify(queue, null, 2));
  return { hooksFile, queueFile: path.join(evalDir, 'queue.json'), count: prompts.length, trigger: queue.trigger };
}

function disarm(opts = {}) {
  const pluginDir = opts.pluginDir || DEFAULT_PLUGIN_DIR;
  const hooksFile = path.join(pluginDir, 'hooks.json');
  const hooks = readJson(hooksFile, null);
  if (hooks && hooks[HOOK_NAME]) { delete hooks[HOOK_NAME]; fs.writeFileSync(hooksFile, JSON.stringify(hooks, null, 2) + '\n'); }
  fs.rmSync(path.join(pluginDir, 'hooks', 'eval-driver.cjs'), { force: true });
  return { hooksFile };
}

function score(opts = {}) {
  const evalDir = opts.evalDir || DEFAULT_EVAL_DIR;
  const queue = readJson(path.join(evalDir, 'queue.json'), null);
  if (!queue) throw new Error(`no queue at ${evalDir}; arm first`);
  const results = [];
  const harnessRoots = opts.harnessRoots || [path.resolve(__dirname, '..'), evalDir];
  for (const entry of queue.done || []) {
    const item = entry;
    let text = '';
    try { text = fs.readFileSync(String(entry.transcriptPath || ''), 'utf8'); } catch { text = ''; }
    const a = activationFromTranscript(text, item, { harnessRoots });
    results.push({ ...item, got: text ? a.got : 'no-transcript', injected: a.injected, readHarness: a.readHarness, modelName: entry.modelName, reset: entry.reset, conversationId: entry.conversationId });
  }
  return { results, pending: (queue.pending || []).length, trigger: queue.trigger, tag: queue.tag };
}

module.exports = { activationFromTranscript, arm, disarm, score, DEFAULT_PLUGIN_DIR, DEFAULT_EVAL_DIR, DEFAULT_TRIGGER, HOOK_NAME };
