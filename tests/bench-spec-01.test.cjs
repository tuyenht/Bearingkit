'use strict';
// spec-01 (registered 2026-10-02, docs/specs/2026-10-02-bk-spec-design.md): a feature request against a small helpdesk
// service, answered by a written spec. The scorer reads prose by the frozen rules of evals/bench/spec-01/rules.json;
// these are its trial specs: a reference passing all seven hazards with four numbered questions, seven variants each
// missing one hazard, a naive restatement, a spec that asks the three decoy facts, one with six unnumbered questions,
// one whose decision questions use the decoys' words, one with a heading per question; then the fixture's promises
// (green untouched, O2 lost by a file outside docs/ or a red suite) and the stream's reach measure.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { detect } = require('../scripts/detect-stack.cjs');
const build = require('../evals/bench/spec-01/build.cjs');

// The reference spec; each key of `drop` removes the sentence that passes one hazard.
const reference = (drop = {}) => `# Reopen a ticket from the portal

## Request

Customers want to reopen a ticket from the portal, and the agent who owns it should hear of it.

## Terms

${drop.H1 ? 'The request is about tickets the customer considers finished.' : 'The request says "closed", but by the glossary a closed ticket is final and only a resolved ticket can be reopened; this spec reads the request as reopening a resolved ticket, and names the conflict so the owner can correct it.'}

## Findings

- ${drop.H2 ? 'The window asked for is two weeks.' : 'The 14 days asked for cannot hold for closed tickets: the nightly purge deletes their messages 7 days after closing.'}
- ${drop.H5 ? 'The portal has no reopen today.' : 'Agents can reopen through `reopenTicket` in `src/tickets.js`; the portal route reuses it rather than adding a second transition.'}
- ${drop.H4 ? 'The portal route follows the conventions of the other routes.' : 'The reopen route must check that the ticket belongs to the customer\'s own organisation (`org_id`), as every portal query does.'}

## Edge cases

- ${drop.H3 ? 'A ticket reopened twice in a row.' : 'A ticket in the unassigned queue has no assignee: nobody is notified by email, and the ticket simply returns to the queue.'}
- Two reopen requests at the same moment: the second finds the ticket open and does nothing.

## Open questions

1. ${drop.H1 ? 'Should the reopen button also show in the ticket list? Recommended: only on the ticket page.' : 'Should "closed" in the request mean resolved, or should closed tickets stop being final? Recommended: resolved, with the window ending when the ticket closes.'}
2. ${drop.H6 ? 'Should the customer give a reason when reopening? Recommended: optional free text.' : 'Should the SLA due time restart when a customer reopens? Recommended: yes, a fresh due time from the moment of reopening.'}
3. How many times may one ticket be reopened? Recommended: no limit for now.
4. Should the customer see who the assignee is? Recommended: no.

## Acceptance criteria

- A customer reopens a resolved ticket of their own organisation and its status is open.
- The assignee, when there is one, has one queued email.

${drop.H7 ? '' : '## Out of scope\n\n- Reopening by email reply.\n- Any change to the purge job.\n'}`;

const NAIVE = `# Reopen a closed ticket

Customers can reopen a closed ticket from the portal within 14 days of it being closed. When they do, the assigned agent is notified.

## Requirements

- A button on the ticket page reopens the ticket.
- The assigned agent receives a notification.
- After 14 days the button is hidden.
`;

const ASKS_FACTS = `# Reopen a ticket

The portal gets a reopen button, and the assigned agent gets a notification when a customer uses it.

## Open questions

1. Which statuses can a ticket currently have? Recommended: assume open and closed.
2. How are agents notified today, is there an existing mechanism? Recommended: assume email.
3. Can agents already reopen a ticket in the back office? Recommended: assume not.
`;

const SIX_UNNUMBERED = `# Reopen a ticket

The portal gets a reopen button, and the assigned agent gets a notification when a customer uses it.

## Questions

- Should the customer give a reason?
- Should there be a limit on reopens?
- Should the button show on mobile?
- Should the agent be able to decline?
- Should we log it?
- Should the customer get a confirmation email?
`;

const DECISIONS_IN_DECOY_WORDS = `# Reopen a ticket

The portal gets a reopen button, and the assigned agent gets a notification when a customer uses it.

## Open questions

1. Agents can already reopen through reopenTicket: should the portal reuse it or get its own transition? Recommended: reuse it.
2. The existing statuses make closed final by the glossary: should that rule change? Recommended: no.
3. Should the agent get the notification by email or in the back office? Recommended: email.
`;

const HEADING_PER_QUESTION = `# Reopen a ticket

The portal gets a reopen button, and the assigned agent gets a notification when a customer uses it.

## Open questions

Two things only the owner can settle.

### Q1. Does the SLA clock restart on reopen?

Is a reopened ticket new work for the agent? In practice it is.

Recommended: yes, restart it.

### Q2. Is there a limit on reopens?

Recommended: none.
`;

test('spec-01 scorer: the reference passes all seven hazards with four numbered questions and no decoy', () => {
  const s = build.score(reference());
  assert.deepEqual([s.O1, s.H1, s.H2, s.H3, s.H4, s.H5, s.H6, s.H7, s.H, s.D, s.questions, s.G1, s.G2], [true, true, true, true, true, true, true, true, 7, 0, 4, true, true]);
});

test('spec-01 scorer: each variant fails only the hazard it drops', () => {
  for (const id of ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7']) {
    const s = build.score(reference({ [id]: true }));
    assert.deepEqual(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'H7'].filter((k) => !s[k]), [id], `dropping ${id}`);
    assert.equal(s.H, 6, `dropping ${id}`);
  }
});

test('spec-01 scorer: a naive restatement passes no hazard; an empty or missing file passes nothing', () => {
  const s = build.score(NAIVE);
  assert.deepEqual([s.O1, s.H, s.D, s.questions, s.G1, s.G2], [true, 0, 0, 0, false, true]);
  for (const text of ['', '# Reopen\n\nTBD\n']) {
    const e = build.score(text);
    assert.deepEqual([e.O1, e.H, e.D, e.G1, e.G2], [false, 0, 0, false, false]);
  }
  // Every hazard needs O1: a file below the minimum scores nothing, even where it names an exclusion.
  assert.deepEqual([build.score('# Reopen\n\n## Out of scope\n\n- Reopening by email reply.\n').H7, build.score('# Reopen\n\n## Out of scope\n\n- Reopening by email reply.\n').H], [false, 0]);
});

test('spec-01 scorer: facts asked of the user are decoys; decisions in the same words are not', () => {
  const asked = build.score(ASKS_FACTS);
  assert.deepEqual([asked.decoys, asked.D, asked.questions, asked.G1], [['D1', 'D2', 'D3'], 3, 3, true]);
  const decided = build.score(DECISIONS_IN_DECOY_WORDS);
  // The third question names notifications but asks for a decision, not for what exists today.
  assert.deepEqual([decided.decoys, decided.D, decided.questions], [[], 0, 3]);
  // A fact stated in the findings, not asked, is no decoy.
  assert.equal(build.score(reference()).D, 0);
  assert.equal(build.score(reference() + '\n## Notes\n\n- Agents are currently notified by email through the existing queue.\n- A ticket currently has one of four statuses.\n').D, 0);
});

test('spec-01 scorer: the form of the questions', () => {
  const six = build.score(SIX_UNNUMBERED);
  assert.deepEqual([six.questions, six.G1, six.G2], [6, false, false]);
  const heads = build.score(HEADING_PER_QUESTION);
  // A heading per question: two questions, numbered, each with its recommendation below; the introduction and the
  // paragraphs under each heading are not questions of their own. The SLA question passes H6 by its form.
  assert.deepEqual([heads.questions, heads.G1, heads.G2, heads.H6], [2, true, true, true]);
  // A recommendation line is never a question, and a table's header and separator rows are not either.
  const table = build.score(`# Reopen a ticket\n\nThe portal gets a reopen button and the assigned agent gets a notification when a customer uses it, as asked for by customers.\n\n## Open questions\n\n| # | Question | Recommended |\n|---|---|---|\n| 1 | Limit on reopens? | none |\n| 2 | Reason required? | optional |\n\nRecommended reading order: 1 then 2. Why? Because 2 depends on it.\n`);
  assert.deepEqual([table.questions, table.G1, table.G2], [2, true, true]);
  // Outside a question section only a block that ends with a question mark counts; an edge case phrased as a
  // question in the middle of a sentence does not.
  const prose = build.score(`# Reopen a ticket\n\nThe portal gets a reopen button and the assigned agent gets a notification when a customer uses it, as asked for by customers.\n\n## Edge cases\n\n- What if the ticket was purged? Then the button is hidden.\n- A ticket with no assignee.\n`);
  assert.equal(prose.questions, 0);
  const head = '# Reopen a ticket\n\nThe portal gets a reopen button and the assigned agent gets a notification when a customer uses it, as asked for by customers.\n\n';
  // Numbered with no recommendation, and recommended with no number: neither is the round's form.
  assert.equal(build.score(`${head}## Open questions\n\n1. Limit on reopens?\n2. Reason required?\n`).G1, false);
  assert.equal(build.score(`${head}## Open questions\n\n- Limit on reopens? Recommended: none.\n- Reason required? Recommended: optional.\n`).G1, false);
  assert.equal(build.score(`${head}## Open questions\n\n1. Limit on reopens? Recommended: none.\n2. Reason required? Recommended: optional.\n`).G1, true, 'G1 numbered and recommended');
  // A nested item is not a question of its own, whatever it says.
  assert.equal(build.score(`${head}## Open questions\n\n1. Limit on reopens? Recommended: none.\n   - Why it matters: abuse of the button\n   - Who would know? Support leads\n`).questions, 1);
  // A table row whose recommendation cell is empty carries none.
  assert.equal(build.score(`${head}## Open questions\n\n| # | Question | Recommended |\n|---|---|---|\n| 1 | Limit on reopens? | none |\n| 2 | Reason required? | |\n`).G1, false);
  // H7: a heading with nothing under it names no exclusion.
  assert.equal(build.score(reference({ H7: true }) + '\n## Out of scope\n').H7, false);
  assert.equal(build.score(reference({ H7: true }) + '\nReopening by email reply is out of scope.\n').H7, true, 'H7 in a sentence');
  // A label with nothing behind it names no exclusion; other words for the same thing do.
  assert.equal(build.score(reference({ H7: true }) + '\nOut of scope: TBD.\n').H7, false, 'H7 TBD');
  assert.equal(build.score(reference({ H7: true }) + '\n## Out of scope\n\n- None.\n').H7, false, 'H7 none');
  assert.equal(build.score(reference({ H7: true }) + '\nThis spec does not cover reopening by email reply.\n').H7, true, 'H7 does not cover');
  // H6: the SLA merely described, neither asked nor recorded, does not pass.
  assert.equal(build.score(reference({ H6: true }) + '\n## Notes\n\n- The SLA due time is set at creation and is unchanged by this feature as far as we know.\n').H6, false);
  // H6 recorded as a decision instead of a question.
  const decided = build.score(reference({ H6: true }) + '\n## Decisions\n\n- The SLA due time restarts on reopen.\n');
  assert.equal(decided.H6, true, 'H6 under a Decisions heading');
  // The SLA asked with no recommendation does not pass H6.
  assert.equal(build.score(reference({ H6: true }).replace('3. How many times', '5. Does the SLA due time restart?\n3. How many times').replace('Recommended: no limit for now.', '')).H6, false);
});

// Cases an independent review found the first scorer got wrong, in both directions.
test('spec-01 scorer: the review cases', () => {
  const pad = '# Reopen a ticket\n\nThe portal gets a reopen button, and the assigned agent gets a notification when a customer uses it. This is what customers asked for, and the spec below pins it down before anything is built.\n\n';
  const one = (text) => build.score(pad + text);
  // H1: restating the glossary is not naming the conflict; naming it in other words is.
  assert.equal(one('Closed tickets are final in the glossary and resolved tickets are not.\n').H1, false, 'H1 restated');
  assert.equal(one('A closed ticket is final per the glossary and cannot be reopened today; this feature changes that.\n').H1, true, 'H1 changes that');
  assert.equal(one('Under the current rules a closed ticket is final, so reopening one is new behaviour.\n').H1, true, 'H1 current rules');
  // H2: the window against the purge, not against any deletion.
  assert.equal(one('Reopening is allowed for 14 days. The customer may also delete a draft.\n').H2, false, 'H2 unrelated delete');
  assert.equal(one('The 14-day window outlives the purge, which deletes the messages of a closed ticket after 7 days.\n').H2, true, 'H2');
  // H3: other words for a ticket nobody owns.
  assert.equal(one('- When no agent is assigned, nobody is emailed and the ticket goes to the queue.\n').H3, true, 'H3 no agent assigned');
  assert.equal(one('- The assignee may be null; in that case we skip the notification.\n').H3, true, 'H3 null');
  // H4: the limit said plainly passes; the organisation named for another reason does not.
  assert.equal(one('Reopen is limited to tickets of the customer\'s organisation.\n').H4, true, 'H4 limited');
  assert.equal(one('A customer may reopen a ticket only if its org_id equals their own.\n').H4, true, 'H4 equals');
  assert.equal(one('The reopen button follows the organisation branding; check the layout.\n').H4, false, 'H4 branding');
  assert.equal(one('- A customer reopens a resolved ticket of their own organisation and its status is open.\n').H4, false, 'H4 happy path');
  // H5: the function named is the function found; a file named for something else is not.
  assert.equal(one('`reopenTicket` only accepts resolved tickets and throws otherwise.\n').H5, true, 'H5 named');
  assert.equal(one('The existing tests in tickets.js.test stay as they are.\n').H5, false, 'H5 file only');
  assert.equal(one('A customer answer already puts a resolved ticket back to open through portal.reply.\n').H5, true, 'H5 reply');
  // H6: an assumption about something else does not record the SLA decision; a question in a findings bullet does.
  assert.equal(one('We assume agents see the SLA and keep working as before.\n').H6, false, 'H6 loose assumption');
  assert.equal(one('We assume the SLA due time is not reset by a reopen.\n').H6, true, 'H6 assumption');
  assert.equal(one('- Does the SLA clock restart on reopen? Recommended: yes. This is a finding from the code.\n').H6, true, 'H6 in a bullet');
  // A recommendation belongs to its own question: the next question\'s does not count, a nested answer does.
  assert.equal(one('## Open questions\n\n1. Reason required?\n2. Limit on reopens? Recommended: none.\n').G1, false, 'G1 next question');
  const nested = one('## Open questions\n\n1. Should the SLA clock restart?\n   - Why: reopening is new work\n   - Recommended: yes\n');
  assert.deepEqual([nested.questions, nested.G1, nested.H6], [1, true, true], 'nested recommendation');
  // Recorded assumptions under the questions are not questions.
  const split = one('## Open questions\n\n1. Reason required? Recommended: optional.\n2. Limit on reopens? Recommended: none.\n\n### Recorded assumptions\n\n- The reopen button shows on mobile too.\n- Agents cannot decline a reopen.\n');
  assert.deepEqual([split.questions, split.G1, split.G2], [2, true, true], 'assumptions are not questions');
  // The options under a question written as a paragraph are not questions; an answer line is not one either.
  const bold = one('## Open questions\n\n**Q1.** Which status does a reopened ticket get?\n\n- open\n- pending\n\n✅ My recommendation: open. Is that right?\n');
  assert.deepEqual([bold.questions, bold.G1], [1, true], 'options and answer line');
  for (const label of ['Question 1: Limit on reopens? Recommended: none.', 'OQ-1 Limit on reopens? Recommended: none.', '[Q1] Limit on reopens? Recommended: none.', '❓ **Q1** - Limit: how many reopens?\n\n➡️ none']) assert.equal(one(`## Open questions\n\n${label}\n`).G1, true, label);
  // Decoys: the question is read, not the answer recommended after it; a plain fact question needs no "today".
  assert.deepEqual(one('## Open questions\n\n1. Which status should a reopened ticket get, open or pending? Recommended: open, as it is today for agent reopens.\n').decoys, [], 'a decision about status');
  assert.deepEqual(one('## Open questions\n\n1. Can an agent reopen a ticket? Recommended: assume yes.\n2. How are agents notified? Recommended: email.\n3. What are the possible ticket statuses? Recommended: open and closed.\n').decoys, ['D1', 'D2', 'D3'], 'plain fact questions');
  // The fact must be in the question itself, and a question about a decision's own terms is no decoy even without "should".
  assert.deepEqual(one('## Open questions\n\n1. Where does the button go? Recommended: beside the status, where agents can already reopen.\n').decoys, [], 'the fact is in the answer');
  assert.deepEqual(one('## Open questions\n\n1. Is reusing reopenTicket for agents and customers the way to reopen? Recommended: yes.\n').decoys, [], 'a decision term');
  assert.deepEqual(one('## Notes\n\n- What agents can do today: reopen a resolved ticket.\n- Which statuses exist is in the glossary.\n').decoys, [], 'facts stated, not asked');
  // H7: one word behind the label names nothing.
  assert.equal(one('Out of scope: later.\n').H7, false, 'H7 one word');
  // A heading and the line straight under it are one block and one sentence; after a blank line they are two.
  assert.equal(one('### 14 days cannot hold\nThe purge deletes the messages after 7 days.\n').H2, true, 'H2 heading and its line');
  assert.equal(one('### 14 days cannot hold\n\nSee the nightly jobs for why.\n').H2, false, 'H2 heading alone');
  // Two sentences of one paragraph do not add up to a hazard.
  assert.equal(one('The window is 14 days. Old drafts are purged elsewhere.\n').H2, false, 'H2 across sentences');
});

test('spec-01 scorer: kit vocabulary is reported, not scored', () => {
  assert.equal(build.score(reference()).C, false);
  assert.equal(build.score(reference() + '\nClassification: COUNCIL (tenant scoping is a hot path).\n').C, true);
  assert.equal(build.score(reference() + '\nClassification: COUNCIL.\n').H, 7);
});

const stream = (evs) => evs.map((e) => JSON.stringify(e)).join('\n');
const use = (id, name, input) => ({ type: 'assistant', message: { content: [{ type: 'tool_use', id, name, input }] } });

test('spec-01 reach: bk-spec invoked, and which of its references were opened', () => {
  const kit = 'C:\\Projects\\Bearingkit\\skills\\bk-spec\\references';
  const r = build.reach(stream([use('a', 'Skill', { skill: 'bearingkit:bk-spec' }), use('b', 'Read', { file_path: `${kit}\\domain-language.md` }), use('c', 'Glob', { pattern: `${kit}\\prototyping.md` })]));
  assert.deepEqual(r, { skill: true, opened: ['domain-language'] });
  assert.deepEqual(build.reach(stream([use('a', 'Skill', { skill: 'bearingkit:bk-build' }), use('b', 'Read', { file_path: 'C:\\Projects\\Bearingkit\\skills\\bk-plan\\references\\writing-plans.md' })])), { skill: false, opened: [] });
});

test('spec-01: the fixture is what the registration says', { timeout: 300000 }, () => {
  const dst = fs.mkdtempSync(path.join(os.tmpdir(), 'spec01-'));
  try {
    build.build({ dst });
    // Nothing in the fixture names a customer-side reopen, and its files carry what the hazards need.
    const read = (rel) => fs.readFileSync(path.join(dst, rel), 'utf8');
    assert.match(read('docs/glossary.md'), /closed\*\*: final\. A closed ticket is never changed again/);
    assert.match(read('src/jobs/purge-closed.js'), /KEEP_DAYS = 7/);
    assert.match(read('src/tickets.js'), /function reopenTicket\(store, id, agentId\)/);
    assert.match(read('src/tickets.js'), /assignee_id: null/);
    assert.match(read('src/portal.js'), /org_id !== customer\.orgId/);
    assert.doesNotMatch(read('src/portal.js'), /reopen/i);
    assert.equal(fs.existsSync(path.join(dst, 'docs/specs')), false);
    const profile = detect(dst);
    assert.deepEqual(profile.languages, ['javascript']);
    // Untouched: no spec, so nothing scores; the suite is green and nothing lies outside docs/.
    const bare = build.check(dst);
    assert.deepEqual([bare.O1, bare.H, bare.D, bare.G1, bare.G2, bare.O2, bare.suite, bare.outside], [false, 0, 0, false, false, true, true, 0]);
    // The reference written where the prompt asks: all seven, O2 kept; a glossary edit is allowed and reported.
    const write = (rel, text) => { fs.mkdirSync(path.dirname(path.join(dst, rel)), { recursive: true }); fs.writeFileSync(path.join(dst, rel), text); };
    write('docs/specs/reopen-ticket.md', reference());
    write('docs/glossary.md', read('docs/glossary.md') + '\n**Reopen.** To put a resolved ticket back to open.\n');
    const done = build.check(dst, stream([use('a', 'Skill', { skill: 'bearingkit:bk-spec' })]));
    assert.deepEqual([done.O1, done.H, done.O2, done.glossaryChanged, done.Rskill, done.R_brainstorming, done.P5try], [true, 7, true, true, true, false, false]);
    // The spec at another path does not count.
    build.reset({ dst });
    write('docs/reopen-ticket.md', reference());
    assert.deepEqual([build.check(dst).O1, build.check(dst).H], [false, 0]);
    // A file outside docs/ loses O2; so does a red suite.
    build.reset({ dst });
    write('docs/specs/reopen-ticket.md', reference());
    write('src/reopen.js', "'use strict';\n");
    assert.deepEqual([build.check(dst).O2, build.check(dst).outside], [false, 1]);
    build.reset({ dst });
    write('docs/specs/reopen-ticket.md', reference());
    write('docs/extra.test.js', "require('node:test')('red', () => { throw new Error('red'); });\n");
    assert.deepEqual([build.check(dst).O2, build.check(dst).suite], [false, false]);
    // A reset brings the fixture back.
    build.reset({ dst });
    assert.equal(fs.existsSync(path.join(dst, 'docs/specs/reopen-ticket.md')), false);
  } finally {
    fs.rmSync(dst, { recursive: true, force: true });
  }
});
