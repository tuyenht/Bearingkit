===== docs/plans/csat-rating.md =====
# Implementation plan: customer satisfaction rating

Spec: `docs/specs/csat-rating.md` (approved, Mai Do, 2026-01-12).

This plan is written against the current repo (Node 20, no framework, no real DB — `src/store.js`
stands in for Postgres; "the portal" is plain functions in `src/portal.js`, not HTTP routes). Nothing
in this plan has been built yet.

## Open questions, with the recommendation this plan follows

I didn't have you to ask, so each of these is a judgment call. I picked the option below and built the
rest of the plan on it; flag any you'd answer differently and I'll adjust before coding.

1. **Can a `closed` ticket be rated, not just `resolved`?** Most resolved tickets auto-close three days
   later (`src/jobs/close-resolved.js`), which is a tight window for a customer to call in.
   **Recommendation: no — follow the spec literally.** Only `resolved` tickets can be rated; `open`,
   `pending`, and `closed` are all refused. This is exactly what's written and what the acceptance
   criteria test. If the three-day window turns out to be too short in practice, that's a product
   decision to revisit separately, not something to silently widen now.

2. **Where does the nightly summary get written?** The spec says the job "writes" a summary but names
   no destination. The one existing precedent in this repo (`src/jobs/export-tickets.js`) writes a
   JSON file to `exports/` for another team's job to pick up; the other two nightly jobs just mutate
   tickets and return a list of affected ids. **Recommendation: follow the `export-tickets.js`
   precedent** — write `exports/weekly-summary.json`, one row per agent, and also return the computed
   rows so tests can assert on them directly without reading the file. If a team lead dashboard or an
   email digest is wanted instead, that's an easy follow-up once someone names a consumer.

3. **Does a rating survive a reopen/re-resolve cycle?** An agent can reopen a resolved ticket
   (`reopenTicket`), and a customer reply also reopens it. If that ticket gets resolved again later,
   should it become ratable a second time? **Recommendation: no.** Requirement 2 says "a ticket has at
   most one rating," full stop, not "at most one rating per resolution." Treat it as permanent per
   ticket id. Simpler, and nothing in the spec suggests otherwise.

4. **Should `getMyTicket` expose the existing rating?** Not required by any acceptance criterion, but
   without it the only way for the portal to know "this ticket was already rated" is to attempt a
   rating and catch the refusal. **Recommendation: yes** — have `getMyTicket` attach `rating: null` or
   the stored rating row, the same way it already attaches `messages`. Small addition, avoids an
   awkward UX dead-end, low risk of being wrong.

5. **What does `rateTicket` return on success?** Every mutating function in this repo returns the row it
   just touched (`createTicket` → the ticket, `resolveTicket` → the updated ticket). **Recommendation:**
   `rateTicket` returns the stored rating row (`{ id, ticket_id, owner_id, score, created_at }`), not the
   ticket — the acceptance criteria talk about "the rating," not the ticket.

6. **Does the `assignee_id` → `owner_id` rename reach the glossary's "Assignee" entry?** The spec says
   rename the *field* "everywhere," and gives the reasoning that "Owner" is the term agents actually
   use. **Recommendation: yes, rename the glossary entry too** (`**Assignee.**` → `**Owner.**`,
   `docs/glossary.md:14`) — leaving the canonical terminology doc using the old word while the code uses
   the new one would recreate the exact mismatch the rename is fixing. I'm not renaming the
   `assignTicket` function or its `agentId` parameter — the spec asks for the field rename only, and
   "assign" is still the right verb for the action of handing a ticket to an agent.

## Step 1 — Rename `assignee_id` → `owner_id`

Mechanical and independent of everything else; do it first so later steps aren't written against a
field that's about to disappear.

Full set of references (confirmed by reading each file, not just grep):

- `src/tickets.js:14` — set to `null` in `createTicket`.
- `src/tickets.js:28` — `assignTicket` writes `{ assignee_id: agentId }`.
- `src/tickets.js:42` — `reopenTicket` reads `t.assignee_id` (twice) to decide/address the notification.
- `test/tickets.test.js:20` — asserts `t.assignee_id === null` on a fresh ticket.
- `test/export-tickets.test.js:21` — asserts the exported row's `assignee_id` value.
- `docs/glossary.md:14` — the "Assignee" entry (see recommendation 6 above).

Nothing else in the repo touches it — no migrations, no serializers, no routes exist to update, because
none of those layers exist here yet.

Change `assignee_id` to `owner_id` in all of the above. Run `node --test` after this step alone to
confirm the rename didn't break the existing suite before adding any new code on top.

## Step 2 — Rating storage in `src/store.js`

Add a second in-memory collection alongside `tickets`/`messages`, following the existing style exactly
(`Map`, auto-increment id, defensive copies in/out):

```js
insertRating(row) { const id = nextId++; ratings.set(id, { id, ...row }); return id; }
getRatingForTicket(ticketId) {
  for (const r of ratings.values()) if (r.ticket_id === ticketId) return { ...r };
  return null;
}
listRatings(filter = {}) {
  return [...ratings.values()].filter((r) => Object.entries(filter).every(([k, v]) => r[k] === v)).map((r) => ({ ...r }));
}
```

Rating row shape: `{ id, ticket_id, owner_id, score, created_at }`. `owner_id` is copied onto the rating
at rating time (not looked up fresh later) so the weekly summary job can group by owner without joining
back to tickets — and so a later reassignment of the ticket can't retroactively change who a past rating
counts for.

**Production note (not actionable in this repo):** `store.js` is explicitly a stand-in for Postgres
(`src/store.js:2`). Shipping this needs a real `ratings` table and the `assignee_id`→`owner_id` column
rename on `tickets` in whatever migration system the production adapter uses — that adapter isn't part
of this repo, so flag it to whoever owns it before this ships, alongside this plan.

## Step 3 — `rateTicket` in `src/portal.js`

Rating is a customer action scoped to their own ticket, same category as `reply` — add it next to
`reply`, reusing `getMyTicket` for the existence+org check rather than a separate authorization layer
(this is the established pattern: `getMyTicket` already returns `null` identically for "doesn't exist"
and "not yours," at `src/portal.js:10-14`, and `reply` already builds on it the same way).

```js
function rateTicket(store, customer, id, score, { now = new Date() } = {}) {
  const t = getMyTicket(store, customer, id);
  if (!t) return null;
  if (!Number.isInteger(score) || score < 1 || score > 5) throw new Error('score must be a whole number from 1 to 5');
  if (t.status !== STATUS.RESOLVED) throw new Error(`cannot rate a ${t.status} ticket`);
  if (store.getRatingForTicket(id)) throw new Error('ticket already rated');
  store.insertRating({ ticket_id: id, owner_id: t.owner_id, score, created_at: now.toISOString() });
  if (score <= 2 && t.owner_id) notifyAgent(store, t.owner_id, { type: 'low_rating', ticketId: id, score });
  return store.getRatingForTicket(id);
}
```

Matches the repo's existing error convention exactly: business-rule refusals (bad score, wrong status,
already rated) throw a plain `Error`; the not-found-or-not-yours case returns `null` instead of throwing,
so a cross-org attempt and a nonexistent ticket id are indistinguishable to the caller, per acceptance
criterion 5.

The `t.owner_id` guard before `notifyAgent` matters: `resolveTicket` doesn't require a ticket to be
assigned first (`src/tickets.js:31-35`), so an unassigned resolved ticket rated 1 or 2 must not crash —
`notifyAgent` throws on a falsy agent id (`src/notify.js:7`). Skipping the notification when there's no
owner is the only sane behavior; there's no agent to email.

Per recommendation 4, also extend `getMyTicket` to attach the rating:

```js
return { ...t, messages: store.getMessages(id), rating: store.getRatingForTicket(id) };
```

## Step 4 — Nightly job: `src/jobs/weekly-summary.js`

Same shape as the other two date-driven jobs (`(store, { now = new Date() } = {})`, module-level
constant for the window, filtering done in the job rather than pushed into the store — matching
`close-resolved.js`'s style), plus the file-write from `export-tickets.js` since this job needs an
output artifact:

```js
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const WINDOW_DAYS = 7;
const DAY = 24 * 60 * 60 * 1000;
const SUMMARY_DIR = path.join(__dirname, '..', '..', 'exports');

function weeklySummary(store, { now = new Date(), dir = SUMMARY_DIR } = {}) {
  const since = now.getTime() - WINDOW_DAYS * DAY;
  const recent = store.listRatings().filter((r) => new Date(r.created_at).getTime() >= since);

  const byOwner = new Map();
  for (const r of recent) {
    if (!byOwner.has(r.owner_id)) byOwner.set(r.owner_id, []);
    byOwner.get(r.owner_id).push(r.score);
  }
  const summary = [...byOwner.entries()].map(([owner_id, scores]) => ({
    owner_id,
    count: scores.length,
    average: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100,
  }));

  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'weekly-summary.json');
  fs.writeFileSync(file, JSON.stringify(summary, null, 2) + '\n');
  return { file, summary };
}

module.exports = { weeklySummary, WINDOW_DAYS };
```

`Math.round(x * 100) / 100` gives `(5 + 4 + 1) / 3 = 3.33`, matching acceptance criterion 7 exactly.

## Step 5 — Tests

New file `test/ratings.test.js`, same style as `test/tickets.test.js` (fresh `createStore()` per test,
`at(days)` helper, `drain()` before/after for email assertions). Cover, one test per line:

- Rating a resolved ticket with 4 stores `{ score: 4, created_at }` against the ticket.
- Score `0`, `6`, `3.5`, and non-numeric are all refused.
- Rating an `open` or `pending` ticket is refused.
- A second rating of an already-rated ticket is refused, and the first rating is unchanged.
- `portal.rateTicket(store, globex, <acme's ticket id>, 4)` returns `null` — same as rating a
  nonexistent id.
- Score `2` queues one `drain()` entry addressed to the ticket's owner; score `3` queues none.
- `weeklySummary`: an agent with ratings 5, 4, 1 inside 7 days gets `{ count: 3, average: 3.33 }`; a
  rating from 8 days ago is excluded from that count.

Update in place for the rename (step 1 covers the edits; this is just the verification step):

- `test/tickets.test.js:20` → `owner_id`.
- `test/export-tickets.test.js:21` → `owner_id`.

Run `node --test` after every step, not just at the end — the suite is fast and each step above is
independently checkable.

## Step 6 — Docs

- `docs/glossary.md:14`: rename "Assignee" to "Owner" (recommendation 6), and add a short "Rating" entry
  next to "SLA due time" in the same terse style: one score from 1 to 5, at most one per ticket, left by
  the customer on a resolved ticket.
- `README.md`: add `src/ratings` bullet if a separate module is introduced — not needed here since
  `rateTicket` lives in `src/portal.js`; do add a fourth bullet under "Three jobs run every night" for
  `weekly-summary.js` once it exists, and fix that line to "Four jobs."

## Explicitly out of scope

- Any HTTP layer. Nothing in this repo has routes today; "from the portal" means "callable as
  `portal.rateTicket(...)`," consistent with `openTicket`/`reply`. If an HTTP surface gets added later
  for the portal in general, rating rides along with it then.
- The production Postgres migration (new `ratings` table, `assignee_id`→`owner_id` column rename) — see
  the production note in Step 2. This repo only has the in-memory stand-in.
- Any change to how/whether a ticket can be reopened after rating — per recommendation 3, a rating is
  permanent regardless of later reopen/re-resolve cycles, so nothing about `reopenTicket` needs to
  change.
