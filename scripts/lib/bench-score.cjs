'use strict';
// Scoring for the kit-versus-sources benchmark: what a
// session found, what it cost, and the median and spread per branch. Pure functions over a stream-json transcript,
// so every number can be recomputed from the raw file the runner keeps.

// A finding is a heading or a top-level list item with everything under it, a table row, or the text before the
// first of these. Blank lines do not cut: a review writes a heading, the location, then a paragraph, and the three
// are one finding.
function splitItems(text) {
  const items = [];
  let cur = [];
  let fence = false;
  const flush = () => { const t = cur.join('\n').trim(); if (t) items.push(t); cur = []; };
  for (const line of String(text || '').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) fence = !fence;
    const starts = !fence && (/^#{1,6}\s/.test(line) || /^([-*+]|\d+[.)])\s/.test(line) || /^\|/.test(line));
    if (starts) flush();
    cur.push(line);
  }
  flush();
  return items;
}

const any = (item, terms) => terms.some((t) => new RegExp(t, 'i').test(item));
const matches = (item, rule) => rule.all.every((group) => any(item, group));

function scoreAnswer(text, rules) {
  const items = splitItems(text);
  const found = []; const missed = []; const decoys = [];
  for (const d of rules.defects) (items.some((i) => matches(i, d)) ? found : missed).push(d.id);
  for (const x of rules.decoys || []) if (items.some((i) => matches(i, x) && !any(i, x.unless || []))) decoys.push(x.id);
  return { found, missed, decoys, passed: missed.length === 0 && decoys.length === 0 };
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
  const out = { sessions: rows.length, passes: rows.filter((r) => r.passed).length };
  for (const k of ['found', 'decoys', 'total', 'fresh', 'cost', 'turns', 'seconds']) out[k] = spread(rows.map((r) => r[k]));
  return out;
}

const tokensComparable = (rows) => new Set(rows.map((r) => r.tools)).size <= 1;

// How many sessions found each defect and flagged each decoy: a task's defects are calibrated on the floor with this.
function perDefect(rows, rules) {
  const out = {};
  for (const d of rules.defects) out[d.id] = rows.filter((r) => (r.foundIds || []).includes(d.id)).length;
  for (const x of rules.decoys || []) out[x.id] = rows.filter((r) => (r.decoyIds || []).includes(x.id)).length;
  return out;
}

module.exports = { splitItems, scoreAnswer, usageFrom, invocations, median, summarize, tokensComparable, perDefect, events };
