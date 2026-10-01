// Tally of the second registration of shell-01 (docs/specs/2026-10-01-stack-shell-design.md, "Addendum 2"). Read
// only. Takes the directories from evals/results/shell-rep-log.txt, written by shell-rep-run.cjs: the last complete
// occurrence of each round (a round that stopped part-way and was re-run counts once, from the re-run).
// Groups: natural K by the kit branch (K-before, K-after); command K and command S (the wrapped source).
// Usage, from the repository root: node evals/analysis/shell-rep-tally.cjs [resultsDir]
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { permutationTest, median, events } = require('../../scripts/lib/bench-score.cjs');
const R = process.argv[2] || path.join(__dirname, '..', 'results');
const lines = fs.readFileSync(path.join(R, 'shell-rep-log.txt'), 'utf8').split('\n');
const BEFORE = 'p4d-shell-before';
const SOURCE_COMMAND = 'antigravity-core-shell:powershell-windows';
// What the source's own template and tables would leave in a script that followed them (described, no bar).
// `-Depth 10` is left out: shell.md asks for -Depth too, and 10 is a common choice.
const TRACES = [['EAP Continue', /\$ErrorActionPreference\s*=\s*\\?["']Continue\\?["']/i], ['[OK] marker', /\[OK\]/], ['Out-File -Encoding UTF8', /Out-File[^\n]*-Encoding\s+UTF8/i]];

const rounds = {}; let open = null;
for (const l of lines) {
  let m;
  if ((m = l.match(/ round (\d+) of \d+ start$/))) open = { n: m[1], dirs: [] };
  else if ((m = l.match(/ round (\d+) of \d+ complete$/)) && open && open.n === m[1]) { rounds[m[1]] = open.dirs; open = null; }
  else if ((m = l.match(/ shell-01(?:-src)? (?:natural|command) \S+ \S+ runs=\d+ exit=0 dir=(\S+) .*dirty=false$/)) && open) open.dirs.push(m[1]);
  else if (/^STOP /.test(l)) open = null; // a stop right after a logged line voids the open round
}
const IDS = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
const read = (dir) => {
  const meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8'));
  return fs.readdirSync(path.join(R, dir)).filter((n) => n.endsWith('.check.json')).sort().map((f) => {
    const c = JSON.parse(fs.readFileSync(path.join(R, dir, f), 'utf8'));
    const [, variant, b] = f.match(/-(natural|command)-([A-Z])\d+/);
    const label = variant === 'command' ? (b === 'S' ? 'cmd-S2' : b === 'K' ? 'cmd-K' : 'other') : b !== 'K' ? 'other' : meta.kit.branch === BEFORE ? 'K-before' : 'K-after';
    let cost = null; let model = '?'; let end = '?'; let tools = 0; let refused = 0; let listed = false; const skills = []; const written = [];
    for (const e of events(fs.readFileSync(path.join(R, dir, f.replace('.check.json', '.raw.jsonl')), 'utf8'))) {
      if (e.type === 'system' && e.subtype === 'init') { model = e.model; listed = (e.slash_commands || []).includes(SOURCE_COMMAND); }
      if (e.type === 'result') { cost = e.total_cost_usd; end = e.subtype; refused = Array.isArray(e.permission_denials) ? e.permission_denials.length : 0; }
      for (const x of (e.message && Array.isArray(e.message.content) ? e.message.content : [])) {
        if (x.type !== 'tool_use') continue;
        tools++;
        if (x.name === 'Skill') skills.push(String((x.input || {}).skill || ''));
        // Everything the session ever wrote toward the script: a Write or an Edit of the file, or a shell command naming it.
        if ((x.name === 'Write' || x.name === 'Edit') && /Export-ReleaseNotes\.ps1/i.test(String((x.input || {}).file_path || ''))) written.push(String((x.input || {}).content || (x.input || {}).new_string || ''));
        if ((x.name === 'Bash' || x.name === 'PowerShell') && /Export-ReleaseNotes\.ps1/i.test(String((x.input || {}).command || ''))) written.push(String(x.input.command));
      }
    }
    const text = written.join('\n');
    // The third registered sign: the session's answer names the source skill.
    let answer = '';
    try { answer = fs.readFileSync(path.join(R, dir, f.replace('.check.json', '.answer.md')), 'utf8'); } catch { /* no answer file */ }
    const named = /powershell-windows/i.test(answer) ? ['names the skill'] : [];
    return { dir, id: f.replace('.check.json', ''), label, commit: String(meta.kit.commit).slice(0, 7), dirty: meta.kit.dirty, c, H: IDS.filter((k) => c[k]).length, cost, model, end, tools, refused, skills, listed, traces: [...TRACES.filter(([, re]) => re.test(text)).map(([n]) => n), ...named] };
  });
};

const all = Object.keys(rounds).sort().flatMap((n) => rounds[n].flatMap(read));
console.log(`rounds counted: ${Object.keys(rounds).sort().join(', ') || 'none'}; sessions ${all.length}`);
const by = (label) => all.filter((s) => s.label === label);
const n = (rows, k) => rows.filter((s) => s.c[k]).length;
for (const label of ['K-before', 'K-after', 'cmd-K', 'cmd-S2']) {
  const rows = by(label);
  if (!rows.length) continue;
  const costs = rows.map((s) => s.cost).filter((x) => x !== null).sort((a, b) => a - b);
  console.log(`\n${label}: ${rows.length} sessions; commits ${[...new Set(rows.map((s) => s.commit))].join(',')}; dirty ${[...new Set(rows.map((s) => s.dirty))].join(',')}; models ${[...new Set(rows.map((s) => s.model))].join(',')}; ends ${[...new Set(rows.map((s) => s.end))].join(',')}`);
  console.log(`  H per session: ${rows.map((s) => s.H).join(' ')}  median ${median(rows.map((s) => s.H))}  mean ${(rows.reduce((a, s) => a + s.H, 0) / rows.length).toFixed(3)}`);
  console.log(`  ${IDS.map((k) => `${k} ${n(rows, k)}`).join('  ')}  |  O1 ${n(rows, 'O1')}  O2 ${n(rows, 'O2')}  X ${n(rows, 'X')}  |  shell.md ${n(rows, 'Rfile')}  P4 ${n(rows, 'P4out')}  P5 ${n(rows, 'P5try')}`);
  console.log(`  cost median ${costs.length ? median(costs).toFixed(3) : '?'} (${costs.length ? costs[0].toFixed(3) : '?'}-${costs.length ? costs[costs.length - 1].toFixed(3) : '?'})  tools ${Math.min(...rows.map((s) => s.tools))}-${Math.max(...rows.map((s) => s.tools))}  refused ${rows.reduce((a, s) => a + s.refused, 0)}  Skill calls ${JSON.stringify(rows.map((s) => s.skills.join('+') || '-'))}`);
  // The registered signs are "EAP Continue", "[OK] marker" and "names the skill"; "Out-File -Encoding UTF8" is described only.
  const SIGNS = ['EAP Continue', '[OK] marker', 'names the skill'];
  if (label === 'cmd-S2') console.log(`  source command listed at init: ${rows.filter((s) => s.listed).length} of ${rows.length}; sessions with a registered sign: ${rows.filter((s) => s.traces.some((t) => SIGNS.includes(t))).length} of ${rows.length}; traces of the source in what the session ever wrote toward the script: ${JSON.stringify(rows.map((s) => s.traces.join('+') || '-'))}`);
}
const Hs = (label) => by(label).map((s) => s.H);
const p = (a, b) => (Hs(a).length && Hs(b).length ? permutationTest(Hs(a), Hs(b)) : null);
console.log(`\nreplication, H K-after vs K-before (natural): p = ${p('K-after', 'K-before')}`);
console.log(`source, H cmd-K vs cmd-S2 (both invoked by command): p = ${p('cmd-K', 'cmd-S2')}`);
console.log(`described, H cmd-K vs K-after: p = ${p('cmd-K', 'K-after')}   (no bar)`);
