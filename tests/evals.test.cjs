'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { parseStream, loadPrompts, summarize, checklist } = require('../scripts/evals.cjs');

const streamWithSkill = [
  JSON.stringify({ type: 'system', subtype: 'init' }),
  JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'Reviewing.' }, { type: 'tool_use', name: 'Skill', input: { skill: 'bk-review' } }] } }),
  JSON.stringify({ type: 'result', subtype: 'success' }),
].join('\n');

const streamNamespaced = JSON.stringify({ type: 'assistant', message: { content: [{ type: 'tool_use', name: 'Skill', input: { command: '/bearingkit:bk-ship' } }] } });
const streamNoSkill = [JSON.stringify({ type: 'assistant', message: { content: [{ type: 'text', text: 'The retry decorator retries three times.' }] } }), 'not json', JSON.stringify({ type: 'result' })].join('\n');

test('parseStream finds the first Skill invocation', () => {
  assert.equal(parseStream(streamWithSkill), 'bk-review');
  assert.equal(parseStream(streamNamespaced), 'bk-ship');
});

test('parseStream returns none without a Skill call', () => {
  assert.equal(parseStream(streamNoSkill), 'none');
  assert.equal(parseStream(''), 'none');
});

test('phase-1 prompt set is well formed: sixty prompts, six intents, ten each, unique ids', () => {
  const prompts = loadPrompts(path.join(__dirname, '..', 'evals', 'activation', 'phase-1.jsonl'));
  assert.equal(prompts.length, 60);
  const intents = ['question', 'small', 'feature', 'bug', 'review', 'ship'];
  for (const i of intents) {
    const group = prompts.filter((p) => p.intent === i);
    assert.equal(group.length, 10, i);
    assert.equal(group.filter((p) => p.id.includes('-neg-')).length, 2, `${i} negatives`);
    assert.equal(group.filter((p) => p.lang === 'vi' && !p.id.includes('-neg-')).length, 4, `${i} vietnamese positives`);
  }
  const expects = new Set(prompts.map((p) => p.expect));
  for (const e of expects) assert.ok(e === 'none' || /^bk-[a-z]+$/.test(e), e);
});

test('summarize counts passes, positives and false activations', () => {
  const s = summarize([
    { id: 'q-en-01', intent: 'question', expect: 'none', got: 'none' },
    { id: 'q-en-02', intent: 'question', expect: 'none', got: 'bk-spec' },
    { id: 'bug-en-01', intent: 'bug', expect: 'bk-debug', got: 'bk-debug' },
    { id: 'bug-neg-01', intent: 'bug', expect: 'bk-review', got: 'bk-debug' },
  ]);
  assert.equal(s.total, 4);
  assert.equal(s.pass, 2);
  assert.equal(s.falseActivations, 1);
  assert.equal(s.byIntent.bug.positives, 1);
  assert.equal(s.byIntent.bug.positivesPass, 1);
});

test('checklist renders one row per prompt', () => {
  const text = checklist([{ id: 'x', intent: 'bug', prompt: 'a | b', expect: 'bk-debug' }]);
  assert.match(text, /\| x \| bug \| a \\\| b \| bk-debug \|  \|/);
});
