'use strict';
// Scoring for the kit-versus-sources benchmark: what a
// session found, what it cost, and the median and spread per branch. Pure functions over a stream-json transcript,
// so every number can be recomputed from the raw file the runner keeps.

// A finding is a heading (or a line that is all bold, which reviews use as one) or a top-level list item with
// everything under it, a table row, or the text before the first of these. Blank lines do not cut: a review writes a
// heading, the location, then a paragraph, and the three are one finding.
const BOLD_LINE = /^\*\*[^*\n]+\*\*\s*:?\s*$/;

function splitItems(text) {
  const items = [];
  let cur = [];
  let fence = false;
  const flush = () => { const t = cur.join('\n').trim(); if (t) items.push(t); cur = []; };
  for (const line of String(text || '').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const starts = !fence && (/^#{1,6}\s/.test(line) || BOLD_LINE.test(line) || /^([-*+]|\d+[.)])\s/.test(line) || /^\|/.test(line));
    if (starts) flush();
    cur.push(line);
  }
  flush();
  return items;
}

const any = (item, terms) => terms.some((t) => new RegExp(t, 'i').test(item));
const matches = (item, rule) => rule.all.every((group) => any(item, group));

// Items under a heading the task names as praise ("Strengths", "What's good") are not findings, so they are left out
// when decoys are counted. The praise ends at the next heading or bold line of any level, or after an item that
// carries a plain line of text below its first line (an "Issues:" line that opens the next part).
function findingItems(items, sections) {
  if (!sections || !sections.length) return items;
  const out = [];
  let skip = false;
  for (const item of items) {
    const lines = item.split('\n');
    const h = lines[0].match(/^#{1,6}\s+(.*)$/) || (BOLD_LINE.test(lines[0]) ? [lines[0], lines[0]] : null);
    if (h) { skip = any(h[1], sections); if (skip) continue; }
    if (!skip) { out.push(item); continue; }
    if (lines.slice(1).some((l) => /^\S/.test(l) && !/^([-*+]|\d+[.)])\s/.test(l))) skip = false;
  }
  return out;
}

// What a finding recommends is not what it concludes: "Fix: add tenantId to prevent cross-tenant writes" does not
// clear the claim before it. Sentences that open with a fix are left out when clearing words are looked for.
const FIX_SENTENCE = /^[\s>*_`-]*(\*\*)?(fix|suggest(ed|ion)?|recommend(ed|ation)?|consider (adding|using|switching|replacing|moving|validating|checking)|remediation|mitigation|solution|instead|to fix|should (use|add|bind|check|validate|escape|scope|filter|be (changed|fixed|replaced|scoped|filtered|validated)))\b/i;
const withoutFixes = (item) => item.split(/(?<=[.!?])\s+|\n/).filter((s) => !FIX_SENTENCE.test(s)).join('\n');

// On a task with a `blocks` rule (a clean diff), telling the owner not to merge is itself a false outcome; it is read on
// the whole answer, since the verdict often stands apart from any finding. Curly apostrophes are read as straight ones.
function scoreAnswer(answer, rules) {
  const text = String(answer || '').replace(/[‘’]/g, "'");
  const items = splitItems(text);
  const found = []; const missed = []; const decoys = [];
  // A defect with `check` instead of `all` is scored on the fixture after the session (the runner's scoreRow).
  for (const d of rules.defects.filter((r) => r.all)) (items.some((i) => matches(i, d)) ? found : missed).push(d.id);
  const findings = findingItems(items, rules.clearSections);
  for (const x of rules.decoys || []) if (findings.some((i) => matches(i, x) && !any(withoutFixes(i), [...(rules.clear || []), ...(x.unless || [])]))) decoys.push(x.id);
  const blocked = rules.blocks ? any(text, rules.blocks) : null;
  return { found, missed, decoys, blocked, passed: missed.length === 0 && decoys.length === 0 && blocked !== true };
}

function events(raw) {
  const out = [];
  for (const line of String(raw || '').split('\n')) { try { const o = JSON.parse(line); if (o) out.push(o); } catch { /* not an event */ } }
  return out;
}

// Per-model usage summed: the main loop and every subagent the session started, each under its own model. A
// background agent that reports after the first answer wakes the session again, and the host then writes one more
// result event: its usage and cost are the session's running totals, its duration and turns cover that turn only.
function usageFrom(raw) {
  const ev = events(raw);
  const init = ev.find((e) => e.type === 'system' && e.subtype === 'init');
  const results = ev.filter((e) => e.type === 'result');
  const result = results[results.length - 1];
  const u = { input: null, output: null, cacheRead: null, cacheCreation: null, total: null, fresh: null, cost: null, turns: null, seconds: null, tools: init && Array.isArray(init.tools) ? init.tools.length : null, version: init ? init.claude_code_version || null : null, answer: null, isError: null, end: null, results: results.length };
  if (!result) return u;
  const models = Object.values(result.modelUsage || {});
  const sum = (k) => models.reduce((n, m) => n + (Number(m[k]) || 0), 0);
  if (models.length) {
    u.input = sum('inputTokens'); u.output = sum('outputTokens'); u.cacheRead = sum('cacheReadInputTokens'); u.cacheCreation = sum('cacheCreationInputTokens');
  } else if (result.usage) {
    u.input = result.usage.input_tokens || 0; u.output = result.usage.output_tokens || 0; u.cacheRead = result.usage.cache_read_input_tokens || 0; u.cacheCreation = result.usage.cache_creation_input_tokens || 0;
  }
  if (u.input !== null) { u.total = u.input + u.output + u.cacheRead + u.cacheCreation; u.fresh = u.input + u.output + u.cacheCreation; }
  u.cost = typeof result.total_cost_usd === 'number' ? result.total_cost_usd : null;
  const turns = results.map((r) => r.num_turns).filter((n) => typeof n === 'number');
  u.turns = turns.length ? turns.reduce((a, b) => a + b, 0) : null;
  const ms = results.map((r) => r.duration_ms).filter((n) => typeof n === 'number');
  u.seconds = ms.length ? Math.round(ms.reduce((a, b) => a + b, 0) / 1000) : null;
  // The user reads every answer the session gave; a later one often only says the background reviewer agreed.
  const answers = results.map((r) => r.result).filter((a) => typeof a === 'string');
  u.answer = answers.length ? answers.join('\n\n') : null;
  u.isError = Boolean(result.is_error);
  u.end = result.subtype || null;
  return u;
}

// Skills, slash commands and subagents the main loop reached, in order.
function invocations(raw) {
  const out = [];
  for (const e of events(raw)) {
    if (e.type !== 'assistant' || !e.message || !Array.isArray(e.message.content)) continue;
    for (const c of e.message.content) {
      if (!c || c.type !== 'tool_use') continue;
      const inp = c.input || {};
      if (c.name === 'Skill') out.push('skill:' + String(inp.skill || inp.name || inp.command || '').replace(/^\//, ''));
      else if (c.name === 'Task' || c.name === 'Agent') out.push('agent:' + String(inp.subagent_type || 'general'));
    }
  }
  return out;
}

function median(xs) {
  const v = xs.filter((x) => typeof x === 'number').sort((a, b) => a - b);
  if (!v.length) return null;
  const m = Math.floor(v.length / 2);
  return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2;
}

const spread = (xs) => {
  const v = xs.filter((x) => typeof x === 'number');
  return { median: median(v), min: v.length ? Math.min(...v) : null, max: v.length ? Math.max(...v) : null };
};

function summarize(rows) {
  const out = { sessions: rows.length, passes: rows.filter((r) => r.passed).length, blocked: rows.some((r) => typeof r.blocked === 'boolean') ? rows.filter((r) => r.blocked === true).length : null };
  for (const k of ['found', 'decoys', 'total', 'fresh', 'cost', 'turns', 'seconds']) out[k] = spread(rows.map((r) => r[k]));
  return out;
}

const tokensComparable = (rows) => new Set(rows.map((r) => r.tools)).size <= 1;

// How many sessions found each defect and flagged each decoy: a task's defects are calibrated on the floor with this.
function perDefect(rows, rules) {
  const out = {};
  for (const d of rules.defects) out[d.id] = rows.filter((r) => (r.foundIds || []).includes(d.id)).length;
  for (const x of rules.decoys || []) out[x.id] = rows.filter((r) => (r.decoyIds || []).includes(x.id)).length;
  if (rules.blocks) out.blocked = rows.filter((r) => r.blocked === true).length;
  return out;
}

// Two-sided Fisher exact test on [[a, b], [c, d]]: a of a+b sessions found it on one branch, c of c+d on the other.
// The p is the sum of every table with the same margins that is no more likely than the one observed.
function fisherExact(a, b, c, d) {
  const lf = (n) => { let s = 0; for (let i = 2; i <= n; i++) s += Math.log(i); return s; };
  const choose = (n, k) => Math.exp(lf(n) - lf(k) - lf(n - k));
  const r1 = a + b; const c1 = a + c; const n = a + b + c + d;
  const p = (x) => choose(c1, x) * choose(n - c1, r1 - x) / choose(n, r1);
  const observed = p(a);
  let sum = 0;
  for (let x = Math.max(0, r1 - (n - c1)); x <= Math.min(r1, c1); x++) if (p(x) <= observed * (1 + 1e-9)) sum += p(x);
  return Math.min(1, sum);
}

// Exact two-sided permutation test on the difference of means of two groups of counts (for instance mutants killed
// per session): every split of the pooled values into groups of the same sizes is enumerated, and p is the share whose
// absolute difference is at least the observed one. Exact for the sizes used here (8 and 8 give 12,870 splits).
function permutationTest(a, b) {
  const all = [...a, ...b];
  const n = all.length; const k = a.length;
  const total = all.reduce((s, x) => s + x, 0);
  const diff = (sumA) => Math.abs(sumA / k - (total - sumA) / (n - k));
  const observed = diff(a.reduce((s, x) => s + x, 0));
  let extreme = 0; let splits = 0;
  const walk = (start, left, sum) => {
    if (left === 0) { splits += 1; if (diff(sum) >= observed - 1e-9) extreme += 1; return; }
    for (let i = start; i <= n - left; i++) walk(i + 1, left - 1, sum + all[i]);
  };
  walk(0, k, 0);
  return extreme / splits;
}

// Seen red first (debug-01, registered 2026-09-25): a file `node --test` runs is written by Edit, Write or a shell
// redirect whose target is that file (2>&1 is not a target), then a `node` run reports a failure, and only then is
// anything under src/ edited. A first version of this count missed top-level test-*.js files; a second read
// `cat tests/x.test.js 2>&1` as a write.
const TEST_FILE = /([\\/]tests?[\\/][^\s'"]*\.[cm]?js$|(^|[\\/])(test-[^\\/]*|[^\\/]*[._-]test|test)\.[cm]?js$)/;
const REDIRECT = /(?:(?:^|[^2&>])>{1,2}|\btee(?:\s+-a)?|Out-File(?:\s+-FilePath)?|Set-Content(?:\s+-Path)?)\s*['"]?([^\s'"|;&>]+)/g;
const FAILED = /# fail [1-9]|ℹ fail [1-9]|not ok|✖|AssertionError|fail [1-9]/;
function seenRedFirst(raw, root = null) {
  // With the fixture root given, an absolute path outside it (a scratch copy) is not a file the fixture suite runs.
  const norm = (p) => String(p).replace(/\\/g, '/').toLowerCase();
  const absolute = (p) => /^([a-z]:)?\//.test(norm(p));
  const inFixture = (p) => !root || !absolute(p) || norm(p).startsWith(norm(root).replace(/\/?$/, '/'));
  const text = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map((x) => (x && x.text) || '').join('\n') : '');
  const commands = new Map();
  let written = false;
  for (const e of events(raw)) {
    const content = e.message && Array.isArray(e.message.content) ? e.message.content : [];
    for (const c of content) {
      if (c.type === 'tool_use') {
        const i = c.input || {};
        const cmd = String(i.command || '');
        commands.set(c.id, cmd);
        const file = String(i.file_path || '');
        if ((c.name === 'Edit' || c.name === 'Write') && /[\\/]src[\\/]/.test(file)) return false;
        const shellWrite = (c.name === 'Bash' || c.name === 'PowerShell') && [...cmd.split('\n')[0].matchAll(REDIRECT)].some((m) => TEST_FILE.test(m[1]) && inFixture(m[1]));
        if (shellWrite || ((c.name === 'Edit' || c.name === 'Write') && TEST_FILE.test(file) && inFixture(file))) written = true;
      } else if (c.type === 'tool_result' && written && /\bnode\b/.test(commands.get(c.tool_use_id) || '') && FAILED.test(text(c.content))) {
        return true;
      }
    }
  }
  return false;
}

// build-01 (registered 2026-09-26). Baseline first: a suite run that completed (its result reports a test count) before the
// first edit to a file under src/ or tests/, by Edit, Write or a shell command that writes there.
const SUITE = /\bnode\s+--test\b|\bnpm(\.cmd)?\s+(run\s+)?test\b/;
const COUNTED = /[#ℹ] tests \d+/;
const CODE_PATH = /(^|[\\/\s'"])(src|tests?)[\\/]/;
const SHELL_WRITE = /\bsed\s+-i\b|\bperl\s+-[a-z]*i|Set-Content|Out-File|Add-Content|\b(mv|cp|Move-Item|Copy-Item|rm|Remove-Item)\b|(?:^|[^2&>])>{1,2}/;
function baselineFirst(raw) {
  const text = (c) => (typeof c === 'string' ? c : Array.isArray(c) ? c.map((x) => (x && x.text) || '').join('\n') : '');
  const commands = new Map();
  let ran = false;
  for (const e of events(raw)) {
    const content = e.message && Array.isArray(e.message.content) ? e.message.content : [];
    for (const c of content) {
      if (c.type === 'tool_use') {
        const i = c.input || {};
        const cmd = String(i.command || '');
        commands.set(c.id, cmd);
        const fileEdit = ['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(c.name) && CODE_PATH.test(String(i.file_path || '').replace(/\\/g, '/'));
        const shellEdit = (c.name === 'Bash' || c.name === 'PowerShell') && SHELL_WRITE.test(cmd) && CODE_PATH.test(cmd);
        if (fileEdit || shellEdit) return ran;
      } else if (c.type === 'tool_result' && SUITE.test(commands.get(c.tool_use_id) || '') && COUNTED.test(text(c.content))) {
        ran = true;
      }
    }
  }
  return false;
}

// A commit attempt (definition of docs/specs/2026-09-25-bk-debug-design.md): a Skill call to bk-ship, or a shell command
// containing git commit, git push or gh pr create. Counted whether or not the call was allowed.
function commitAttempts(raw) {
  let n = 0;
  for (const e of events(raw)) for (const c of (e.message && Array.isArray(e.message.content) ? e.message.content : [])) {
    if (c.type !== 'tool_use') continue;
    const i = c.input || {};
    if (c.name === 'Skill' && /bk-ship/.test(String(i.skill || ''))) n += 1;
    else if ((c.name === 'Bash' || c.name === 'PowerShell') && /\bgit\s+(commit|push)\b|\bgh\s+pr\s+create\b/.test(String(i.command || ''))) n += 1;
  }
  return n;
}

// An answer that asks before changing: a question to the owner about going ahead, or a statement that it is waiting.
const ASKS = /\b(shall|should|may) I\b[^.?]*\?|\bwould you like\b|\bdo you want me to\b|\b(approve|approval|confirm)\b[^.]*\?|\bgo ahead\?|\bproceed\?|\bwaiting (for|on) (your )?(confirmation|approval|go-ahead|decision)\b|\b(won't|will not|do not|don't) (proceed|continue|start|make (the|any) change)[^.]*\b(until|without)\b/i;
const asksApproval = (answer) => ASKS.test(String(answer || ''));

module.exports = { splitItems, scoreAnswer, usageFrom, invocations, median, summarize, tokensComparable, perDefect, events, fisherExact, seenRedFirst, permutationTest, baselineFirst, commitAttempts, asksApproval };
