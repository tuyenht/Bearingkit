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
const { scoreAnswer, usageFrom, invocations, summarize, tokensComparable, perDefect } = require('./lib/bench-score.cjs');

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
// A task that edits and runs code names the permissions it needs; every branch gets the same ones.
function branchSetup(task, branch, root = ROOT) {
  const extra = task.permissions ? { permissions: task.permissions } : {};
  if (branch === 'K') return { pluginDirs: [root], settings: { enabledPlugins: { 'bearingkit@inline': true }, ...extra } };
  if (branch === 'S') return { pluginDirs: task.sources.map((s) => path.join(root, s.dir)), settings: { enabledPlugins: Object.fromEntries(task.sources.map((s) => [`${s.plugin}@inline`, true])), ...extra } };
  if (branch === 'F') return { pluginDirs: [], settings: { enabledPlugins: {}, ...extra } };
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
  const bin = opts.bin || 'claude';
  const child = win
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', [bin, ...args.map(quote)].join(' ')], { stdio: [fd, 'pipe', 'pipe'], env, cwd: opts.cwd, windowsHide: true })
    : spawn(bin, args, { stdio: [fd, 'pipe', 'pipe'], env, cwd: opts.cwd });
  let raw = '';
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (d) => { raw += d; });
  child.stderr.resume();
  const kill = opts.kill || ((pid) => (win ? spawnSync('taskkill', ['/T', '/F', '/PID', String(pid)], { encoding: 'utf8' }).status : (child.kill('SIGKILL') ? 0 : 1)));
  return new Promise((resolve) => {
    let cut = false;
    let killStatus = null;
    let grace = null;
    let done = false;
    let finish = null;
    // 2026-09-25: one session outlived its tree kill by half an hour, still writing heartbeats. Not reproduced, so
    // the cause is unknown; after a grace period the runner gives the session up as an orphan and the run stops, since
    // a live session may still be editing the fixture the next one would use.
    const timer = setTimeout(() => {
      cut = true;
      killStatus = kill(child.pid);
      grace = setTimeout(() => finish(null, true, true), opts.graceMs ?? 60000);
    }, opts.seconds * 1000);
    finish = (status, failed, orphan = false) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      clearTimeout(grace);
      try { fs.closeSync(fd); } catch { /* already closed */ }
      fs.rmSync(tmp, { recursive: true, force: true });
      // A session that never started is recorded as lost, so one bad spawn does not end the run and its results.
      resolve({ raw, cut: cut || failed, status, orphan, killStatus, pid: child.pid });
    };
    child.on('error', () => finish(null, true));
    child.on('close', (status) => finish(status, false));
  });
}

// Defects with `check` take their result from the fixture check the runner made after the session (kept beside the
// stream as <base>.check.json, so a rescore reads the same result); with no check, they are missed. An `optional`
// defect is reported but does not decide the pass.
function scoreRow(p, raw, cut, task, base, check = null) {
  const u = usageFrom(raw);
  const sc = scoreAnswer(u.answer || '', task.rules);
  const byCheck = new Set(task.rules.defects.filter((d) => d.check && check && check[d.check] === true).map((d) => d.id));
  const order = task.rules.defects.map((d) => d.id);
  const foundIds = order.filter((id) => sc.found.includes(id) || byCheck.has(id));
  const missed = order.filter((id) => !foundIds.includes(id));
  const required = new Set(task.rules.defects.filter((d) => !d.optional).map((d) => d.id));
  const lost = cut || u.results === 0;
  const passed = !lost && missed.every((id) => !required.has(id)) && sc.decoys.length === 0 && sc.blocked !== true;
  return { ...p, ...u, cost: u.cost === null ? null : Math.round(u.cost * 1000) / 1000, cut: lost, foundIds, missed, decoyIds: sc.decoys, blocked: sc.blocked, found: foundIds.length, decoys: sc.decoys.length, passed, check, invoked: invocations(raw), answerFile: `${base}.answer.md` };
}

// The median of an even count is a mean of two values, which prints with float noise unless rounded.
const round3 = (x) => (Number.isInteger(x) ? x : Math.round(x * 1000 + Number.EPSILON) / 1000);
const fmt = (s) => (s.median === null ? '–' : `${round3(s.median)} (${s.min}–${s.max})`);

function report(task, rows, meta) {
  const lines = [`# Benchmark ${task.id} · ${meta.date}`, '', `Model ${meta.model || '?'} · profile ${meta.configDir || '?'} · fixture ${meta.fixture || '?'} · limits ${meta.seconds || '?'}s, ${meta.turns || '?'} turns · ${rows.length} sessions${meta.stopped ? ` · stopped early: ${meta.stopped}` : ''}${meta.note ? ` · ${meta.note}` : ''}`, '', '## Per branch (median, min–max)', '', '| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |', '|---|---|---|---|---|---|---|---|---|---|---|---|'];
  for (const variant of [...new Set(rows.map((r) => r.variant))]) {
    for (const branch of [...new Set(rows.map((r) => r.branch))]) {
      const sel = rows.filter((r) => r.variant === variant && r.branch === branch);
      if (!sel.length) continue;
      const s = summarize(sel);
      lines.push(`| ${variant} | ${branch} | ${s.sessions} | ${s.passes} | ${fmt(s.found)} | ${fmt(s.decoys)} | ${s.blocked === null ? '–' : s.blocked} | ${fmt(s.total)} | ${fmt(s.fresh)} | ${fmt(s.cost)} | ${fmt(s.turns)} | ${fmt(s.seconds)} |`);
    }
  }
  lines.push('', '## Each defect and decoy, sessions that found or flagged it', '');
  for (const variant of [...new Set(rows.map((r) => r.variant))]) for (const branch of [...new Set(rows.map((r) => r.branch))]) {
    const sel = rows.filter((r) => r.variant === variant && r.branch === branch);
    if (sel.length) lines.push(`- ${variant} ${branch}: ${Object.entries(perDefect(sel, task.rules)).map(([id, n]) => `${id} ${n}/${sel.length}`).join(' · ')}`);
  }
  lines.push('', tokensComparable(rows) ? `Every session saw ${rows[0] ? rows[0].tools : '?'} tools, so token totals compare.` : `Tool counts differ (${[...new Set(rows.map((r) => r.tools))].join(', ')}): token totals do not compare.`);
  lines.push('', '## Sessions', '', '| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const r of rows) lines.push(`| ${r.n} | ${r.variant} | ${r.branch} | ${r.run} | ${r.foundIds.join(' ') || '–'} | ${r.missed.join(' ') || '–'} | ${r.decoyIds.join(' ') || '–'} | ${r.blocked === null || r.blocked === undefined ? '–' : r.blocked ? 'yes' : 'no'} | ${r.passed ? 'yes' : 'no'} | ${r.total ?? '–'} | ${r.cost ?? '–'} | ${r.turns ?? '–'} | ${r.seconds ?? '–'} | ${r.end || '–'} | ${r.results} | ${r.cut ? 'yes' : ''} | ${r.invoked.join(', ') || '–'} | ${r.answerFile} |`);
  return lines.join('\n') + '\n';
}

// Scores a results folder again from its raw streams, with the task's rules as they stand now; the numbers of a run
// scored under older rules are replaced, and the file says so.
// The run's meta.json (model, profile, fixture, limits, and the sessions the runner cut) is read back, so a rescore
// keeps the header and the cut flag of a session that was stopped after it had already answered once.
function rescore(dir, task) {
  const rows = [];
  let meta = {};
  try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8')); } catch { /* a folder from before meta.json */ }
  const cutBases = new Set(meta.cut || []);
  for (const f of fs.readdirSync(dir).filter((n) => n.endsWith('.raw.jsonl')).sort()) {
    const m = f.match(/^(\d+)-(\w+)-([KSF])(\d+)\.raw\.jsonl$/);
    if (!m) continue;
    const base = f.replace(/\.raw\.jsonl$/, '');
    const checkFile = path.join(dir, `${base}.check.json`);
    const check = fs.existsSync(checkFile) ? JSON.parse(fs.readFileSync(checkFile, 'utf8')) : null;
    rows.push(scoreRow({ n: Number(m[1]), variant: m[2], branch: m[3], run: Number(m[4]) }, fs.readFileSync(path.join(dir, f), 'utf8'), cutBases.has(base), task, base, check));
  }
  fs.writeFileSync(path.join(dir, 'results.md'), report(task, rows, { ...meta, date: meta.date || path.basename(dir).slice(0, 10), note: `rescored ${new Date().toISOString().slice(0, 16)}Z from the raw streams with the rules of evals/bench/${task.id}/task.json` }));
  return rows;
}

// A run never writes into a folder that already holds one: the model is in the name unless it is the default, and a
// second run on the same day gets a numbered folder, so a calibration's streams are never overwritten by the next run.
function resultsDir(root, date, id, variants, model) {
  const base = path.join(root, 'evals', 'results', `${date}-bench-${id}-${variants.join('+')}${model && model !== 'sonnet' ? `-${model}` : ''}`);
  const used = (d) => fs.existsSync(d) && fs.readdirSync(d).length > 0;
  let dir = base;
  for (let n = 2; used(dir); n++) dir = `${base}-${n}`;
  return dir;
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
  const outDir = resultsDir(ROOT, date, task.id, variants, opts.model);
  fs.mkdirSync(outDir, { recursive: true });
  const meta = { date, ...opts, fixture: builder.DST };
  const rows = [];
  let stopped = null;
  let orphaned = false;
  for (const [i, p] of plan.entries()) {
    builder.reset();
    const s = await runSession(promptFor(task, p.variant, p.branch), branchSetup(task, p.branch), { ...opts, cwd: builder.DST });
    const base = `${String(i + 1).padStart(2, '0')}-${p.variant}-${p.branch}${p.run}`;
    fs.writeFileSync(path.join(outDir, `${base}.raw.jsonl`), s.raw);
    // A check that throws (a file held open on Windows) costs that session its checks, not the run.
    let check = null;
    // An orphan may still be writing the fixture, so its checks are not run: they would read a moving target.
    if (builder.check && !s.orphan) try { check = builder.check(builder.DST, s.raw); } catch (e) { check = { error: String(e && e.message || e) }; }
    if (check) fs.writeFileSync(path.join(outDir, `${base}.check.json`), JSON.stringify(check) + '\n');
    const row = scoreRow({ n: i + 1, ...p }, s.raw, s.cut, task, base, check);
    fs.writeFileSync(path.join(outDir, `${base}.answer.md`), row.answer || '(no final answer)\n');
    rows.push(row);
    process.stdout.write(`${base}: found ${row.foundIds.join(' ') || '-'} · decoys ${row.decoyIds.join(' ') || '-'} · ${row.total ?? '?'} tokens · ${row.seconds ?? '?'}s${row.cut ? ' · CUT' : ''}\n`);
    fs.writeFileSync(path.join(outDir, 'results.md'), report(task, rows, meta));
    fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify({ ...meta, cut: rows.filter((r) => r.cut).map((r) => r.answerFile.replace(/\.answer\.md$/, '')) }) + '\n');
    if (s.orphan) { orphaned = true; stopped = `session ${base} outlived its kill (exit ${s.killStatus}, pid ${s.pid}); stopped, and the fixture left as it is, so nothing resets it under a live session`; break; }
    const auth = authStop(s.raw);
    if (auth) { stopped = `login failed: ${auth.message}`; break; }
    const q = quotaStop(parseQuota(s.raw), { fiveHour: 0.9, sevenDay: 0.95 });
    if (q) { stopped = `${q.window} window at ${Math.round(q.used * 100)}%`; break; }
  }
  // A reset is a hard git reset of the directory an orphan may still be working in; it is left to the owner then.
  if (!orphaned) builder.reset();
  fs.writeFileSync(path.join(outDir, 'results.md'), report(task, rows, { ...meta, stopped }));
  if (stopped) fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify({ ...meta, stopped, cut: rows.filter((r) => r.cut).map((r) => r.answerFile.replace(/\.answer\.md$/, '')) }) + '\n');
  process.stdout.write(`${stopped ? `stopped: ${stopped}\n` : ''}results: ${path.join(outDir, 'results.md')}\n`);
}

module.exports = { preflight, loadTask, branchSetup, promptFor, schedule, checkSources, report, rescore, resultsDir, run, runSession };
