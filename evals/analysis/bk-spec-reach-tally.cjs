// Tally of stage 2 of the bk-spec step (docs/specs/2026-10-08-bk-spec-stack-reach-design.md, "Planned registration,
// stage 2" and "Stage 2 registered"). Read only; it runs no session and does not read the Windows System log: the
// sessions whose run holds a sleep event are passed with --sleep. It reads evals/results/bk-spec-reach-log.txt, written
// by bk-spec-reach-run.cjs, takes the folders of the calls of the steps node-01 and py-01, and prints every session,
// the four bars with their figures, the comparison with S and what is reported with no bar. The session that records
// the result sets these figures against the registration.
// Usage, from the repository root:
//   node evals/analysis/bk-spec-reach-tally.cjs [--sleep <folder>/<session>,...] [--profile <dir>] [resultsDir]
// A session is named <folder>/<base>, base as in 03-natural-K2.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { events, median, fisherExact } = require('../../scripts/lib/bench-score.cjs');
const { completed, dirsOf } = require('./cpp-tally.cjs');
const { loaded, parseLines, sessionId, transcriptFor } = require('./skill-loaded.cjs');
const { STEPS, BEFORE, AFTER, BEFORE_COMMIT, AFTER_COMMIT, MODEL, hostNamed } = require('./bk-spec-reach-run.cjs');

const TASKS = ['node-01', 'py-01'];
const DEADLINE = { 'node-01': 'N3', 'py-01': 'Y2' };
const MARKER = 'Stack rules before anything else';
const content = (e) => (e.message && Array.isArray(e.message.content) ? e.message.content : []);

// The registered number of sessions of each branch on a task, from the driver's calls.
function expected(task) {
  const n = { 'K-before': 0, 'K-after': 0, S: 0 };
  for (const c of STEPS[task].flat()) n[c[2] === 'S' ? 'S' : c[1] === BEFORE ? 'K-before' : 'K-after'] += c[4];
  return n;
}

// A session cut, not completed, sleep-hit or never started is counted against the kit, as registered; so is one with
// no usable check.json, or from a folder whose meta.json does not name its branch at the pinned commit with dirty
// false (the least favourable handling). K-after as not
// opening the file, missing the deadline hazard, O1 and O2, and not loaded; K-before as opening the file and passing
// the deadline hazard; S as passing the deadline hazard.
function counted(row) {
  if (!row.flags.length) return row;
  if (row.label === 'K-after') return { ...row, Rfile: false, deadline: false, O1: false, O2: false, M: false, asCut: true };
  if (row.label === 'K-before') return { ...row, Rfile: true, deadline: true, asCut: true };
  return { ...row, deadline: true, asCut: true };
}

function readDir(R, dir, task, sleep, profile) {
  let meta;
  try { meta = JSON.parse(fs.readFileSync(path.join(R, dir, 'meta.json'), 'utf8')); } catch { return []; }
  return fs.readdirSync(path.join(R, dir)).filter((n) => n.endsWith('.raw.jsonl')).sort().map((f) => {
    const base = f.replace('.raw.jsonl', '');
    const letter = (base.match(/-([A-Z])\d+$/) || [])[1];
    const label = letter === 'S' ? 'S' : meta.kit && meta.kit.branch === BEFORE ? 'K-before' : meta.kit && meta.kit.branch === AFTER ? 'K-after' : `?${meta.kit && meta.kit.branch}`;
    const raw = fs.readFileSync(path.join(R, dir, f), 'utf8');
    let c = {}; let noCheck = true;
    try { c = JSON.parse(fs.readFileSync(path.join(R, dir, `${base}.check.json`), 'utf8')); noCheck = !!c.error || typeof c.Rfile !== 'boolean'; } catch { /* no check */ }
    let model = null; let host = null; let inits = 0; let cost = null; let seconds = null; let tokens = null; const skills = [];
    for (const e of events(raw)) {
      if (e.type === 'system' && e.subtype === 'init') { inits += 1; model = model && model !== e.model ? `${model}+${e.model}` : e.model; host = host && host !== e.claude_code_version ? `${host}+${e.claude_code_version}` : e.claude_code_version; }
      if (e.type === 'result') {
        cost = typeof e.total_cost_usd === 'number' ? e.total_cost_usd : null; seconds = e.duration_ms ? Math.round(e.duration_ms / 1000) : null;
        const u = e.usage || {}; tokens = (u.input_tokens || 0) + (u.output_tokens || 0) + (u.cache_creation_input_tokens || 0) + (u.cache_read_input_tokens || 0);
      }
      for (const x of content(e)) if (x.type === 'tool_use' && x.name === 'Skill') skills.push(String((x.input || {}).skill || ''));
    }
    // M: the loaded-sign of bk-spec with the marker, read from the host's transcript; unknown counts as no.
    const id = sessionId(path.join(R, dir, f)).id;
    const t = transcriptFor(profile, id);
    const M = t ? loaded(parseLines(t), 'bk-spec', MARKER) : null;
    const flags = [];
    if ((meta.cut || []).includes(base)) flags.push('cut');
    if (!completed(raw)) flags.push('not-completed');
    if (sleep.has(`${dir}/${base}`)) flags.push('sleep');
    if (noCheck) flags.push('no-check');
    const pin = { [BEFORE]: BEFORE_COMMIT, [AFTER]: AFTER_COMMIT }[meta.kit && meta.kit.branch];
    if (!pin || meta.kit.commit !== pin || meta.kit.dirty !== false) flags.push('kit');
    return counted({ task, dir, base, label, model, host, inits, flags, Rfile: !!c.Rfile, Rdetect: c.Rdetect ?? '-', deadline: !!c[DEADLINE[task]], O1: !!c.O1, O2: !!c.O2, hazards: Object.keys(c).filter((k) => /^[A-Z]\d$|^X$/.test(k) && !/^O\d$/.test(k) && c[k] === true), M, cost, seconds, tokens, skills });
  });
}

// Rows for the sessions a branch never started, counted against the kit like cut sessions.
function missing(task, rows) {
  const want = expected(task);
  const out = [];
  for (const label of Object.keys(want)) {
    const have = rows.filter((r) => r.task === task && r.label === label).length;
    for (let i = have; i < want[label]; i++) out.push(counted({ task, dir: '-', base: `never-started-${label}-${i + 1}`, label, model: null, host: null, inits: 0, flags: ['never-started'], Rfile: false, Rdetect: '-', deadline: false, O1: false, O2: false, hazards: [], M: null, cost: null, seconds: null, tokens: null, skills: [] }));
  }
  return out;
}

// The bars, from the counted rows: the figures and whether each holds.
function bars(rows) {
  const of = (label, task) => rows.filter((r) => r.label === label && (!task || r.task === task));
  const k = (xs, key) => xs.filter((r) => r[key] === true).length;
  const A = of('K-after'); const B = of('K-before');
  const p1 = fisherExact(k(A, 'Rfile'), A.length - k(A, 'Rfile'), k(B, 'Rfile'), B.length - k(B, 'Rfile'));
  const bar1 = { after: k(A, 'Rfile'), nAfter: A.length, before: k(B, 'Rfile'), nBefore: B.length, p: p1 };
  bar1.holds = p1 <= 0.05 && bar1.after / bar1.nAfter > bar1.before / bar1.nBefore;
  const bar2 = { after: k(A, 'deadline'), before: k(B, 'deadline') };
  bar2.holds = bar2.after >= bar2.before - 4;
  const bar3 = TASKS.map((t) => ({ task: t, O1: k(of('K-after', t), 'O1'), O2: k(of('K-after', t), 'O2'), n: of('K-after', t).length }));
  bar3.forEach((b) => { b.holds = b.O1 >= 21 && b.O2 >= 21; });
  const bar4 = TASKS.map((t) => ({ task: t, M: k(of('K-after', t), 'M'), unknown: of('K-after', t).filter((r) => r.M === null && !r.asCut).length, n: of('K-after', t).length }));
  bar4.forEach((b) => { b.holds = b.M >= 21; });
  const S = of('S');
  const pS = fisherExact(k(A, 'deadline'), A.length - k(A, 'deadline'), k(S, 'deadline'), S.length - k(S, 'deadline'));
  return { bar1, bar2, bar3, bar4, againstS: { after: k(A, 'deadline'), nAfter: A.length, S: k(S, 'deadline'), nS: S.length, p: pS } };
}

if (require.main === module) {
  const argv = process.argv.slice(2);
  const opt = (name) => { const i = argv.indexOf(name); return i < 0 ? null : argv[i + 1]; };
  const R = argv.find((a, i) => !a.startsWith('--') && !['--sleep', '--profile'].includes(argv[i - 1])) || path.join(__dirname, '..', 'results');
  const profile = opt('--profile') || path.join(__dirname, '..', '..', '_build', 'profile', 'claude');
  const sleep = new Set(String(opt('--sleep') || '').split(',').filter(Boolean));
  const lines = fs.readFileSync(path.join(R, 'bk-spec-reach-log.txt'), 'utf8').split(/\r?\n/);
  const HOST = hostNamed(lines);
  let rows = [];
  for (const task of TASKS) {
    const dirs = [...new Set(dirsOf(lines, task))];
    const got = dirs.flatMap((d) => {
      const read = readDir(R, d, task, sleep, profile);
      if (!read.length && fs.existsSync(path.join(R, d)) && fs.readdirSync(path.join(R, d)).some((n) => n.endsWith('.raw.jsonl'))) console.log(`WARNING: ${d} has no readable meta.json; its sessions are not read`);
      return read;
    });
    rows = rows.concat(got, missing(task, got));
  }
  for (const s of sleep) if (!rows.some((r) => `${r.dir}/${r.base}` === s)) console.log(`WARNING: --sleep ${s} matches no session`);
  const yn = (v) => (v === true ? 'y' : v === false ? 'n' : '?');
  console.log(`uncounted session's host: ${HOST}`);
  console.log('task | folder | session | branch | model | host | inits | flags | Rfile | deadline | O1 O2 | M | Rdetect | hazards | cost | s | tokens | skills');
  for (const r of rows) console.log([r.task, r.dir, r.base, r.label, r.model, r.host, r.inits, r.flags.join(',') || '-', yn(r.Rfile), yn(r.deadline), `${yn(r.O1)} ${yn(r.O2)}`, yn(r.M), r.Rdetect, r.hazards.join(',') || '-', r.cost === null ? '-' : r.cost.toFixed(4), r.seconds ?? '-', r.tokens ?? '-', r.skills.join(',') || '-'].join(' | '));
  const bad = rows.filter((r) => r.flags[0] !== 'never-started' && (r.inits !== 1 || r.model !== MODEL || r.host !== HOST));
  console.log(`model and host check (every counted session names ${MODEL} and host ${HOST}, one init): ${bad.length ? `FAILS for ${bad.map((r) => `${r.dir}/${r.base}`).join(', ')}` : 'holds'}`);
  console.log(`counted against the kit (cut, not completed, sleep-hit, never started): ${rows.filter((r) => r.asCut).map((r) => `${r.dir}/${r.base} [${r.flags.join(',')}] ${r.label}`).join('; ') || 'none'}`);
  for (const t of TASKS) {
    const e = expected(t);
    const found = ['K-before', 'K-after', 'S'].map((l) => rows.filter((r) => r.task === t && r.label === l && r.flags[0] !== 'never-started').length);
    console.log(`${t}: expected K-before ${e['K-before']}, K-after ${e['K-after']}, S ${e.S}; found ${found.join(', ')}`);
    if (found.some((n, i) => n > [e['K-before'], e['K-after'], e.S][i])) console.log(`WARNING: ${t} has more sessions than registered`);
    const odd = rows.filter((r) => r.task === t && r.label.startsWith('?'));
    if (odd.length) console.log(`WARNING: ${t} has sessions of no registered branch: ${odd.map((r) => `${r.dir}/${r.base}`).join(', ')}`);
  }
  if (bad.length || rows.some((r) => r.flags[0] === 'never-started')) console.log('NOTHING IS JUDGED: a counted session failed the model and host check, or was never started (stage 1 "Model and host", taken over by stage 2): the stage is neither passed nor closed and the owner decides. Never-started rows and the bars below are printed for the owner to read, not as a verdict.');
  if (rows.some((r) => r.flags.includes('no-check') || r.flags.includes('kit'))) console.log('INCIDENT: a session has no usable check.json or comes from a folder off its pinned commit; it is counted against the kit above (the least favourable handling); if any bar\'s verdict differs under another handling, the owner decides.');
  const notJudged = bad.length || rows.some((r) => r.flags[0] === 'never-started');
  const verdict = (h) => (notJudged ? 'NOT JUDGED (model/host fault or never-started session)' : h ? 'holds' : 'missed');
  const b = bars(rows);
  console.log(`bar 1 (Rfile pooled, K-after above K-before, Fisher two-sided p <= 0.05): K-after ${b.bar1.after} of ${b.bar1.nAfter}, K-before ${b.bar1.before} of ${b.bar1.nBefore}, p = ${b.bar1.p.toFixed(4)}: ${verdict(b.bar1.holds)}`);
  console.log(`bar 2 (deadline hazard pooled, K-after not more than 4 below K-before): K-after ${b.bar2.after}, K-before ${b.bar2.before}: ${verdict(b.bar2.holds)}`);
  for (const x of b.bar3) console.log(`bar 3 (${x.task}, K-after O1 and O2 each at least 21 of 24): O1 ${x.O1}, O2 ${x.O2} of ${x.n}: ${verdict(x.holds)}`);
  for (const x of b.bar4) console.log(`bar 4 (${x.task}, K-after loaded with the marker at least 21 of 24; unknown counts as no): ${x.M} of ${x.n} (unknown ${x.unknown}): ${verdict(x.holds)}`);
  console.log(`against S (deadline hazard pooled, K-after against S, Fisher two-sided): K-after ${b.againstS.after} of ${b.againstS.nAfter}, S ${b.againstS.S} of ${b.againstS.nS}, p = ${b.againstS.p.toFixed(4)}`);
  console.log('reported with no bar:');
  for (const t of TASKS) {
    const of = (l) => rows.filter((r) => r.task === t && r.label === l);
    const k = (xs, key) => xs.filter((r) => r[key] === true).length;
    const A = of('K-after'); const B = of('K-before');
    console.log(`  ${t}: Rfile K-after ${k(A, 'Rfile')} of ${A.length}, K-before ${k(B, 'Rfile')} of ${B.length}, Fisher p = ${fisherExact(k(A, 'Rfile'), A.length - k(A, 'Rfile'), k(B, 'Rfile'), B.length - k(B, 'Rfile')).toFixed(4)}; deadline K-after ${k(A, 'deadline')}, K-before ${k(B, 'deadline')}, S ${k(of('S'), 'deadline')} of ${of('S').length}`);
    for (const l of ['K-before', 'K-after', 'S']) {
      const xs = of(l).filter((r) => r.flags[0] !== 'never-started');
      const num = (key) => xs.map((r) => r[key]).filter((v) => typeof v === 'number');
      const span = (key) => { const v = num(key); return v.length ? `${Number(median(v).toFixed(4))} (${Number(Math.min(...v).toFixed(4))} to ${Number(Math.max(...v).toFixed(4))})` : '-'; };
      const cross = ['y', 'n'].map((f) => ['y', 'n'].map((d) => xs.filter((r) => yn(r.Rfile) === f && yn(r.deadline) === d).length));
      console.log(`    ${l}: Rdetect ran ${xs.filter((r) => r.Rdetect === 'ran').length} of ${xs.length}; loaded with marker ${k(xs, 'M')} (unknown ${xs.filter((r) => r.M === null).length}); Rfile and deadline: y/y ${cross[0][0]}, y/n ${cross[0][1]}, n/y ${cross[1][0]}, n/n ${cross[1][1]}; skills ${[...new Set(xs.flatMap((r) => r.skills))].join(',') || '-'}; cost ${span('cost')}; tokens ${span('tokens')}; seconds ${span('seconds')}`);
    }
  }
}

module.exports = { TASKS, DEADLINE, MARKER, expected, counted, missing, bars, readDir };
