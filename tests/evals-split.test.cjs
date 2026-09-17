'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');

// The gate is reported as two numbers: the Phase 1 intents, comparable with the 2026-09-10 baseline, and the prompts
// added since, which have no baseline. A combined line compares with nothing. The first scorer written for this, on
// 2026-09-16, read the 57/60 baseline as 56/60 because a label with alternatives split its table cell; this test
// carries both an escaped and an unescaped alternative for that reason.
const TABLE = [
  '# Activation evals · claude · 2026-09-16',
  '',
  'Model: sonnet · profile: isolated',
  '',
  '| id | intent | expect | got | pass |',
  '|---|---|---|---|---|',
  '| q-en-01 | question | none | none | yes |',
  '| q-neg-01 | question | bk-build\\|bk-spec | bk-build | yes |',
  '| bug-en-03 | bug | bk-debug | no-action | NO |',
  '| ship-neg-02 | ship | bk-spec|none | none | yes |',
  '| plan-en-01 | plan | bk-plan | bk-plan | yes |',
  '| close-neg-01 | close | none | bk-close | NO |',
  '',
  'Overall: 4/6',
].join('\n');

test('the split scorer reports the baseline intents and the added ones apart', () => {
  const { splitScore } = require('../scripts/evals-split.cjs');
  const r = splitScore(TABLE, ['question', 'small', 'feature', 'bug', 'review', 'ship']);
  assert.equal(r.baseline.total, 4);
  assert.equal(r.baseline.pass, 3);
  assert.equal(r.baseline.positives, 2, 'q-en-01 and bug-en-03');
  assert.equal(r.baseline.positivesPass, 1);
  assert.equal(r.baseline.falseActivations, 0);
  assert.equal(r.baseline.noAction, 1, 'no-action is counted apart');
  assert.equal(r.added.total, 2);
  assert.equal(r.added.pass, 1);
  assert.equal(r.added.falseActivations, 1, 'close-neg-01 invoked a skill where none was expected');
  assert.deepEqual(r.added.misses.map((m) => m.id), ['close-neg-01']);
});

test('an alternative label is one cell, whether its pipe is escaped or not', () => {
  const { parseRows } = require('../scripts/evals-split.cjs');
  const rows = parseRows(TABLE);
  assert.equal(rows.find((x) => x.id === 'q-neg-01').expect, 'bk-build|bk-spec');
  assert.equal(rows.find((x) => x.id === 'ship-neg-02').expect, 'bk-spec|none');
  assert.equal(rows.find((x) => x.id === 'ship-neg-02').got, 'none');
  assert.equal(rows.length, 6);
});

test('precision counts only sessions that invoked a skill, recall only positives', () => {
  const { splitScore } = require('../scripts/evals-split.cjs');
  const r = splitScore(TABLE, ['question', 'bug', 'ship']);
  // Invoked a skill: q-neg-01 (expected). bug-en-03 is no-action, the rest answered without one.
  assert.equal(r.baseline.invoked, 1);
  assert.equal(r.baseline.invokedPass, 1);
});
