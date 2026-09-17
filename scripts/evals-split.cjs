#!/usr/bin/env node
'use strict';
// Scores an activation result table as two numbers: the baseline intents (Phase 1's six, comparable with the
// 2026-09-10 run) and every intent added since, which has no baseline. The runner's combined "Overall" line mixes the
// two and compares with nothing, so a gate is never reported from it.
//
//   node scripts/evals-split.cjs evals/results/<date>-<host>-<tag>.md [--baseline question,small,feature,bug,review,ship]

const fs = require('node:fs');

const PHASE1 = ['question', 'small', 'feature', 'bug', 'review', 'ship'];

// A label with alternatives (a|b) is one cell, and tables written before 2330f60 did not escape its pipe, so a row is
// read from both ends: id and intent on the left, got and pass on the right, the label is whatever lies between.
function parseRows(text) {
  return String(text).split('\n')
    .filter((l) => /^\| [a-z]+(?:-[a-z0-9]+)+ \|/.test(l))
    .map((l) => {
      const cells = l.split('|').slice(1, -1);
      return {
        id: cells[0].trim(),
        intent: cells[1].trim(),
        expect: cells.slice(2, -2).join('|').replace(/\\\|/g, '|').trim(),
        got: cells[cells.length - 2].trim(),
        pass: cells[cells.length - 1].trim() === 'yes',
      };
    });
}

// Recall counts positives routed, the eight pure questions included as positives answered directly, as Phase 1 did.
// Precision counts, among the sessions that invoked a skill at all, those that invoked an expected one. A no-action
// session invoked nothing, so it is neither a pass nor a false activation; it is counted apart.
function score(rows) {
  const alts = (e) => e.split('|').map((s) => s.trim());
  const positives = rows.filter((r) => !r.id.includes('-neg-'));
  const invoked = rows.filter((r) => r.got !== 'none' && r.got !== 'no-action');
  const perIntent = {};
  for (const r of rows) {
    const p = (perIntent[r.intent] = perIntent[r.intent] || { total: 0, pass: 0 });
    p.total++; if (r.pass) p.pass++;
  }
  return {
    total: rows.length,
    pass: rows.filter((r) => r.pass).length,
    positives: positives.length,
    positivesPass: positives.filter((r) => r.pass).length,
    negatives: rows.length - positives.length,
    negativesPass: rows.filter((r) => r.id.includes('-neg-') && r.pass).length,
    falseActivations: rows.filter((r) => alts(r.expect).includes('none') && !r.pass && r.got !== 'no-action').length,
    expectNone: rows.filter((r) => alts(r.expect).includes('none')).length,
    noAction: rows.filter((r) => r.got === 'no-action').length,
    invoked: invoked.length,
    invokedPass: invoked.filter((r) => r.pass).length,
    perIntent,
    misses: rows.filter((r) => !r.pass).map((r) => ({ id: r.id, expect: r.expect, got: r.got })),
  };
}

function splitScore(text, baselineIntents = PHASE1) {
  const rows = parseRows(text);
  return {
    baseline: score(rows.filter((r) => baselineIntents.includes(r.intent))),
    added: score(rows.filter((r) => !baselineIntents.includes(r.intent))),
  };
}

function describe(name, s) {
  const ratio = (a, b) => (b ? (a / b).toFixed(3) : 'n/a');
  return [
    `## ${name}: ${s.pass}/${s.total}`,
    `- positives routed ${s.positivesPass}/${s.positives} · negatives ${s.negativesPass}/${s.negatives}`,
    `- false activations ${s.falseActivations}/${s.expectNone} expect-none prompts · no-action ${s.noAction} (read those streams)`,
    `- recall ${ratio(s.positivesPass, s.positives)} · precision ${ratio(s.invokedPass, s.invoked)} (${s.invokedPass}/${s.invoked} skill calls were expected)`,
    `- per intent: ${Object.entries(s.perIntent).map(([k, v]) => `${k} ${v.pass}/${v.total}`).join(', ')}`,
    `- misses: ${s.misses.length ? s.misses.map((m) => `${m.id} (expect ${m.expect}, got ${m.got})`).join('; ') : 'none'}`,
  ].join('\n');
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  const i = args.indexOf('--baseline');
  const baseline = i >= 0 && args[i + 1] ? args[i + 1].split(',').map((s) => s.trim()) : PHASE1;
  if (!file) { process.stderr.write('usage: node scripts/evals-split.cjs <result.md> [--baseline intent,intent,...]\n'); process.exit(2); }
  const r = splitScore(fs.readFileSync(file, 'utf8'), baseline);
  process.stdout.write(`${describe('Baseline intents (' + baseline.join(', ') + ')', r.baseline)}\n\n${describe('Intents added since (no baseline)', r.added)}\n`);
}

module.exports = { parseRows, score, splitScore, describe, PHASE1 };
