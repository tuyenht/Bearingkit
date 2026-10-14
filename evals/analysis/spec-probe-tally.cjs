#!/usr/bin/env node
// Tally of the bk-spec head probe (docs/specs/2026-10-09-bk-spec-head-probe-design.md, "Planned registration").
// Read only; it holds no bar and prints no verdict: the session that records the result sets these figures against
// the registration. It runs no session and does not read the Windows System log: the names of sessions whose run
// holds a sleep event are passed to it with --sleep. `M` (the changed text reached) is read with skill-loaded.cjs,
// not here.
// Usage, from the repository root:
//   node evals/analysis/spec-probe-tally.cjs <results folder>... [--stack python] [--branch <name>] [--sleep K3,K5]
//                                                               [--expect 8]
//   --stack   the stack file, without ".md"; default: the task's own (py-01 python, php-01 php-laravel, build-01 node)
//   --branch  read only folders whose meta.json names this kit.branch; a folder with no kit.branch is named, not read
//   --sleep   session names (K3, or the full base 03-natural-K3) whose run holds a sleep event
//   --expect  the number of counted sessions the call should have made; fewer streams are named as never started
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { events, median, reach } = require('../../scripts/lib/bench-score.cjs');
const { completed } = require('./cpp-tally.cjs');

const TASK_STACK = { 'py-01': 'python', 'php-01': 'php-laravel', 'build-01': 'node' };
const DENIED = /denied|not allowed|requires approval|permission/i; // the scorer's refusal test (bench-score reach())
const CUT_AFTER = /^(?:head|tail|more)\b|^sed\s+(?:-[a-zA-Z]*\s+)*-[a-zA-Z]*n[a-zA-Z]*(?=\s)|^(?:select-object|select)\s+.*-(?:first|last)\b/i;
const RUNS = /^(?:\(\s*)*(?:\$?\w+\s*=\s*\$?\(?\s*)?(?:&\s*)?(?:\w+=\S*\s+)*(?:"[^"]*node(?:\.exe)?"|'[^']*node(?:\.exe)?'|node(?:\.exe)?)\s+(?:"[^"]*detect-stack\.cjs"|'[^']*detect-stack\.cjs'|\S*detect-stack\.cjs)(?=[\s)]|$)/i;
const READERS = /(?:^|[\s|;(&])(?:cat|type|get-content|gc|sed|head|tail|grep|rg|less|select-string)(?=\s)/i;
const SEARCH = /(?:^|[\s|;(&])(?:grep|rg)\s+(?:-{1,2}[A-Za-z][\w-]*(?:=\S*)?(?:\s+\d+)?\s+)*(?:"[^"]*"|'[^']*'|\S+)/i;
const operands = (stage) => { const m = SEARCH.exec(stage); return m ? stage.slice(m.index + m[0].length) : stage; };

const content = (e) => (e.message && Array.isArray(e.message.content) ? e.message.content : []);
const text = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map((x) => (x && x.text) || '').join('\n') : '');
const slashed = (s) => String(s).replace(/\\+/g, '/');

// Segments of a shell command: split on ;, &&, || and newlines; each segment is a pipeline split on single |.
// The separators inside a quoted string are blanked first, so that a quoted pipe does not make a stage.
function segments(command) {
  const blanked = String(command || '').replace(/"[^"\n]*"|'[^'\n]*'/g, (m) => m.replace(/[|;&]/g, ' '));
  return blanked.split(/\r?\n|;|&&|\|\|/).map((s) => s.split(/(?<!\|)\|(?!\|)/).map((x) => x.trim())).filter((p) => p[0] !== '' || p.length > 1);
}
// Does this command run detect-stack (as the first stage of a pipeline), and is a later stage of that pipeline a cut?
function runsDetect(command) {
  let runs = false; let cut = false;
  for (const p of segments(command)) {
    if (!RUNS.test(p[0])) continue;
    runs = true;
    if (p.slice(1).some((stage) => CUT_AFTER.test(stage))) cut = true;
  }
  return { runs, cut };
}
const names = (input, stack) => new RegExp(`stacks/${stack.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.md\\b`).test(slashed(JSON.stringify(input || {})));
const refusal = (c) => c.is_error && !/^\s*Exit code \d+/.test(text(c.content)) && DENIED.test(text(c.content));

// One session's stream against one stack file: Rrun, T, L (and whether the call that showed the list ran
// detect-stack), first and content, as the registration defines them. A call the host refused is known by its
// permission_denied event, whatever the wording of its result.
function analyse(raw, stack) {
  const listRe = new RegExp(`"stackFiles"\\s*:\\s*\\[[^\\]]*${stack.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.md"`);
  const evs = events(raw);
  const denied = new Set(evs.filter((e) => e && e.type === 'system' && e.subtype === 'permission_denied' && e.tool_use_id).map((e) => e.tool_use_id));
  const calls = new Map();
  let order = 0; let firstName = null; let firstEdit = null;
  const out = { Rrun: false, RrunExitOnly: false, T: false, TRefusedOnly: false, L: false, Lrun: false, first: 'none', content: 'none' };
  let namedAny = false; let readAny = false; let runOk = false; let runExit = false; let cutRan = false; let cutRefused = false;
  for (const e of evs) for (const c of content(e)) {
    if (c.type === 'tool_use') {
      order += 1;
      const i = c.input || {};
      const shell = c.name === 'Bash' || c.name === 'PowerShell';
      const d = shell ? runsDetect(i.command) : { runs: false, cut: false };
      if (d.cut) out.T = true;
      let reads = false;
      if (['Read', 'Grep', 'Bash', 'PowerShell'].includes(c.name) && names(i, stack)) {
        namedAny = true;
        if (firstName === null) firstName = order;
        if (c.name === 'Read') reads = names({ p: i.file_path }, stack);
        else if (c.name === 'Grep') reads = names({ p: i.path }, stack);
        else reads = segments(i.command).some((p) => p.some((stage) => READERS.test(` ${stage}`) && names({ p: operands(stage) }, stack)));
      }
      if (['Edit', 'Write', 'NotebookEdit'].includes(c.name) && firstEdit === null) firstEdit = order;
      calls.set(c.id, { runs: d.runs, cut: d.cut, reads });
    } else if (c.type === 'tool_result') {
      const call = calls.get(c.tool_use_id) || { runs: false, cut: false, reads: false };
      const refused = refusal(c) || denied.has(c.tool_use_id);
      if (call.cut && !refused) cutRan = true;
      if (call.cut && refused) cutRefused = true;
      if (call.runs && !refused) { if (c.is_error) runExit = true; else runOk = true; }
      if (call.reads && !c.is_error && !denied.has(c.tool_use_id)) readAny = true;
      if (listRe.test(slashed(text(c.content)))) { out.L = true; if (call.runs) out.Lrun = true; }
    }
  }
  out.Rrun = runOk || runExit;
  out.RrunExitOnly = runExit && !runOk;
  out.TRefusedOnly = out.T && cutRefused && !cutRan;
  if (firstName !== null) {
    out.first = firstEdit === null ? 'no-edit' : firstName < firstEdit ? 'before-edit' : 'after-edit';
    out.content = readAny ? 'yes' : namedAny ? 'no' : 'none';
  }
  return out;
}

function readFolder(dir, opts = {}) {
  const meta = JSON.parse(fs.readFileSync(path.join(dir, 'meta.json'), 'utf8'));
  const name = path.basename(dir);
  const branch = meta.kit && meta.kit.branch;
  if (opts.branch && !branch) return { name, skipped: 'meta.json has no kit.branch: named, not read', rows: [] };
  if (opts.branch && branch !== opts.branch) return { name, skipped: `kit.branch ${branch}, not ${opts.branch}`, rows: [] };
  const task = (name.match(/bench-(\w+-\d+)-/) || [])[1];
  const stack = opts.stack || TASK_STACK[task];
  if (!stack) throw new Error(`no stack file for ${name}: pass --stack`);
  const sleep = new Set(opts.sleep || []);
  const join = (a, b) => (a && a !== b ? `${a}+${b}` : b);
  const rows = fs.readdirSync(dir).filter((f) => /-K\d+\.raw\.jsonl$/.test(f)).sort().map((f) => {
    const base = f.replace('.raw.jsonl', '');
    const raw = fs.readFileSync(path.join(dir, f), 'utf8');
    let c = {};
    try { c = JSON.parse(fs.readFileSync(path.join(dir, `${base}.check.json`), 'utf8')); } catch { /* a cut session may leave no check */ }
    let model = null; let host = null; let inits = 0; let cost = null; let seconds = null; let tokens = null; let refused = 0; const skills = [];
    for (const e of events(raw)) {
      if (e.type === 'system' && e.subtype === 'init') { inits += 1; model = join(model, e.model); host = join(host, e.claude_code_version); }
      if (e.type === 'result') {
        cost = typeof e.total_cost_usd === 'number' ? Number(e.total_cost_usd.toFixed(4)) : null; seconds = e.duration_ms ? Math.round(e.duration_ms / 1000) : null;
        const u = e.usage || {};
        tokens = (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
        refused = Array.isArray(e.permission_denials) ? e.permission_denials.length : 0;
      }
      for (const x of content(e)) if (x.type === 'tool_use' && x.name === 'Skill') skills.push(String((x.input || {}).skill || ''));
    }
    const a = analyse(raw, stack);
    const r = reach(raw, stack);
    const fileSeen = typeof c.Rfile === 'boolean' ? c.Rfile : r.file;
    const flags = [];
    if ((meta.cut || []).includes(base)) flags.push('cut');
    if (!completed(raw)) flags.push('not-completed');
    const short = (base.match(/-(K\d+)$/) || [])[1];
    if (sleep.has(base) || sleep.has(short)) flags.push('sleep');
    return {
      folder: name, base, stack, model, host, inits, flags,
      Rfile: flags.length ? false : fileSeen, RfileRaw: fileSeen, RfileFrom: typeof c.Rfile === 'boolean' ? 'check' : 'reach',
      Rdetect: c.Rdetect ?? r.detect, RdetectFrom: c.Rdetect !== undefined ? 'check' : 'reach', ...a,
      O1: c.O1, O2: c.O2, Y1: c.Y1, Y2: c.Y2, Y3: c.Y3, X: c.X, cost, seconds, tokens, refused, skills,
    };
  });
  return { name, branch, stack, kit: meta.kit, cut: meta.cut, rows };
}

// The fixed reading of T, L and Rrun over eight sessions (high at least 5 of 8, low at most 2 of 8), rows in order.
// A session never started is counted as no, so the total is passed apart from the rows.
function readingRow(rows, total = rows.length) {
  if (total !== 8) return null;
  const n = (k) => rows.filter((r) => r[k]).length;
  const high = (k) => n(k) >= 5; const low = (k) => n(k) <= 2;
  if (low('Rrun')) return 1;
  if (high('T') && low('L')) return 2;
  if (high('L')) return 3;
  return 4;
}

function main(argv) {
  const opts = { sleep: [] }; const dirs = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--stack') opts.stack = argv[++i];
    else if (argv[i] === '--branch') opts.branch = argv[++i];
    else if (argv[i] === '--sleep') opts.sleep = String(argv[++i] || '').split(',').filter(Boolean);
    else if (argv[i] === '--expect') opts.expect = Number(argv[++i]);
    else if (/^(?:\d+-\w+-)?K\d+(?:,(?:\d+-\w+-)?K\d+)*,?$/.test(argv[i])) opts.sleep.push(...argv[i].split(',').filter(Boolean));
    else if (argv[i].startsWith('--')) { process.stderr.write(`unknown option ${argv[i]}; write "--name value"\n`); process.exit(2); }
    else dirs.push(argv[i]);
  }
  if (!dirs.length) { process.stderr.write('usage: spec-probe-tally.cjs <results folder>... [--stack python] [--branch <name>] [--sleep K3,K5] [--expect 8]\n'); process.exit(2); }
  const yn = (v) => (v === true ? 'y' : v === false ? 'n' : '-');
  const rows = [];
  for (const d of dirs) {
    if (!fs.existsSync(path.join(d, 'meta.json'))) { console.log(`${d}: absent (no meta.json); nothing substituted`); continue; }
    const f = readFolder(d, opts);
    if (f.skipped) { console.log(`${f.name}: skipped, ${f.skipped}`); continue; }
    console.log(`${f.name}: kit ${JSON.stringify(f.kit)} cut ${JSON.stringify(f.cut)}`);
    rows.push(...f.rows);
  }
  const have = new Set(rows.flatMap((r) => [r.base, (r.base.match(/-(K\d+)$/) || [])[1]]));
  for (const s of opts.sleep) if (!have.has(s)) console.log(`WARNING: --sleep ${s} matches no session`);
  console.log('folder | session | stack | model | host | inits | flags | Rfile (from) | Rdetect | Rrun | T | L (run) | first | content | O1 O2 | Y1 Y2 Y3 X | refused | cost | s | tokens | skills');
  for (const r of rows) console.log([r.folder, r.base, r.stack, r.model, r.host, r.inits, r.flags.join(',') || '-', `${yn(r.Rfile)} (${r.RfileFrom}${r.flags.length ? `, as streamed ${yn(r.RfileRaw)}` : ''})`, `${r.Rdetect}${r.RdetectFrom === 'reach' ? ' (reach)' : ''}`, `${yn(r.Rrun)}${r.RrunExitOnly ? ' (error only)' : ''}`, `${yn(r.T)}${r.TRefusedOnly ? ' (refused only)' : ''}`, `${yn(r.L)} (${yn(r.Lrun)})`, r.first, r.content, `${yn(r.O1)} ${yn(r.O2)}`, `${yn(r.Y1)} ${yn(r.Y2)} ${yn(r.Y3)} ${yn(r.X)}`, r.refused, r.cost, r.seconds, r.tokens, r.skills.join(',') || '-'].join(' | '));
  const total = Math.max(rows.length, opts.expect || 0);
  const n = (k, v = true) => rows.filter((r) => r[k] === v).length;
  const of = (k) => `${n(k)} of ${total}`;
  console.log(`sessions read: ${rows.length}; models: ${[...new Set(rows.map((r) => r.model))].join(', ')}; hosts: ${[...new Set(rows.map((r) => r.host))].join(', ')}; no init: ${rows.filter((r) => !r.inits).map((r) => r.base).join(', ') || 'none'}`);
  if (!opts.expect) console.log('WARNING: --expect not given; a session missing from the folder would not be seen');
  else if (rows.length > opts.expect) console.log(`WARNING: ${rows.length} streams, more than the ${opts.expect} expected (is the uncounted session's folder included?)`);
  else { const have8 = new Set(rows.map((r) => (r.base.match(/-(K\d+)$/) || [])[1])); const gone = Array.from({ length: opts.expect }, (_, i) => `K${i + 1}`).filter((k) => !have8.has(k)); console.log(`expected ${opts.expect} counted sessions, streams found ${rows.length}${gone.length ? `: never started, counted as cut and no: ${gone.join(', ')}` : ''}`); }
  const flagged = rows.filter((r) => r.flags.length);
  console.log(`cut, not completed or sleep-hit (counted M no and Rfile no; M comes from skill-loaded.cjs, so set these names to no by hand): ${flagged.map((r) => `${r.base} [${r.flags.join(',')}]`).join(', ') || 'none'}`);
  console.log(`Rfile ${of('Rfile')} · Rdetect ran ${rows.filter((r) => r.Rdetect === 'ran').length} of ${total} · Rrun ${of('Rrun')} (by an error result only ${of('RrunExitOnly')}) · T ${of('T')} (by a refused call only ${of('TRefusedOnly')}) · L ${of('L')} (by a detect-stack run ${of('Lrun')})`);
  const tallyOf = (k, set) => Object.entries(set.reduce((m, r) => ({ ...m, [r[k]]: (m[r[k]] || 0) + 1 }), {})).map(([v, c]) => `${v} ${c}`).join(', ');
  const rf = rows.filter((r) => r.Rfile);
  console.log(`among the ${rf.length} Rfile sessions: first: ${tallyOf('first', rf)} · content: ${tallyOf('content', rf)}; all sessions as streamed: first: ${tallyOf('first', rows)} · content: ${tallyOf('content', rows)}`);
  console.log(`O1 ${of('O1')} · O2 ${of('O2')} · Y1 ${of('Y1')} · Y2 ${of('Y2')} · Y3 ${of('Y3')} · X ${of('X')} · refused calls ${rows.reduce((s, r) => s + r.refused, 0)}`);
  const num = (k) => rows.map((r) => r[k]).filter((x) => typeof x === 'number');
  const span = (k) => { const xs = num(k); return xs.length ? `${median(xs)} (${Math.min(...xs)} to ${Math.max(...xs)})` : '-'; };
  console.log(`cost median ${span('cost')} · seconds median ${span('seconds')} · tokens median ${span('tokens')}`);
  const row = readingRow(rows, total);
  console.log(row === null ? 'reading of T, L and Rrun: not applicable (not eight sessions)' : `reading of T, L and Rrun (descriptive, used only after a no-go with V and R holding): row ${row}`);
}

if (require.main === module) main(process.argv.slice(2));
module.exports = { segments, runsDetect, analyse, readFolder, readingRow };
