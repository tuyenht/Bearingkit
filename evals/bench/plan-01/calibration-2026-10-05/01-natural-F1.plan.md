===== docs/plans/csat-rating.md =====
# Implementation plan: customer satisfaction rating

Spec: `docs/specs/csat-rating.md` (approved, Mai Do, 2026-01-12).

This repo has no HTTP layer, no migrations, and no real mail/queue library — `src/portal.js`,
`src/tickets.js`, `src/notify.js` and `src/jobs/*.js` are plain functions over an in-memory
`store.js` that stands in for Postgres. This plan stays inside that reality: no framework, no
schema tool, nothing invented that isn't already a pattern in the code.

## Open questions, answered

The spec doesn't pin down a few implementation details. Rather than block on them, here is the
call I'd make for each, with the reasoning, so this can be built as-is. Flag any of these if you'd
decide differently and I'll adjust before writing code.

1. **Where does a rating live?** On the ticket row itself, as two new nullable fields
   (`rating_score`, `rated_at`) — the same shape as `resolved_at`/`resolved_by`/`closed_at`. Not a
   separate ratings table/map.
   *Why:* the acceptance criteria literally say "the rating is stored with the ticket, the score
   and the time," and "at most one rating" falls out for free from a nullable column (check it's
   `null` before allowing a rating) — no new store methods, no join.

2. **Where does the rating action live?** `src/portal.js`, as `rateTicket(store, customer, id,
   score, { now })`, next to `openTicket`/`reply`.
   *Why:* it's customer-initiated and org-scoped, exactly like the other two.

3. **Not-found vs. wrong-org vs. invalid state — what shape of failure for each?** Reuse the two
   failure idioms already in the codebase, don't invent a third:
   - Ticket doesn't exist, or belongs to another org → **return `null`** (reuses
     `getMyTicket`'s `!t || t.org_id !== customer.orgId` check verbatim, so both cases are
     genuinely indistinguishable, not just documented as such).
   - Bad score, wrong ticket status, already rated → **throw a plain `Error`** with a descriptive
     message, matching `resolveTicket`/`reopenTicket`'s `cannot resolve a ${status} ticket` style.
   *Why:* this is the existing split in `portal.js`/`tickets.js` (read-ish/ownership failures
   return `null`; precondition violations throw) and the spec's "same answer as a ticket that does
   not exist" criterion only makes sense against the `null` path.

4. **Check ordering.** Org/existence first, then score format, then ticket status, then
   already-rated — in that order.
   *Why:* checking org membership first means a customer probing another org's ticket never learns
   anything about that ticket's status or rating from the error they get back (they just get
   `null`, same as a 404). Score format is cheap input validation, so it goes before the
   ticket-state checks.

5. **"Notified by email" — build real email sending?** No. Call the existing `notifyAgent` queue
   (`src/notify.js`), exactly like `reopenTicket` already does. A real mail worker reads that queue
   elsewhere; this repo has never sent mail directly and shouldn't start here.

6. **Notification event shape.** `{ type: 'low_csat_rating', ticketId, score }`, sent to
   `agent:${owner_id}`, only when `owner_id` is set (an unassigned-but-resolved ticket has no one
   to notify — same guard `reopenTicket` already uses for `notifyAgent`).

7. **Where does the nightly summary job write its output?** A JSON file, `exports/csat-summary.json`,
   written the same way `export-tickets.js` writes `exports/tickets.json`.
   *Why:* there's no dashboard or agent-facing UI in this repo to push the summary into, and the
   spec doesn't ask for one — "a nightly job writes ... a summary" is satisfied by the same
   file-output contract `export-tickets.js` already uses for a downstream consumer (there,
   finance's reporting job; here, presumably a future team-lead view). Building that consumer is
   out of scope.

8. **Average rounding.** Round to 2 decimal places (`Math.round(x * 100) / 100`).
   *Why:* the acceptance example (5, 4, 1 → 3.33) is `10/3` rounded to exactly 2 places.

9. **Does the glossary's "Assignee" entry get renamed too?** Yes, to "Owner," same definition
   text.
   *Why:* requirement 6 justifies the column rename by the glossary's own words ("the assignee is
   the agent who owns the ticket") — leaving the glossary saying "Assignee" while the code says
   `owner_id` recreates the exact mismatch the rename is fixing. `docs/specs/csat-rating.md` itself
   is left alone — it's an approved, dated spec, not living documentation.

10. **Does the rename touch function/parameter names** (`assignTicket`, `agentId`, etc.)**?** No —
    only the stored field `assignee_id` → `owner_id`. Renaming anything else is unrequested scope.

11. **Schema/migration note.** There's no migration tool or real Postgres code in this repo —
    `store.js` is schema-free (`Object.assign(t, patch)`, equality-filtered `listTickets`), so it
    needs **no code change** for either the rename or the new fields. Whatever real Postgres-backed
    implementation of this same store interface exists outside this repo will need: `assignee_id`
    renamed to `owner_id`, and two new nullable columns `rating_score` (smallint) and `rated_at`
    (timestamptz). That's a note for whoever owns that implementation, not a task here.

## Data model changes

On the ticket row (`src/tickets.js` `createTicket`, and everywhere else the field is touched):

- `assignee_id` → `owner_id` (rename, requirement 6).
- `rating_score: null` — integer 1–5 once rated, else `null`.
- `rated_at: null` — ISO timestamp once rated, else `null`.

No change to `src/store.js` (it's generic — see open question 11).

## Step 1 — rename `assignee_id` to `owner_id`

Do this first and as its own change, before adding any new field, so the rating code is written
directly against the new name.

| File | Change |
|---|---|
| `src/tickets.js:14` | `assignee_id: null` → `owner_id: null` in `createTicket` |
| `src/tickets.js:28` | `store.updateTicket(id, { assignee_id: agentId })` → `{ owner_id: agentId }` in `assignTicket` |
| `src/tickets.js:42` | `t.assignee_id` (both uses) → `t.owner_id` in `reopenTicket` |
| `test/tickets.test.js:20` | `assert.equal(t.assignee_id, null)` → `t.owner_id` |
| `test/export-tickets.test.js:21` | `r.assignee_id` → `r.owner_id` in the destructure |
| `docs/glossary.md:14` | rename the **Assignee** entry to **Owner**, same definition text |
| `README.md` | no literal `assignee_id` reference today — no change needed beyond step 3 below |

`src/portal.js`, `src/notify.js`, `src/store.js`, and the three existing jobs don't reference the
field — nothing to change there.

Run `node --test` after this step alone; it should pass unchanged (pure rename, no behavior
change) before moving on.

## Step 2 — `rateTicket` in `src/portal.js`

Add, exported alongside the existing four functions:

```js
function rateTicket(store, customer, id, score, { now = new Date() } = {}) {
  const t = getMyTicket(store, customer, id);
  if (!t) return null;
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error(`invalid rating score ${score}`);
  if (t.status !== STATUS.RESOLVED) throw new Error(`cannot rate a ${t.status} ticket`);
  if (t.rating_score != null) throw new Error('this ticket has already been rated');
  store.updateTicket(id, { rating_score: score, rated_at: now.toISOString() });
  if (score <= 2 && t.owner_id) {
    notifyAgent(store, t.owner_id, { type: 'low_csat_rating', ticketId: id, score });
  }
  return getMyTicket(store, customer, id);
}
```

Needs `const { notifyAgent } = require('./notify');` added to `portal.js`'s requires. `STATUS` is
already imported there.

Covers requirements 1–4 and acceptance criteria rows 1–5 directly (see test mapping below).

## Step 3 — nightly job: weekly per-agent summary

New file `src/jobs/weekly-csat-summary.js`, same shape as the other three jobs:

```js
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const SUMMARY_WINDOW_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;
const EXPORT_DIR = path.join(__dirname, '..', '..', 'exports');

function weeklyCsatSummary(store, { now = new Date(), dir = EXPORT_DIR } = {}) {
  const totals = new Map(); // owner_id -> { ratings, sum }
  for (const t of store.listTickets()) {
    if (t.rating_score == null || !t.owner_id) continue;
    if (now.getTime() - new Date(t.rated_at).getTime() > SUMMARY_WINDOW_DAYS * DAY) continue;
    const entry = totals.get(t.owner_id) || { ratings: 0, sum: 0 };
    entry.ratings += 1;
    entry.sum += t.rating_score;
    totals.set(t.owner_id, entry);
  }
  const summary = [...totals.entries()]
    .map(([owner_id, { ratings, sum }]) => ({ owner_id, ratings, average: Math.round((sum / ratings) * 100) / 100 }))
    .sort((a, b) => a.owner_id - b.owner_id);

  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'csat-summary.json');
  fs.writeFileSync(file, JSON.stringify(summary, null, 2) + '\n');
  return { file, agents: summary.length };
}

module.exports = { weeklyCsatSummary, SUMMARY_WINDOW_DAYS };
```

Window boundary, worked out from the acceptance text directly: a rating exactly 7 days old is
counted, exactly 8 days old is not. So "skip" is `age > 7 * DAY`, not `age >= 7 * DAY` — double check
this against the test below before relying on it elsewhere.

Ratings on a ticket that was never assigned (`owner_id` null) are silently excluded — there's no
agent to attribute them to. Worth a one-line comment in the file, like the other jobs have, since
it's not obvious from the code alone.

## Step 4 — tests

New file `test/csat-rating.test.js`, following the `export-tickets.test.js` precedent (own file
per feature) rather than growing `tickets.test.js`. Mirrors the existing fixtures (`acme`, `globex`,
`at(days)`).

| Acceptance criterion | Test |
|---|---|
| Rate a resolved ticket of own org with 4 → stored with score + time | assert `rating_score`/`rated_at` on the ticket returned by `rateTicket`, and again via `store.getTicket` |
| Non-integer / out-of-range score refused | `assert.throws(() => rateTicket(..., 0), /invalid rating score/)`, same for `6` and `3.5` |
| Open/pending ticket refused | create ticket (open, don't resolve), `assert.throws(..., /cannot rate a open ticket/)` |
| Second rating refused, first stands | rate once, rate again → throws; assert `rating_score` still equals the first value |
| Other-org ticket → same as nonexistent | `assert.equal(rateTicket(store, globex, t.id, 4), null)` and assert it equals the nonexistent-id case `rateTicket(store, acme, 99999, 4)` |
| Score ≤ 2 queues one email, score 3 queues none | `drain()` before each, assign an owner first, rate with 2 → assert one queued `low_csat_rating` to `agent:<owner>`; separately rate a different ticket with 3 → assert `drain()` is empty |
| Weekly summary: 5, 4, 1 in 7 days → 3 ratings, avg 3.33; 8-day-old not counted | build 4 resolved+rated tickets for one owner at `at(0)`, `at(1)`, `at(2)`, `at(-8)`-style offset (or rate at `at(0)` and run the job at `at(8)` for the 8-day-old one), run `weeklyCsatSummary(store, { now, dir })`, read the written JSON, assert `{ owner_id, ratings: 3, average: 3.33 }` and that the 8-day-old rating isn't in any entry |
| `owner_id` rename | already covered by the updated assertions in `tickets.test.js` / `export-tickets.test.js` from step 1 |

Use `fs.mkdtempSync`/`fs.rmSync` around the summary-job test exactly as `export-tickets.test.js`
does, passing `{ dir }` so it doesn't write into the real `exports/` folder.

## Step 5 — docs

- `README.md`: add a fourth bullet under "jobs run every night" for
  `src/jobs/weekly-csat-summary.js`, one line, matching the existing bullet style.
- `docs/glossary.md`: rename **Assignee** → **Owner** (step 1), and add a short **Rating** entry
  (score 1–5, one per ticket, set once the ticket is resolved) so the new concept is documented
  the same way every other domain concept here is.

## Build order

1. Rename `assignee_id` → `owner_id` everywhere (step 1), run `node --test`, confirm green with no
   behavior change.
2. Add `rateTicket` to `portal.js` (step 2) + its tests (step 4, first six rows).
3. Add the `weekly-csat-summary` job (step 3) + its test (step 4, last row).
4. Update `README.md` and `docs/glossary.md` (step 5).
5. Full `node --test` run.

## Explicitly out of scope

- Any HTTP/API layer, auth, or routing — none exists in this repo; `rateTicket` is a function
  call like its siblings, not an endpoint.
- Actually sending email — only queuing, matching every other notification in this codebase.
- A UI or endpoint for team leads to read the weekly summary — only the file is produced here.
- Any real database/migration change — flagged as a note (open question 11), not a task in this
  repo.
