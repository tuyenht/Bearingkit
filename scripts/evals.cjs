#!/usr/bin/env node
'use strict';
// Activation evals. Claude Code: runs each prompt through `claude -p` and records the first skill invoked.
// Antigravity: prints a checklist to fill in by hand. Results go to evals/results/<date>-<host>.md.

const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const ROOT = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) { out[a.slice(2)] = next; i++; } else { out[a.slice(2)] = true; }
    } else out._.push(a);
  }
  return out;
}

function loadPrompts(file) {
  const lines = fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
  const prompts = lines.map((l, i) => { try { return JSON.parse(l); } catch (e) { throw new Error(`line ${i + 1} is not JSON`); } });
  const ids = new Set();
  for (const p of prompts) {
    for (const k of ['id', 'intent', 'lang', 'prompt', 'expect']) if (!p[k]) throw new Error(`prompt ${p.id || '?'} lacks ${k}`);
    if (ids.has(p.id)) throw new Error(`duplicate id ${p.id}`);
    ids.add(p.id);
  }
  return prompts;
}

// First Skill invocation in a claude -p stream-json transcript, else 'none'.
function parseStream(text) {
  for (const line of String(text).split('\n')) {
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    const items = [];
    if (o && o.type === 'assistant' && o.message && Array.isArray(o.message.content)) items.push(...o.message.content);
    if (o && o.type === 'tool_use') items.push(o);
    for (const it of items) {
      if (it && it.type === 'tool_use' && it.name === 'Skill') {
        const inp = it.input || {};
        const name = inp.skill || inp.name || inp.command || '';
        return String(name).replace(/^\//, '').split(':').pop() || 'none';
      }
    }
  }
  return 'none';
}

// Last rate_limit_event in a stream: { fiveHour, sevenDay, resetsAt } as fractions, or null.
function parseQuota(text) {
  let last = null;
  for (const line of String(text).split('\n')) {
    let o;
    try { o = JSON.parse(line); } catch { continue; }
    if (o && o.type === 'rate_limit_event' && o.rate_limit_info) {
      const w = o.rate_limit_info.unifiedWindows || {};
      const fh = w.five_hour || {};
      // The top-level resetsAt belongs to whichever window the event is about; the five-hour window carries its own.
      last = { fiveHour: fh.utilization ?? null, sevenDay: w.seven_day ? w.seven_day.utilization : null, resetsAt: fh.resetsAt || o.rate_limit_info.resetsAt || null, status: o.rate_limit_info.status };
    }
  }
  return last;
}

// Claude Code loads every CLAUDE.md found in the ancestors of the working directory, so a fixture inside this
// repository would carry the repository's own working agreement into every eval session. The fixture is therefore
// copied outside the repository before a run, with a throwaway git history so "commit and push" prompts have a repo.
function ancestorMemoryFiles(dir) {
  const found = [];
  let cur = path.resolve(dir);
  for (;;) {
    for (const name of ['CLAUDE.md', 'CLAUDE.local.md']) { const f = path.join(cur, name); if (fs.existsSync(f)) found.push(f); }
    const parent = path.dirname(cur);
    if (parent === cur) return found;
    cur = parent;
  }
}

function stageFixture(root, base) {
  const src = path.join(root, 'evals', 'fixtures', 'sample-app');
  const dst = path.join(base || path.join(os.tmpdir(), 'bearingkit-evals'), 'sample-app');
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(src, dst, { recursive: true });
  const git = (args) => spawnSync('git', ['-c', 'user.name=bearingkit', '-c', 'user.email=evals@bearingkit.invalid', ...args], { cwd: dst, encoding: 'utf8' });
  const init = git(['init', '-q']);
  const vcs = init.status === 0 && git(['add', '-A']).status === 0 && git(['commit', '-q', '-m', 'fixture']).status === 0;
  return { cwd: dst, vcs, ancestors: ancestorMemoryFiles(path.dirname(dst)) };
}

// --per-intent N takes a spread per intent rather than the first N lines: an English positive, a Vietnamese positive,
// a negative, then round again. A baseline of three per intent therefore still measures false activations and both languages.
function sample(prompts, n) {
  const byIntent = {};
  for (const p of prompts) (byIntent[p.intent] = byIntent[p.intent] || []).push(p);
  const picked = new Set();
  for (const group of Object.values(byIntent)) {
    const isNeg = (p) => p.id.includes('-neg-');
    const lanes = [group.filter((p) => !isNeg(p) && p.lang === 'en'), group.filter((p) => !isNeg(p) && p.lang !== 'en'), group.filter(isNeg)];
    let taken = 0;
    for (let i = 0; taken < n && lanes.some((l) => l.length); i = (i + 1) % lanes.length) {
      const p = lanes[i].shift();
      if (p) { picked.add(p.id); taken++; }
    }
  }
  return prompts.filter((p) => picked.has(p.id));
}

function runClaudePrompt(prompt, opts) {
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--max-turns', String(opts.turns || 6), '--model', opts.model];
  const env = { ...process.env };
  delete env.CLAUDECODE;
  if (opts.configDir) env.CLAUDE_CONFIG_DIR = opts.configDir;
  // Windows resolves `claude` through a .cmd shim, which needs a shell; the prompt travels through stdin so no
  // user text is ever concatenated into the command line. Elsewhere the binary is spawned directly.
  const spawnOpts = { input: prompt, encoding: 'utf8', env, cwd: opts.cwd, timeout: 180000, maxBuffer: 20 * 1024 * 1024 };
  const r = process.platform === 'win32'
    ? spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', ['claude', ...args].join(' ')], spawnOpts)
    : spawnSync('claude', args, spawnOpts);
  return { got: parseStream(r.stdout || ''), raw: r.stdout || '', stderr: r.stderr || '', status: r.status, quota: parseQuota(r.stdout || '') };
}

// A result passes when the skill invoked is the expected one, or, for a baseline run against another setup,
// one of the skills declared equivalent to it (evals/activation/equivalents-*.json: { "bk-spec": ["brainstorming"] }).
// `expect` may list alternatives separated by "|" when the design allows more than one correct route
// (for example an ops request before bk-ops exists: "bk-spec|none").
const alternatives = (expect) => String(expect).split('|').map((s) => s.trim()).filter(Boolean);

function passes(r, equivalents) {
  const alts = alternatives(r.expect);
  if (alts.includes(r.got)) return true;
  if (!equivalents) return false;
  return alts.some((a) => a !== 'none' && (equivalents[a] || []).includes(r.got));
}

function summarize(results, equivalents) {
  const byIntent = {};
  let falseActivations = 0;
  for (const r of results) {
    const b = (byIntent[r.intent] = byIntent[r.intent] || { total: 0, pass: 0, positives: 0, positivesPass: 0 });
    const pass = passes(r, equivalents);
    const alts = alternatives(r.expect);
    b.total++; if (pass) b.pass++;
    if (!alts.includes('none') && !r.id.includes('-neg-')) { b.positives++; if (pass) b.positivesPass++; }
    if (alts.includes('none') && !pass) falseActivations++;
  }
  const total = results.length;
  const pass = results.filter((r) => passes(r, equivalents)).length;
  return { byIntent, total, pass, falseActivations };
}

function table(results, summary, host, meta, equivalents) {
  const lines = [`# Activation evals · ${host} · ${new Date().toISOString().slice(0, 10)}`, '', meta, '', '| id | intent | expect | got | pass |', '|---|---|---|---|---|'];
  for (const r of results) lines.push(`| ${r.id} | ${r.intent} | ${r.expect} | ${r.got} | ${passes(r, equivalents) ? 'yes' : 'NO'} |`);
  lines.push('', '| intent | positives routed | all prompts |', '|---|---|---|');
  for (const [k, v] of Object.entries(summary.byIntent)) lines.push(`| ${k} | ${v.positivesPass}/${v.positives} | ${v.pass}/${v.total} |`);
  lines.push('', `Overall: ${summary.pass}/${summary.total} · false activations on "none" prompts: ${summary.falseActivations}`);
  return lines.join('\n') + '\n';
}

function checklist(prompts) {
  const lines = ['# Activation checklist · antigravity', '', 'Run each prompt in a fresh conversation; write the skill that activated (or none) in the last column.', '', '| id | intent | prompt | expect | got |', '|---|---|---|---|---|'];
  for (const p of prompts) lines.push(`| ${p.id} | ${p.intent} | ${p.prompt.replace(/\|/g, '\\|')} | ${p.expect} |  |`);
  return lines.join('\n') + '\n';
}

async function run(argv) {
  const args = parseArgs(argv);
  const host = args.host || 'claude';
  const file = path.resolve(args.file || path.join(ROOT, 'evals', 'activation', 'phase-1.jsonl'));
  let prompts = loadPrompts(file);
  if (args.intent) prompts = prompts.filter((p) => p.intent === args.intent);
  if (args.id) { const ids = new Set(String(args.id).split(',').map((s) => s.trim())); prompts = prompts.filter((p) => ids.has(p.id)); }
  if (args['per-intent']) prompts = sample(prompts, Number(args['per-intent']));
  if (args.limit) prompts = prompts.slice(0, Number(args.limit));
  const outDir = path.resolve(args.out || path.join(ROOT, 'evals', 'results'));
  fs.mkdirSync(outDir, { recursive: true });
  const date = new Date().toISOString().slice(0, 10);

  if (host === 'antigravity') {
    const text = checklist(prompts);
    const out = path.join(outDir, `${date}-antigravity-checklist.md`);
    fs.writeFileSync(out, text);
    process.stdout.write(text + `\nwritten: ${out}\n`);
    return;
  }

  // Prompts talk about a settings page, invoices, a login form; the fixture app gives them something to point at.
  let cwd;
  if (args.cwd) cwd = path.resolve(args.cwd);
  else {
    const staged = stageFixture(ROOT, args['stage-dir'] ? path.resolve(args['stage-dir']) : null);
    cwd = staged.cwd;
    process.stdout.write(`fixture staged at ${cwd}${staged.vcs ? ' (git initialised)' : ' (git unavailable, no history)'}
`);
    if (staged.ancestors.length) process.stdout.write(`warning: memory files above the fixture will load too: ${staged.ancestors.join(', ')}
`);
  }
  const above = args.cwd ? ancestorMemoryFiles(path.dirname(cwd)) : [];
  if (above.length) process.stdout.write(`warning: memory files above --cwd will load too: ${above.join(', ')}
`);
  if (args['stage-only']) return;
  const opts = { model: args.model || 'sonnet', configDir: args['config-dir'] ? path.resolve(args['config-dir']) : null, cwd, turns: args.turns ? Number(args.turns) : 6 };
  const equivalents = args.equivalents ? JSON.parse(fs.readFileSync(path.resolve(args.equivalents), 'utf8')) : null;
  const maxUtil = args['max-utilization'] ? Number(args['max-utilization']) : 0.9;
  const results = [];
  let quota = null;
  for (const p of prompts) {
    const r = runClaudePrompt(p.prompt, opts);
    const row = { ...p, got: r.got };
    results.push(row);
    quota = r.quota || quota;
    process.stdout.write(`${p.id.padEnd(12)} expect=${p.expect.padEnd(10)} got=${r.got.padEnd(10)} ${passes(row, equivalents) ? 'ok' : 'MISS'}\n`);
    if (args.raw) fs.writeFileSync(path.join(outDir, `${date}-${p.id}.raw.jsonl`), r.raw);
    if (quota && quota.fiveHour !== null && quota.fiveHour >= maxUtil) {
      process.stdout.write(`stopping: five-hour window at ${Math.round(quota.fiveHour * 100)}% (limit ${Math.round(maxUtil * 100)}%), resets ${quota.resetsAt ? new Date(quota.resetsAt * 1000).toLocaleString() : 'unknown'}; rerun the rest with --id\n`);
      break;
    }
  }
  const summary = summarize(results, equivalents);
  const quotaNote = quota ? ` · quota after run: five-hour ${Math.round((quota.fiveHour || 0) * 100)}%, seven-day ${Math.round((quota.sevenDay || 0) * 100)}%` : '';
  const meta = `Model: ${opts.model} · profile: ${opts.configDir || 'daily'} · cwd: ${opts.cwd} · prompts: ${results.length}${equivalents ? ' · equivalents: ' + path.basename(args.equivalents) : ''}${quotaNote}`;
  const tag = args.tag ? '-' + String(args.tag).replace(/[^a-z0-9-]/gi, '') : '';
  const out = path.join(outDir, `${date}-claude${args.intent ? '-' + args.intent : ''}${tag}.md`);
  fs.writeFileSync(out, table(results, summary, 'claude', meta, equivalents));
  process.stdout.write(`\nOverall ${summary.pass}/${summary.total}, false activations ${summary.falseActivations}.${quotaNote} Written: ${out}\n`);
}

module.exports = { run, parseStream, parseQuota, loadPrompts, summarize, table, checklist, passes, sample, stageFixture, ancestorMemoryFiles };
