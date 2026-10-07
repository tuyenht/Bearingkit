===== docs/plans/csat-rating.md =====
# Implementation plan: customer satisfaction rating

Spec: `docs/specs/csat-rating.md` (approved, Mai Do, 2026-01-12).

This plan is written so it can be built without further input. Section "Decisions" lists
every point the spec leaves open, with the answer I'd recommend and the reasoning, so
they can be skimmed and overridden instead of asked one by one. Nothing in this plan has
been built yet.

## Decisions

These are the judgment calls the spec doesn't pin down. Each is written as
question → recommendation → why. Flag any you'd answer differently; otherwise I'll build
to the recommendation.

1. **Can a closed ticket still be rated?**
   Recommendation: no — only a ticket with status `resolved` can be rated. `open`,
   `pending`, and `closed` are all refused with the same "not resolved" error.
   Why: the spec's acceptance criteria only test `open`/`pending` explicitly, but the
   glossary says a closed ticket "is never changed again," and `close-resolved.js`
   already closes a resolved ticket after 3 quiet days. Treating closed the same as
   open/pending keeps one rule instead of a second special case, and it matches the
   existing precedent that `reply()` also refuses on `closed`.

2. **Where does the rating live, and does it carry the owner at time of rating?**
   Recommendation: a new `ratings` collection in the store, one row per ticket
   (`ticket_id`, `owner_id`, `score`, `rated_at`), with `owner_id` copied from the
   ticket *at the moment the rating is submitted*.
   Why: requirement 4 (email the assigned agent) and requirement 5 (per-agent weekly
   summary) both need "the agent this rating is about." A ticket's owner can change
   after resolution (reassignment, reopen-and-reassign). Snapshotting `owner_id` on the
   rating avoids the summary job silently crediting/blaming whoever owns the ticket
   *today* instead of whoever it was rated for, and avoids a join at report time.

3. **Does rating a ticket with no owner notify anyone?**
   Recommendation: no — if `owner_id` is null when the rating is submitted, skip the
   email silently; the rating still saves.
   Why: `resolveTicket()` doesn't require an assignee, so a resolved-but-unowned ticket
   is possible even if rare. The rating itself (requirements 1–3) doesn't depend on
   ownership, so it shouldn't fail because of it. `notifyAgent()` currently throws on a
   null agent id; the rating path should check first rather than relying on that throw.

4. **What does "a customer of another organisation gets the same answer as for a ticket
   that does not exist" mean for the return type?**
   Recommendation: `rateTicket()` returns `null` for both "no such ticket" and "wrong
   organisation," exactly like `portal.getMyTicket()` does today. All other refusals
   (bad score, wrong status, already rated) throw, matching how `portal.reply()` throws
   on a closed ticket.
   Why: reusing `getMyTicket()`'s existing org-scoping gets this for free and keeps the
   not-found-vs-invalid distinction consistent with the rest of `portal.js`.

5. **Where does the weekly summary get written?**
   Recommendation: a new nightly job, `src/jobs/csat-summary.js`, writes
   `exports/csat-summary.json` — one row per agent who received at least one rating in
   the window: `{ owner_id, ratings, average }`.
   Why: this codebase has no back-office API or dashboard layer to post a summary into —
   the only existing precedent for "a nightly job produces a report" is
   `export-tickets.js` writing a JSON file for another team to pick up. Following that
   convention is the smallest change that satisfies "a nightly job writes a weekly
   summary"; a UI or email digest on top of this file is separate follow-up work, not
   something to design speculatively now. Agents with zero ratings in the window are
   left out, since the store has no independent list of agents to report a zero against.

6. **What exactly counts as "the past seven days," at the boundary?**
   Recommendation: a rating counts if `now - rated_at <= 7 days`; it's excluded once the
   gap reaches 8 days. This mirrors the acceptance example directly (8 days old → not
   counted) and is the same "age in days, inclusive of the boundary used by the nightly
   job" style as `close-resolved.js` (closes at exactly 3 quiet days) and
   `purge-closed.js` (purges at exactly 7 days).

7. **How is the average rounded?**
   Recommendation: round to 2 decimal places (`Math.round(x * 100) / 100`), matching the
   spec's own example (10/3 → `3.33`).

8. **Does the customer ever see their own rating on the ticket?**
   Recommendation: yes — `portal.getMyTicket()` gains a `rating` field (`null`, or
   `{ score, rated_at }`), the same way it already attaches `messages`.
   Why: it's a near-zero-cost addition using data we already have loaded, and it gives
   the customer a visible reason a second rating attempt fails, instead of a dead end.
   If this is considered scope creep, it can be dropped without touching anything else
   in this plan.

9. **Does the rating function live in `portal.js` or `tickets.js`?**
   Recommendation: `portal.js`, as `rateTicket(store, customer, id, score, { now })`.
   Why: it's an action a customer takes, scoped to their org, the same shape as
   `openTicket()` and `reply()`. `tickets.js` is specifically the agent-side model.

10. **Notification event shape for a low score.**
    Recommendation: `notifyAgent(store, ticket.owner_id, { type: 'low_csat_rating',
    ticketId, score })`, queued the same way `ticket_reopened` is today.

## Data model changes

### `src/store.js`

Add a `ratings` map, keyed by `ticket_id` (enforces "at most one rating" at the storage
level isn't required — that rule is enforced in `portal.js` — but keying by ticket id
keeps lookups O(1) and makes "does this ticket have a rating" trivial):

- `insertRating(row)` — `row` is `{ ticket_id, owner_id, score, rated_at }`. Throws if a
  rating already exists for that `ticket_id` (defensive; the real check happens in
  `portal.rateTicket()` before calling this, so this throw should never trigger in
  practice).
- `getRating(ticketId)` — returns the rating row or `null`.
- `listRatings(filter = {})` — same exact-match filter convention as `listTickets()`.
  Used by the nightly summary job, which does its own date-window and grouping logic in
  JS, the same way `closeResolved`/`purgeClosed` do their own date filtering after
  `listTickets()`.

### Field rename: `assignee_id` → `owner_id`

Every occurrence, across code, tests, and docs:

- `src/tickets.js`: `createTicket()`'s initial row (`assignee_id: null` →
  `owner_id: null`), `assignTicket()`'s patch, both reads in `reopenTicket()`.
- `test/tickets.test.js`: the one assertion reading `t.assignee_id`.
- `test/export-tickets.test.js`: the row-shape assertion reading `r.assignee_id`.
- `docs/glossary.md`: the **Assignee.** entry becomes **Owner.**, keeping the same
  definition text ("The agent who owns the ticket. A ticket in the unassigned queue has
  no owner.").

Nothing else references `assignee_id` (checked with a repo-wide grep). Function and
parameter names (`assignTicket`, `agentId`) are left as-is — the spec only asks for the
field rename, and `assignTicket` still reads naturally as "assign an owner to a ticket."

## New behavior

### `src/portal.js`: `rateTicket(store, customer, id, score, { now = new Date() } = {})`

1. `const t = getMyTicket(store, customer, id);` — reuses existing org scoping.
2. If `!t`, return `null` (covers both "no such ticket" and "wrong organisation").
3. If `score` is not an integer in `[1, 5]`, throw (`'score must be a whole number from 1 to 5'`).
4. If `t.status !== STATUS.RESOLVED`, throw (`` `cannot rate a ${t.status} ticket` ``),
   matching the phrasing style of `resolveTicket()`'s own error.
5. If `store.getRating(id)`, throw (`'this ticket has already been rated'`).
6. `store.insertRating({ ticket_id: id, owner_id: t.owner_id, score, rated_at: now.toISOString() })`.
7. If `score <= 2 && t.owner_id`, call
   `notifyAgent(store, t.owner_id, { type: 'low_csat_rating', ticketId: id, score })`.
8. Return the updated `getMyTicket(store, customer, id)` (now carrying the `rating` field).

### `src/portal.js`: `getMyTicket()` change

Attach `rating: store.getRating(id)` alongside the existing `messages: store.getMessages(id)`.

### `src/jobs/csat-summary.js` (new)

Mirrors the shape of `export-tickets.js`:

```
const WINDOW_DAYS = 7;

function csatSummary(store, { now = new Date(), dir = EXPORT_DIR } = {}) {
  const byOwner = new Map();
  for (const r of store.listRatings()) {
    if (now.getTime() - new Date(r.rated_at).getTime() > WINDOW_DAYS * DAY) continue; // per decision 6
    if (!r.owner_id) continue;
    const bucket = byOwner.get(r.owner_id) || { owner_id: r.owner_id, ratings: 0, total: 0 };
    bucket.ratings += 1;
    bucket.total += r.score;
    byOwner.set(r.owner_id, bucket);
  }
  const rows = [...byOwner.values()].map((b) => ({
    owner_id: b.owner_id,
    ratings: b.ratings,
    average: Math.round((b.total / b.ratings) * 100) / 100,
  }));
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'csat-summary.json');
  fs.writeFileSync(file, JSON.stringify(rows, null, 2) + '\n');
  return { file, rows: rows.length };
}
```

A rating from an owner-less ticket (decision 3's edge case) is excluded from the summary
the same way it's excluded from notification.

Export `{ csatSummary, WINDOW_DAYS }`, matching `export-tickets.js`'s export shape.

### `README.md`

Add `csat-summary.json` to the three-nightly-jobs list and the new portal capability to
the one-line module description, mirroring the existing style — two short additions, no
restructuring.

## Tests to add

In `test/tickets.test.js` or a new `test/csat-rating.test.js` (recommend a new file —
rating is portal/customer behavior, not agent/ticket behavior, matching decision 9):

- Rating a resolved ticket of the customer's own org stores score + time; returned
  ticket's `rating` field reflects it.
- A score of `0`, `6`, `3.5`, or a string is refused; the ticket is left unrated.
- Rating an `open` or `pending` ticket is refused.
- Rating a ticket twice: the second attempt throws, and `store.getRating()` still shows
  the first score.
- A customer from another org rating the ticket gets `null`, same as a bogus ticket id.
- A score of `1` or `2` queues exactly one `low_csat_rating` email to the owner; a score
  of `3`, `4`, or `5` queues none.
- Rating a resolved-but-unowned ticket succeeds and queues no email even at score 1.

New `test/csat-summary.test.js`:

- Three ratings (5, 4, 1) in the past 7 days for one agent → summary row
  `{ owner_id, ratings: 3, average: 3.33 }`.
- A rating exactly 8 days old is excluded from the count and the average.
- An agent with zero ratings in the window does not appear in the output at all.

Field-rename coverage: the two existing tests that read `assignee_id` are updated in
place to read `owner_id` (decision is a rename, not new behavior, so no new test cases
are needed there — the existing assertions just change field name).

## Sequencing

Recommend building and landing this as two commits even though it's one PR, so the
mechanical rename doesn't hide the new feature in review:

1. Rename `assignee_id` → `owner_id` everywhere (requirement 6), tests updated in place,
   full suite green.
2. Add ratings storage, `portal.rateTicket()`, the `rating` field on `getMyTicket()`, the
   email notification, the `csat-summary.js` job, and all new tests.

## Open follow-up (explicitly out of scope here)

- Surfacing `csat-summary.json` to team leads (a dashboard, a digest email) — the spec
  only asks for the file to be written; who reads it and how is a separate piece of work
  once this lands.
- Back-filling ratings for already-closed tickets — out of scope since decision 1 scopes
  rating to `resolved` only, and the spec doesn't ask for it.
