// Tally of the cpp-01 measurement (docs/specs/2026-10-08-stack-c-cpp-design.md, "Registered"). Read only; it holds
// no bar and prints no verdict: the figures are set against the registration by the session that records the result.
// It reads evals/results/cpp-log.txt, written by cpp-run.cjs, and takes the directories of the lines of one step.
// Usage, from the repository root: node evals/analysis/cpp-tally.cjs <step> [resultsDir]
//   step: uncounted | strial | probe | calibration | usable | guard | build-01
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { permutationTest, median, events } = require('../../scripts/lib/bench-score.cjs');

const BEFORE = 'stack-c-cpp-before';
const content = (e) => (e.message && Array.isArray(e.message.content) ? e.message.content : []);
const text = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map((x) => (x && x.text) || '').join('\n') : '');

// The S trial's sign: a Skill call naming the source skill whose result is not an error.
function sourceRead(raw, skill = 'fullstack-dev-skills:cpp-pro') {
  const asked = new Set();
  for (const e of events(raw)) for (const c of content(e)) {
    if (c.type === 'tool_use' && c.name === 'Skill' && String((c.input || {}).skill || (c.input || {}).name || (c.input || {}).command || '').trim().replace(/^\//, '').split(/\s/)[0] === skill) asked.add(c.id);
    else if (c.type === 'tool_result' && asked.has(c.tool_use_id) && !c.is_error) return true;
  }
  return false;
}

// The uncounted session's proof that the toolchain reached it: a shell call that builds (cmake --build, ninja, or the
// compiler itself) whose result is not an error.
function builtOnce(raw) {
  const asked = new Set();
  for (const e of events(raw)) for (const c of content(e)) {
    if (c.type === 'tool_use' && (c.name === 'Bash' || c.name === 'PowerShell') && /cmake\s+--build|\bninja\b|\bg\+\+|\bgcc\b/.test(String((c.input || {}).command || ''))) asked.add(c.id);
    else if (c.type === 'tool_result' && asked.has(c.tool_use_id) && !c.is_error && !/^\s*Exit code (?!0\b)/.test(text(c.content))) return true;
  }
  return false;
}

// A session cut, or not completed after its init, is counted against the kit, as registered: K-after as passing
// nothing and not opening the file; K-before and S as passing everything. An F session is only named: it enters no
// test.
function counted(row) {
  if (!row.cut) return row;
  if (row.label === 'F') return { ...row, asCut: true };
  if (row.label === 'K-after') return { ...row, H: 0, H1: false, H2: false, H3: false, H5: false, O1: false, O2: false, O3: false, P3: false, Rfile: false, asCut: true };
  return { ...row, H: 4, H1: true, H2: true, H3: true, H5: true, O1: true, O2: true, ...(row.label === 'S' ? { source: false } : {}), asCut: true };
}

// Not completed: the last result event is not a success (a session that ran out of its turns is one), or there is none.
function completed(raw) {
  const last = events(raw).filter((e) => e.type === 'result').pop();
  return !!last && last.subtype === 'success' && last.is_error === false;
}

// The directories of a step, from the driver's log: every call line of that step that made a directory, whatever
// its exit (a session that began is counted).
function dirsOf(lines, step) {
  return lines.map((l) => l.match(new RegExp(`^\\S+ ${step} \\S+ \\S+ \\S+ \\S+ runs=\\d+ exit=\\S+ dir=(\\S+) `))).filter(Boolean).map((m) => m[1]).filter((d) => d !== '?');
}

function read(R, dir) {
  const meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8'));
  return fs.readdirSync(path.join(R, dir)).filter((n) => n.endsWith('.raw.jsonl')).sort().map((f) => {
    const base = f.replace('.raw.jsonl', '');
    const b = base.match(/-(?:natural|command)-([A-Z])\d+$/)[1];
    const label = b === 'S' ? 'S' : b === 'F' ? 'F' : meta.kit.branch === BEFORE ? 'K-before' : 'K-after';
    const raw = fs.readFileSync(path.join(R, dir, f), 'utf8');
    let c = {};
    try { c = JSON.parse(fs.readFileSync(path.join(R, dir, `${base}.check.json`), 'utf8')); } catch { /* a cut session may leave no check */ }
    let model = null; let host = null; let cost = null; let seconds = null; let refused = 0; let inits = 0; const skills = [];
    const end = fs.statSync(path.join(R, dir, f)).mtime.toISOString();
    for (const e of events(raw)) {
      if (e.type === 'system' && e.subtype === 'init') { inits += 1; model = e.model; host = e.claude_code_version; }
      if (e.type === 'result') { cost = e.total_cost_usd; seconds = Math.round((e.duration_ms || 0) / 1000); refused = Array.isArray(e.permission_denials) ? e.permission_denials.length : 0; }
      for (const x of content(e)) if (x.type === 'tool_use' && x.name === 'Skill') skills.push(String((x.input || {}).skill || ''));
    }
    return counted({ dir, base, label, scored: `H ${c.H ?? 'none'} O1 ${c.O1 ?? 'none'}`, noCheck: typeof c.H !== 'number', cut: (meta.cut || []).includes(base) || !completed(raw), end, model, host, inits, H: c.H ?? 0, H1: !!c.H1, H2: !!c.H2, H3: !!c.H3, H5: !!c.H5, O1: !!c.O1, O2: !!c.O2, O3: c.O3, P3: c.P3, X: !!c.X, Rfile: !!c.Rfile, Rdetect: c.Rdetect, P4: c.P4, P5: c.P5, source: sourceRead(raw), built: builtOnce(raw), skills, cost, seconds, refused });
  });
}

if (require.main === module) {
  const step = process.argv[2];
  const R = process.argv[3] || path.join(__dirname, '..', 'results');
  if (!step) { console.error('usage: cpp-tally.cjs <step> [resultsDir]'); process.exit(2); }
  const rows = dirsOf(fs.readFileSync(path.join(R, 'cpp-log.txt'), 'utf8').split('\n'), step).flatMap((d) => read(R, d));
  const yn = (v) => (v === true ? 'y' : v === false ? 'n' : '-');
  console.log('dir | session | branch | model | host | inits | H | H1 H2 H3 H5 | O1 O2 | O3 P3 | X | file | detect | source | built | cut | refused | cost | s | written | skills');
  for (const r of rows) console.log([r.dir, r.base, r.label, r.model, r.host, r.inits, r.H, [r.H1, r.H2, r.H3, r.H5].map(yn).join(' '), `${yn(r.O1)} ${yn(r.O2)}`, `${yn(r.O3)} ${yn(r.P3)}`, yn(r.X), yn(r.Rfile), r.Rdetect, yn(r.source), yn(r.built), r.asCut ? 'CUT' : '', r.refused, r.cost, r.seconds, r.end, r.skills.join(',')].join(' | '));
  const by = {};
  for (const r of rows) (by[r.label] = by[r.label] || []).push(r);
  const count = (xs, k) => `${xs.filter((r) => r[k]).length}/${xs.length}`;
  for (const [label, xs] of Object.entries(by)) console.log(`${label}: n=${xs.length} · H ${xs.map((r) => r.H).join(' ')} (mean ${xs.reduce((s, r) => s + r.H, 0) / xs.length}, median ${median(xs.map((r) => r.H))}) · H1 ${count(xs, 'H1')} H2 ${count(xs, 'H2')} H3 ${count(xs, 'H3')} H5 ${count(xs, 'H5')} · O1 ${count(xs, 'O1')} O2 ${count(xs, 'O2')} O3 ${count(xs, 'O3')} P3 ${count(xs, 'P3')} X ${count(xs, 'X')} · file ${count(xs, 'Rfile')} · source ${count(xs, 'source')} · cost median ${median(xs.map((r) => r.cost).filter((x) => x !== null))} · seconds median ${median(xs.map((r) => r.seconds).filter((x) => x !== null))}`);
  const cuts = rows.filter((r) => r.asCut);
  if (cuts.length) console.log(`cut or not completed, counted as registered: ${cuts.map((r) => `${r.base} (${r.label}; as scored: ${r.scored})`).join(', ')}`);
  const blind = rows.filter((r) => r.noCheck && !r.asCut);
  if (blind.length) console.log(`completed with no score in check.json, read as H 0: ${blind.map((r) => r.base).join(', ')}`);
  const H = (label) => (by[label] || []).map((r) => r.H);
  if (H('K-after').length && H('K-before').length) console.log(`H, K-after against K-before: p = ${permutationTest(H('K-after'), H('K-before'))}`);
  if (H('K-after').length && H('S').length) console.log(`H, K-after against S: p = ${permutationTest(H('K-after'), H('S'))}`);
}

module.exports = { sourceRead, builtOnce, counted, completed, dirsOf };
