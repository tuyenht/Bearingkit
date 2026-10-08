'use strict';
// The loaded-sign of P5c (docs/specs/2026-10-08-p5c-shared-code-design.md, "The uncounted session"): the predicate
// that reads a host transcript and says whether a kit skill's text was delivered into the session.
const test = require('node:test');
const assert = require('node:assert');
const { loaded } = require('../evals/analysis/skill-loaded.cjs');

const meta = (text) => ({ type: 'user', isMeta: true, message: { role: 'user', content: [{ type: 'text', text }] } });
const BUILD = 'Base directory for this skill: C:\\Projects\\Bearingkit\\skills\\bk-build\n\n# bk-build\n\n## Read first\n- The stack profile';

test('a skill text delivered as an isMeta user message is loaded, by slash command or by Skill call alike', () => {
  const command = { type: 'user', message: { role: 'user', content: '<command-name>/bearingkit:bk-build</command-name>' } };
  assert.strictEqual(loaded([command, meta(BUILD)], 'bk-build', ''), true);
  assert.strictEqual(loaded([meta(BUILD.replace(/\\/g, '/'))], 'bk-build', ''), true);
});

test('another skill, the command line alone, or a message that only names the skill is not loaded', () => {
  const command = { type: 'user', message: { role: 'user', content: '<command-name>/bearingkit:bk-build</command-name>' } };
  assert.strictEqual(loaded([command], 'bk-build', ''), false);
  assert.strictEqual(loaded([meta(BUILD)], 'bk-spec', ''), false);
  assert.strictEqual(loaded([meta('Next step: bk-build when ACT. Base directory for this skill: x/skills/bk-build')], 'bk-build', ''), false);
  assert.strictEqual(loaded([meta('Base directory for this skill: C:/k/skills/bk-build-extra\n\n# bk-build')], 'bk-build', ''), false);
});

test('the same text not marked isMeta, or in an assistant message, is not loaded', () => {
  const plain = { type: 'user', message: { role: 'user', content: [{ type: 'text', text: BUILD }] } };
  const assistant = { type: 'assistant', isMeta: true, message: { role: 'assistant', content: [{ type: 'text', text: BUILD }] } };
  assert.strictEqual(loaded([plain, assistant], 'bk-build', ''), false);
});

test('a marker narrows the sign to a text that carries it', () => {
  assert.strictEqual(loaded([meta(BUILD)], 'bk-build', 'The stack profile'), true);
  assert.strictEqual(loaded([meta(BUILD)], 'bk-build', 'is part of the plan even where the plan is silent'), false);
});
