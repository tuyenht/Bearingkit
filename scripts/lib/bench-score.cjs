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
  u.answer = typeof result.result === 'string' ? result.result : null;
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

module.exports = { splitItems, scoreAnswer, usageFrom, invocations, median, summarize, tokensComparable, perDefect, events, fisherExact };
