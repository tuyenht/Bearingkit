'use strict';
// The kit against its own sources: one task, one fixture,
// one prompt, one model, one isolated profile; three branches that differ only in the plugins loaded:
//   K  the checkout (the kit), S  the pinned source plugins as they ship, F  nothing.
// Sessions interleave the branches, the fixture is reset before each, and every answer is scored by script and kept.
// Usage: bearingkit bench --task <id> --config-dir <isolated profile> [--runs 3] [--branches K,S,F]
//          [--variants natural,command] [--model sonnet] [--timeout <s>] [--turns <n>] [--dry-run]
//        bearingkit bench --task <id> --rescore <results folder>   (score kept raw streams again, current rules)
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');
const { parseArgs, parseQuota, quotaStop, authStop, ancestorMemoryFiles } = require('./evals.cjs');
const { scoreAnswer, usageFrom, invocations, summarize, tokensComparable } = require('./lib/bench-score.cjs');

const ROOT = path.resolve(__dirname, '..');
const OPTIONS = new Set(['task', 'config-dir', 'runs', 'branches', 'variants', 'model', 'timeout', 'turns', 'dry-run', 'rescore']);
const USAGE = 'usage: bearingkit bench --task <id> --config-dir <isolated profile> [--runs 3] [--branches K,S,F] [--variants natural,command] [--model sonnet] [--timeout <s>] [--turns <n>] [--dry-run]\n       bearingkit bench --task <id> --rescore <results folder>\n';

function preflight(args) {
  const unknown = Object.keys(args).filter((k) => k !== '_' && !OPTIONS.has(k));
  if (unknown.length) return { exit: 2, message: `unknown option ${unknown.map((u) => '--' + u).join(', ')}\n` + USAGE };
  if (!args.task) return { exit: 2, message: 'no --task\n' + USAGE };
  // The daily profile is never measured: its plugins and memory would decide the branches.
  if (!args['config-dir'] && !args.rescore) return { exit: 2, message: 'no --config-dir: name the isolated profile\n' + USAGE };
  return null;
}

function loadTask(id, root = ROOT) {
  const dir = path.join(root, 'evals', 'bench', id);
  const task = JSON.parse(fs.readFileSync(path.join(dir, 'task.json'), 'utf8'));
  return { ...task, dir };
}

// The branch is fixed on the command line: its plugin directories, and an inline --settings that switches on exactly
// those plugins, whatever the profile's own enabledPlugins says.
function branchSetup(task, branch, root = ROOT) {
  if (branch === 'K') return { pluginDirs: [root], settings: { enabledPlugins: { 'bearingkit@inline': true } } };
  if (branch === 'S') return { pluginDirs: task.sources.map((s) => path.join(root, s.dir)), settings: { enabledPlugins: Object.fromEntries(task.sources.map((s) => [`${s.plugin}@inline`, true])) } };
  if (branch === 'F') return { pluginDirs: [], settings: { enabledPlugins: {} } };
  throw new Error(`unknown branch ${branch}; use K, S or F`);
}

function promptFor(task, variant, branch) {
  if (variant === 'natural') return task.prompt;
  if (variant === 'command') return task.commands && task.commands[branch] ? `${task.commands[branch]} ${task.prompt}` : null;
  throw new Error(`unknown variant ${variant}; use natural or command`);
}

function schedule({ branches, variants, runs, skip = () => false }) {
  const out = [];
  for (const variant of variants) for (let run = 1; run <= runs; run++) for (const branch of branches) if (!skip(variant, branch)) out.push({ variant, branch, run });
  return out;
}

// A source whose copy is missing, is not the plugin named, or is not at the sha pinned in upstream/sources.json
// would measure something other than the release, so the run stops before it starts.
function checkSources(task, root = ROOT) {
  const pins = new Map(JSON.parse(fs.readFileSync(path.join(root, 'upstream', 'sources.json'), 'utf8')).sources.map((s) => [s.name, s.sha]));
  const problems = [];
  for (const s of task.sources) {
    const dir = path.join(root, s.dir);
    let name = null;
    try { name = JSON.parse(fs.readFileSync(path.join(dir, '.claude-plugin', 'plugin.json'), 'utf8')).name; } catch { /* reported below */ }
    if (name !== s.plugin) { problems.push(`${s.dir}: expected plugin ${s.plugin}, found ${name}`); continue; }
    const head = String(spawnSync('git', ['rev-parse', 'HEAD'], { cwd: dir, encoding: 'utf8' }).stdout || '').trim();
    if (head !== pins.get(s.source)) problems.push(`${s.dir}: at ${head.slice(0, 12) || '?'}, pinned ${String(pins.get(s.source) || 'none').slice(0, 12)}`);
  }
  return problems;
}

// On Windows `claude` resolves through a .cmd shim, so the process started is cmd.exe and the session runs in a child
// of it: a timeout that kills cmd.exe alone leaves the session alive, still working in the fixture the next session
// is about to use. The whole tree is killed instead.
function runSession(prompt, setup, opts) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'bearingkit-bench-'));
  const settingsFile = path.join(tmp, 'settings.json');
  fs.writeFileSync(settingsFile, JSON.stringify(setup.settings));
  const promptFile = path.join(tmp, 'prompt.txt');
  fs.writeFileSync(promptFile, prompt);
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--max-turns', String(opts.turns), '--model', opts.model, '--settings', settingsFile];
  for (const d of setup.pluginDirs) args.push('--plugin-dir', d);
  const env = { ...process.env, CLAUDE_CONFIG_DIR: opts.configDir };
  delete env.CLAUDECODE;
  const fd = fs.openSync(promptFile, 'r');
  const quote = (a) => (/\s/.test(a) ? `"${a}"` : a);
  const win = process.platform === 'win32';
  const child = win
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', ['claude', ...args.map(quote)].join(' ')], { stdio: [fd, 'pipe', 'pipe'], env, cwd: opts.cwd, windowsHide: true })
    : spawn('claude', args, { stdio: [fd, 'pipe', 'pipe'], env, cwd: opts.cwd });
  let raw = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (d) => { raw += d; });
  child.stderr.resume();
  return new Promise((resolve) => {
    let cut = false;
    const timer = setTimeout(() => {
      cut = true;
      if (win) spawnSync('taskkill', ['/T', '/F', '/PID', String(child.pid)], { stdio: 'ignore' });
      else child.kill('SIGKILL');
    }, opts.seconds * 1000);
    let done = false;
    const finish = (status, failed) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { fs.closeSync(fd); } catch { /* already closed */ }
      fs.rmSync(tmp, { recursive: true, force: true });
      // A session that never started is recorded as lost, so one bad spawn does not end the run and its results.
      resolve({ raw, cut: cut || failed, status });
    };
    child.on('error', () => finish(null, true));
    child.on('close', (status) => finish(status, false));
  });
}

function scoreRow(p, raw, cut, task, base) {
  const u = usageFrom(raw);
  const sc = scoreAnswer(u.answer || '', task.rules);
  const lost = cut || u.results === 0;
  return { ...p, ...u, cost: u.cost === null ? null : Math.round(u.cost * 1000) / 1000, cut: lost, foundIds: sc.found, missed: sc.missed, decoyIds: sc.decoys, found: sc.found.length, decoys: sc.decoys.length, passed: sc.passed && !lost, invoked: invocations(raw), answerFile: `${base}.answer.md` };
}

const fmt = (s) => (s.median === null ? '–' : `${s.median} (${s.min}–${s.max})`);

function report(task, rows, meta) {
  const lines = [`# Benchmark ${task.id} · ${meta.date}`, '', `Model ${meta.model || '?'} · profile ${meta.configDir || '?'} · fixture ${meta.fixture || '?'} · limits ${meta.seconds || '?'}s, ${meta.turns || '?'} turns · ${rows.length} sessions${meta.stopped ? ` · stopped early: ${meta.stopped}` : ''}${meta.note ? ` · ${meta.note}` : ''}`, '', '## Per branch (median, min–max)', '', '| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |', '|---|---|---|---|---|---|---|---|---|---|---|'];
  for (const variant of [...new Set(rows.map((r) => r.variant))]) {
    for (const branch of [...new Set(rows.map((r) => r.branch))]) {
      const sel = rows.filter((r) => r.variant === variant && r.branch === branch);
      if (!sel.length) continue;
      const s = summarize(sel);
      lines.push(`| ${variant} | ${branch} | ${s.sessions} | ${s.passes} | ${fmt(s.found)} | ${fmt(s.decoys)} | ${fmt(s.total)} | ${fmt(s.fresh)} | ${fmt(s.cost)} | ${fmt(s.turns)} | ${fmt(s.seconds)} |`);
    }
  }
  lines.push('', tokensComparable(rows) ? `Every session saw ${rows[0] ? rows[0].tools : '?'} tools, so token totals compare.` : `Tool counts differ (${[...new Set(rows.map((r) => r.tools))].join(', ')}): token totals do not compare.`);
  lines.push('', '## Sessions', '', '| # | Variant | Branch | Run | Found | Missed | Decoys | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) lines.push(`| ${r.n} | ${r.variant} | ${r.branch} | ${r.run} | ${r.foundIds.join(' ') || '–'} | ${r.missed.join(' ') || '–'} | ${r.decoyIds.join(' ') || '–'} | ${r.passed ? 'yes' : 'no'} | ${r.total ?? '–'} | ${r.cost ?? '–'} | ${r.turns ?? '–'} | ${r.seconds ?? '–'} | ${r.end || '–'} | ${r.results} | ${r.cut ? 'yes' : ''} | ${r.invoked.join(', ') || '–'} | ${r.answerFile} |`);
  return lines.join('\n') + '\n';
}

// Scores a results folder again from its raw streams, with the task's rules as they stand now; the numbers of a run
// scored under older rules are replaced, and the file says so.
function rescore(dir, task) {
  const rows = [];
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.raw.jsonl')).sort()) {
    const m = f.match(/^(\d+)-(\w+)-([KSF])(\d+)\.raw\.jsonl$/);
    if (!m) continue;
    const base = f.replace(/\.raw\.jsonl$/, '');
    rows.push(scoreRow({ n: Number(m[1]), variant: m[2], branch: m[3], run: Number(m[4]) }, fs.readFileSync(path.join(dir, f), 'utf8'), false, task, base));
  }
  fs.writeFileSync(path.join(dir, 'results.md'), report(task, rows, { date: path.basename(dir).slice(0, 10), note: `rescored ${new Date().toISOString().slice(0, 16)}Z from the raw streams with the rules of evals/bench/${task.id}/task.json` }));
  return rows;
}

async function run(argv) {
  const args = parseArgs(argv);
  const bad = preflight(args);
  if (bad) { process.stdout.write(bad.message); process.exitCode = bad.exit; return; }
  const task = loadTask(String(args.task));
  if (args.rescore) {
    const rows = rescore(path.resolve(String(args.rescore)), task);
    process.stdout.write(`rescored ${rows.length} sessions: ${path.join(path.resolve(String(args.rescore)), 'results.md')}\n`);
    return;
  }
  const branches = String(args.branches || 'K,S,F').split(',');
  const variants = String(args.variants || 'natural').split(',');
  const runs = Number(args.runs || 3);
  const opts = { model: String(args.model || 'sonnet'), configDir: path.resolve(String(args['config-dir'])), seconds: Number(args.timeout || task.limits.seconds), turns: Number(args.turns || task.limits.turns) };
  const plan = schedule({ branches, variants, runs, skip: (v, b) => promptFor(task, v, b) === null });
  if (branches.includes('S')) { const p = checkSources(task); if (p.length) { process.stdout.write(`sources not as released:\n  ${p.join('\n  ')}\n`); process.exitCode = 2; return; } }
  const builder = require(path.join(task.dir, task.fixture));
  const above = ancestorMemoryFiles(path.dirname(builder.DST));
  if (above.length) { process.stdout.write(`refusing: memory files above the fixture: ${above.join(', ')}\n`); process.exitCode = 2; return; }
  process.stdout.write(`${plan.length} sessions: ${plan.map((p) => `${p.variant[0]}${p.branch}${p.run}`).join(' ')}\n`);
  if (args['dry-run']) return;
  builder.build();
  const date = new Date().toISOString().slice(0, 10);
  const outDir = path.join(ROOT, 'evals', 'results', `${date}-bench-${task.id}-${variants.join('+')}`);
  fs.mkdirSync(outDir, { recursive: true });
  const meta = { date, ...opts, fixture: builder.DST };
  const rows = [];
  let stopped = null;
  for (const [i, p] of plan.entries()) {
    builder.reset();
    const s = await runSession(promptFor(task, p.variant, p.branch), branchSetup(task, p.branch), { ...opts, cwd: builder.DST });
    const base = `${String(i + 1).padStart(2, '0')}-${p.variant}-${p.branch}${p.run}`;
    fs.writeFileSync(path.join(outDir, `${base}.raw.jsonl`), s.raw);
    const row = scoreRow({ n: i + 1, ...p }, s.raw, s.cut, task, base);
    fs.writeFileSync(path.join(outDir, `${base}.answer.md`), row.answer || '(no final answer)\n');
    rows.push(row);
    process.stdout.write(`${base}: found ${row.foundIds.join(' ') || '-'} · decoys ${row.decoyIds.join(' ') || '-'} · ${row.total ?? '?'} tokens · ${row.seconds ?? '?'}s${row.cut ? ' · CUT' : ''}\n`);
    fs.writeFileSync(path.join(outDir, 'results.md'), report(task, rows, meta));
    const auth = authStop(s.raw);
    if (auth) { stopped = `login failed: ${auth.message}`; break; }
    const q = quotaStop(parseQuota(s.raw), { fiveHour: 0.9, sevenDay: 0.95 });
    if (q) { stopped = `${q.window} window at ${Math.round(q.used * 100)}%`; break; }
  }
  builder.reset();
  fs.writeFileSync(path.join(outDir, 'results.md'), report(task, rows, { ...meta, stopped }));
  process.stdout.write(`${stopped ? `stopped: ${stopped}\n` : ''}results: ${path.join(outDir, 'results.md')}\n`);
}

module.exports = { preflight, loadTask, branchSetup, promptFor, schedule, checkSources, report, rescore, run };
