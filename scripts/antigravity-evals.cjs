'use strict';
// Antigravity side of the activation evals: stage a copy of the fixture, arm a queue of prompts behind the eval
// driver hook, score the conversations from their transcripts, disarm. The only manual step is opening a fresh
// conversation on the stage and typing the opening phrase once per prompt (scripts/antigravity/drive.cjs does it).

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { STAGE_MARKER } = require('./antigravity/eval-driver.cjs');

const ROOT = path.resolve(__dirname, '..');
// Which copy the host loads, in the order doctor and status read them: the store a project declares for itself,
// then the older global copy. Arming the other one puts the driver hook where nothing runs it, and the run then
// measures conversations the driver never fed (2026-09-20: a disarm aimed at the absent global copy).
function defaultPluginDir(home = os.homedir()) {
  const { MARKER } = require('./antigravity.cjs');
  const store = path.join(home, '.bearingkit', 'antigravity', 'plugins', 'bearingkit');
  const global = path.join(home, '.gemini', 'config', 'plugins', 'bearingkit');
  return fs.existsSync(path.join(store, MARKER)) ? store : fs.existsSync(path.join(global, MARKER)) ? global : store;
}
const DEFAULT_EVAL_DIR = process.env.BEARINGKIT_EVAL_DIR || path.join(os.homedir(), '.bearingkit', 'antigravity-eval');
const HOOK_NAME = 'bearingkit-eval';
const DRIVER_SRC = path.join(__dirname, 'antigravity', 'eval-driver.cjs');
const PROMPT_DIR = path.join(ROOT, 'evals', 'activation');
const PROBE_GLOB = { id: 'probe-glob', intent: 'compat', lang: 'en', prompt: 'Read the file src/app/login/page.tsx, then answer with exactly one word: probe status', expect: 'GLOB-PROBE-OK', kind: 'text' };

function readJson(file, fallback) { try { return JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return fallback; } }

// A model that finds no answer in the fixture widens its search, and the folder above holds the kit's checkout (prompt
// files with their expected labels, this scorer) and the eval queue: on 2026-09-19 conversations opened both, then
// answered. Reading them before the routing decision (the first skill opened, or the whole conversation when none
// is) leaves the decision no evidence, so the result carries readHarness. Paths compare lower-cased with forward
// slashes; a search tool's relative results are resolved against the folder it searched.
const HARNESS_ROOTS = [ROOT, DEFAULT_EVAL_DIR];
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
    // The eval driver's own note: proof that the harness, not the owner, put the prompt in. [relay] from the neutral
    // harness of 2026-09-19 evening, [bearingkit-eval] before, so saved queues still score. (v1 looked for the kit's
    // [bearingkit] block; v2 loads the protocol as an always-on rule, which a transcript never records.)
    if (o && o.type === 'EPHEMERAL_MESSAGE' && /\[relay\]|\[bearingkit-eval\]/.test(typeof o.content === 'string' ? o.content : JSON.stringify(o.content || ''))) injected = true;
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
  const pluginDir = opts.pluginDir || defaultPluginDir(opts.home);
  const evalDir = opts.evalDir || DEFAULT_EVAL_DIR;
  const hooksFile = path.join(pluginDir, 'hooks.json');
  // A directory the kit did not make is not a copy the host loads, and a hook written into it would simply never
  // run. Only the resolved default is held to the marker: an explicit pluginDir is the operator's own word.
  const kitCopy = opts.pluginDir || fs.existsSync(path.join(pluginDir, require('./antigravity.cjs').MARKER));
  if (!fs.existsSync(pluginDir) || !kitCopy) throw new Error(`no bearingkit copy at ${pluginDir}; run \`bearingkit install --host antigravity\` first`);
  fs.mkdirSync(path.join(pluginDir, 'hooks'), { recursive: true });
  fs.copyFileSync(DRIVER_SRC, path.join(pluginDir, 'hooks', 'eval-driver.cjs'));
  const hooks = readJson(hooksFile, {});
  delete hooks['bearingkit-probe'];
  hooks[HOOK_NAME] = { PreInvocation: [{ type: 'command', command: 'node hooks/eval-driver.cjs', timeout: 20 }] };
  fs.writeFileSync(hooksFile, JSON.stringify(hooks, null, 2) + '\n');
  fs.rmSync(path.join(pluginDir, 'probe'), { recursive: true, force: true });
  fs.mkdirSync(evalDir, { recursive: true });
  // A search that reaches the queue must find no answer to copy: an item is a neutral id and its prompt, nothing
  // else (no prompt id, label or tag); score() takes the labels back from the prompt files.
  const queue = { armedAt: new Date().toISOString(), trigger: opts.trigger || DEFAULT_TRIGGER, pending: prompts.map((p, i) => ({ id: `p${String(i + 1).padStart(2, '0')}`, prompt: p.prompt })), done: [] };
  fs.writeFileSync(path.join(evalDir, 'queue.json'), JSON.stringify(queue, null, 2));
  return { hooksFile, queueFile: path.join(evalDir, 'queue.json'), count: prompts.length, trigger: queue.trigger, ids: queue.pending.map((q, i) => `${q.id}=${prompts[i].id}`) };
}

function disarm(opts = {}) {
  const pluginDir = opts.pluginDir || defaultPluginDir(opts.home);
  const hooksFile = path.join(pluginDir, 'hooks.json');
  const hooks = readJson(hooksFile, null);
  if (hooks && hooks[HOOK_NAME]) { delete hooks[HOOK_NAME]; fs.writeFileSync(hooksFile, JSON.stringify(hooks, null, 2) + '\n'); }
  fs.rmSync(path.join(pluginDir, 'hooks', 'eval-driver.cjs'), { force: true });
  return { hooksFile };
}

// Labels by prompt text, from the prompt files (every prompt is unique across them; a test keeps it so) and the probe.
function labels(files) {
  const byPrompt = new Map([[PROBE_GLOB.prompt, PROBE_GLOB]]);
  for (const f of files) {
    for (const l of fs.readFileSync(f, 'utf8').split('\n').filter((x) => x.trim())) { const p = JSON.parse(l); byPrompt.set(p.prompt, p); }
  }
  return byPrompt;
}

function score(opts = {}) {
  const evalDir = opts.evalDir || DEFAULT_EVAL_DIR;
  const queue = readJson(path.join(evalDir, 'queue.json'), null);
  if (!queue) throw new Error(`no queue at ${evalDir}; arm first`);
  const known = labels(opts.promptFiles || fs.readdirSync(PROMPT_DIR).filter((n) => n.endsWith('.jsonl')).map((n) => path.join(PROMPT_DIR, n)));
  const results = [];
  const harnessRoots = opts.harnessRoots || [ROOT, evalDir];
  for (const entry of queue.done || []) {
    // A ledger entry written before the neutral queue (2026-09-19 evening) carries its own labels; a newer one only a neutral id and the prompt.
    const found = known.get(entry.prompt);
    const item = entry.expect !== undefined ? entry
      : found ? { ...found, queueId: entry.id }
        : { id: entry.id, intent: '?', lang: '?', prompt: entry.prompt, expect: '?', unknown: true };
    let text = '';
    try { text = fs.readFileSync(String(entry.transcriptPath || ''), 'utf8'); } catch { text = ''; }
    const a = activationFromTranscript(text, item, { harnessRoots });
    results.push({ ...item, got: text ? a.got : 'no-transcript', injected: a.injected, readHarness: a.readHarness, modelName: entry.modelName, reset: entry.reset, conversationId: entry.conversationId });
  }
  return { results, pending: (queue.pending || []).length, trigger: queue.trigger, tag: queue.tag };
}

// The stage Antigravity works in. On 2026-09-19 conversations that expected no skill searched the folders above the
// shared fixture (C:\Projects\.bearingkit-evals\sample-app), reached the kit's checkout and the queue, and read the
// expected labels before answering. So Antigravity gets its own copy: away from the kit's parent folder and the
// home folder (which holds the queue), below no AGENTS.md or GEMINI.md, with a README that does not call it a
// fixture, a lockfile without the word, a plain git history, and the marker hidden in .git. The copy Claude Code
// runs in, and its README, are unchanged.
const DEFAULT_STAGE = path.join(path.parse(ROOT).root, 'work', 'apps', 'sample-app');
const ANCESTOR_MEMORY = ['AGENTS.md', 'GEMINI.md'];

const folderUri = (dir) => 'file:///' + path.resolve(dir).replace(/\\/g, '/').replace(/^([A-Za-z]):/, (m, d) => `${d.toLowerCase()}%3A`);

function stage(opts = {}) {
  const root = opts.root || ROOT;
  const dir = path.resolve(opts.dir || DEFAULT_STAGE);
  const forbidden = opts.forbidden || [path.dirname(root), os.homedir()];
  for (const f of forbidden) {
    const rel = path.relative(path.resolve(f), dir);
    if (rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel))) throw new Error(`refusing to stage at ${dir}: it is under ${f}; keep the stage away from the folder beside the kit's checkout and from the home folder, where a widened search reaches the prompt files or the queue`);
  }
  for (let cur = path.dirname(dir); ; cur = path.dirname(cur)) {
    for (const m of ANCESTOR_MEMORY) if (fs.existsSync(path.join(cur, m))) throw new Error(`refusing to stage at ${dir}: ${path.join(cur, m)} above it would load into every conversation`);
    if (path.dirname(cur) === cur) break;
  }
  // Staging replaces the folder, so it has to be empty or a stage this command made: a mistyped --stage-dir that
  // points at real work is refused before anything is removed.
  if (fs.existsSync(dir) && fs.readdirSync(dir).length && !fs.existsSync(path.join(dir, STAGE_MARKER))) throw new Error(`refusing to replace ${dir}: it is not empty and not a stage this command made (no ${STAGE_MARKER})`);
  // A conversation may hold the folder open (Windows cannot delete a process's working directory); then its
  // contents, history included, are emptied instead, so the stage always has exactly one commit.
  let reused = false;
  try { fs.rmSync(dir, { recursive: true, force: true }); } catch { reused = true; }
  if (reused) for (const e of fs.readdirSync(dir)) fs.rmSync(path.join(dir, e), { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  fs.cpSync(path.join(root, 'evals', 'fixtures', 'sample-app'), dir, { recursive: true });
  const overlay = path.join(root, 'evals', 'fixtures', 'antigravity-stage');
  if (fs.existsSync(overlay)) fs.cpSync(overlay, dir, { recursive: true, force: true });
  // Measuring a per-project activation means the stage has to be an activated project. The declaration goes in
  // before the first commit: the driver resets with `git reset --hard` and `git clean -fdx` before every prompt, so
  // an untracked one would be gone after the first prompt and the rest of the run would measure an unactivated
  // project. It is written by `activate` itself, so the file is the one the owner's projects get.
  // The declared store has to be installed, and the caller is told when it is not: with an old global copy on the
  // machine the kit would load anyway, and a probe meant to show that the declaration alone loads it would pass
  // while proving nothing.
  let activated = null;
  let declares = null;
  let storeMissing = false;
  if (opts.activate) {
    const { activate, AGENTS_FILE, storePath } = require('./activation.cjs');
    const { MARKER } = require('./antigravity.cjs');
    activate({ project: dir, home: opts.home, host: 'antigravity', dest: opts.dest, gitExclude: false });
    activated = path.join(dir, ...AGENTS_FILE);
    declares = opts.dest ? path.resolve(opts.dest) : storePath(opts.home || os.homedir());
    storeMissing = !fs.existsSync(path.join(declares, MARKER));
  }
  const git = (args) => {
    const r = spawnSync('git', ['-c', 'user.name=Developer', '-c', 'user.email=developer@example.com', ...args], { cwd: dir, encoding: 'utf8' });
    if (r.status !== 0) throw new Error(`git ${args.join(' ')} failed in ${dir}: ${String(r.stderr || r.error || '').trim()}`);
    return String(r.stdout || '').trim();
  };
  git(['init', '-q']);
  // A reset must restore the bytes that were copied, not a line-ending conversion of them.
  git(['config', 'core.autocrlf', 'false']);
  git(['add', '-A']);
  git(['commit', '-q', '-m', 'Initial commit']);
  const sha = git(['rev-parse', 'HEAD']);
  fs.writeFileSync(path.join(dir, STAGE_MARKER), sha + '\n');
  return { cwd: dir, sha, reused, activated, declares, storeMissing, folderUri: folderUri(dir) };
}

module.exports = { activationFromTranscript, arm, disarm, score, stage, folderUri, defaultPluginDir, DEFAULT_EVAL_DIR, DEFAULT_STAGE, DEFAULT_TRIGGER, HOOK_NAME, PROBE_GLOB };
