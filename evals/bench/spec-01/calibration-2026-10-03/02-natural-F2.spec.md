# Spec: customer reopen of a closed ticket

Status: draft, not yet built.
Author: tuyenht, drafted by Claude.

## Problem

Customers keep asking for a way to reopen a ticket from the portal after it's closed. Today that's
impossible by design — `docs/glossary.md` is explicit: *"closed: final. A closed ticket is never
changed again. If the customer comes back, they start a new ticket."* `portal.reply` enforces this
at `src/portal.js:24` by throwing on any reply to a `closed` ticket.

This spec adds one carve-out: a customer may reopen their own closed ticket from the portal within
**14 days** of its `closed_at`, and the ticket's assignee is notified when they do.

## Current behavior (for context)

- Status lives on the ticket row: `open → pending/resolved → closed` (`src/tickets.js:4`).
- Nothing closes a ticket manually today — the *only* path to `closed` is the nightly
  `closeResolved` job, which closes a `resolved` ticket after 3 quiet days
  (`src/jobs/close-resolved.js`). So every closed ticket reaching this feature got there via that
  job, and `closed_at` is reliably set.
- A second nightly job, `purgeClosed`, deletes a closed ticket's messages 7 days after `closed_at`
  and sets `purged: true`; the ticket row itself is kept for reporting
  (`src/jobs/purge-closed.js:1-4`). This is a **legal/retention requirement**, not a cleanup
  convenience.
- Reopening already exists, but only for agents and only from `resolved`: `reopenTicket` in
  `src/tickets.js:38-44` flips `resolved → open`, clears `resolved_at`, and notifies the assignee —
  but only if a *different* agent did the reopening.
- `portal.reply` already has a *soft* reopen: a customer replying to a `resolved`/`pending` ticket
  flips it back to `open` (`src/portal.js:26`). It just refuses outright on `closed`.
- There is no audit/history log anywhere in the codebase — status transitions aren't recorded
  beyond the current row and the transient notification queue (drained and discarded by the mail
  worker).

## The conflict this spec has to resolve

`KEEP_DAYS` (7, in `purge-closed.js`) is *shorter* than the requested reopen window (14). A ticket
closed on day 0 has its messages deleted on day 7, but a customer could still try to reopen it as
late as day 13. Recommendation below (Q4) is to leave retention alone and accept that late reopens
start with an empty message history — not to weaken the legal retention requirement to accommodate
this feature.

## Design

### New constant and function in `src/tickets.js`

```js
const REOPEN_WINDOW_DAYS = 14;
const DAY = 24 * HOUR;

// A customer takes a closed ticket back, within the window. Mirrors reopenTicket's
// agent path, but keyed off closed_at instead of resolved_at, and always notifies
// the assignee since the actor here is never the assignee.
function reopenClosedTicket(store, id, customerId, { now = new Date() } = {}) {
  const t = mustGet(store, id);
  if (t.status !== STATUS.CLOSED) throw new Error(`cannot reopen a ${t.status} ticket this way`);
  if (now.getTime() - new Date(t.closed_at).getTime() >= REOPEN_WINDOW_DAYS * DAY) {
    throw new Error('this ticket closed more than 14 days ago; please open a new ticket');
  }
  const updated = store.updateTicket(id, { status: STATUS.OPEN, closed_at: null, purged: false });
  if (t.assignee_id) {
    notifyAgent(store, t.assignee_id, { type: 'ticket_reopened', ticketId: id, by: `customer:${customerId}` });
  }
  return updated;
}
```

Notes:
- Guarded on `CLOSED` only — `resolved`/`pending` tickets still go through the existing
  `portal.reply` soft-reopen path; `open` tickets need no reopening. No overlap with the existing
  agent `reopenTicket`, which stays `resolved`-only and agent-only (unchanged — see Non-goals).
- `closed_at` is nulled on reopen, matching how `resolved_at` is already nulled on every existing
  reopen/reply transition (`tickets.js:41`, `portal.js:26`). Nothing in this codebase keeps a
  history of prior status timestamps, so this is consistent with the existing amnesia model, not a
  new gap introduced by this feature.
- `purged` resets to `false` so a *second* close-and-purge cycle on the reopened conversation
  behaves correctly (see Q5).
- No assignee → no `notifyAgent` call (it throws on a falsy id, same guard style as the existing
  agent path at `tickets.js:42`). The ticket still reopens; it just surfaces in the unassigned queue.

### New function in `src/portal.js`

```js
// A customer brings a closed ticket back, within the reopen window, and says why.
function reopen(store, customer, id, body, { now = new Date() } = {}) {
  const t = getMyTicket(store, customer, id);
  if (!t) return null;
  reopenClosedTicket(store, id, customer.id, { now });
  store.addMessage(id, { from: 'customer', body, at: now.toISOString() });
  return getMyTicket(store, customer, id);
}
```

Same ownership check as every other portal function (`getMyTicket`'s org-level guard) — see Q8 on
why this inherits the existing org-level, not strictly per-customer, authorization. Shape mirrors
`reply`: one call does the status transition and records the customer's message, same as `reply`
does both in one call today. `reopenClosedTicket`'s errors (wrong status, window expired) propagate
up unchanged; the web layer (not present in this repo) is responsible for turning them into
portal copy.

### Doc update

`docs/glossary.md:12` needs to change from:

> **closed**: final. A closed ticket is never changed again. If the customer comes back, they
> start a new ticket.

to:

> **closed**: final, except that the customer may reopen it from the portal within 14 days of the
> closing date. After that, they start a new ticket.

## Open questions, with recommended answers

**Q1 — Does reopening require the customer to say why, or can it be a bare status flip?**
Recommend: require a message (`body`), same as every other customer-facing action in this codebase
(`createTicket` and `reply` both carry a body). A reopen with no context is not useful to the
agent. No extra validation beyond what `reply`/`createTicket` already do today (neither rejects an
empty string) — don't add validation this feature wasn't asked to add.

**Q2 — What status does the ticket land in: `open` or `pending`?**
Recommend: `open` — waiting for an agent. Consistent with both the existing customer soft-reopen in
`reply` (`pending`/`resolved → open`) and the agent `reopenTicket` (`resolved → open`).

**Q3 — Should the SLA clock (`sla_due_at`) reset on reopen?**
Recommend: no, leave it untouched. The existing agent-initiated `reopenTicket` doesn't touch it
either, so this keeps the two reopen paths consistent. If the business wants a fresh SLA clock on
reopen, that's a change to *both* reopen paths and should be its own decision, not folded into this
feature.

**Q4 — The 7-day purge job runs inside the 14-day reopen window. What happens to a day-10 reopen?**
Recommend: leave `KEEP_DAYS` at 7 — it's there because legal asked for it
(`purge-closed.js:3-4`), and extending retention to fit this feature trades a compliance commitment
for a UX nicety. A reopen on day 7–13 succeeds, but starts with no prior message history; the
customer's new message is the first one anyone sees. This should be called out as a known, accepted
limitation, not treated as a bug.

**Q5 — Should the `purged` flag reset to `false` on reopen?**
Recommend: yes. Otherwise, if the ticket is answered, resolved, and closed again, `purgeClosed`
will skip it forever (`if (t.purged) continue;` at `purge-closed.js:13`), silently retaining the
new conversation past the legal retention window.

**Q6 — Is the 14-day boundary inclusive or exclusive — does a ticket closed exactly 14×24h ago still
qualify?**
Recommend: exclusive, i.e. blocked once `now - closed_at >= 14 days`. This matches the existing
`<` comparison style used by both nightly jobs (`close-resolved.js:11`, `purge-closed.js:14`), so
all three day-window checks in the codebase read the same way.

**Q7 — Can a ticket be reopened more than once over its lifetime (reopen → auto-close again later →
reopen again)?**
Recommend: yes, no cap. Each reopen attempt is gated independently against the ticket's *current*
`closed_at`. There's one `closed_at` field and no history table, so this falls out naturally — and
there's no stated business need for a cap. Abuse potential is already limited by the fact that
closing only happens via the 3-day idle nightly job, not anything the customer can trigger directly.

**Q8 — Who can reopen which tickets — strictly the ticket's own customer, or anyone in the org?**
Recommend: inherit the existing portal authorization model as-is (org-level, via `getMyTicket`'s
`org_id` check at `portal.js:12` — any customer in the organisation can already see and reply to any
ticket in that organisation). Tightening this to a per-customer check is a separate, broader change
to the portal's security model and shouldn't be bundled into this feature.

**Q9 — Does this need a new nightly job (e.g. to proactively mark tickets as "no longer
reopenable")?**
Recommend: no. Closed tickets are already inert until someone acts on them; the window check only
needs to run at the moment a reopen is attempted, inline in `reopenClosedTicket`, the same way the
existing jobs compute their own day-math inline. No new scheduled job.

**Q10 — Should this notify anyone besides the current assignee (e.g. a team channel)?**
Recommend: no — reuse `notifyAgent` exactly as it exists today, targeted at `t.assignee_id` only.
That's the only notification primitive in the codebase (`src/notify.js`), and there's no existing
"notify a channel/queue" concept to extend. Unassigned tickets simply get no notification (nothing
to send it to).

**Q11 — Should an agent also be able to reopen a closed ticket (not just a customer)?**
Recommend: out of scope for this spec. The existing agent `reopenTicket` stays exactly as it is
today (`resolved`-only). If agents need to reopen closed tickets too, that's a separate, symmetrical
feature request and should be scoped on its own.

## Non-goals

- No change to `reopenTicket` (agent path) or `portal.reply`'s existing soft-reopen behavior.
- No audit/history log. If the business later wants a durable record of "closed on X, reopened by
  customer Y on Z," that needs a new history model this codebase doesn't have yet — flagged here as
  future work, not built as part of this feature.
- No change to `KEEP_DAYS`/message retention.
- No new nightly job.

## Testing plan

Extend `test/tickets.test.js` (or a new file, following the same flat `node:test` style) with:

1. Customer reopens a closed ticket within the window → status `open`, `closed_at` cleared,
   assignee notified with `{ type: 'ticket_reopened', by: 'customer:<id>' }`.
2. Reopen attempted at `closed_at + 14 days` (or later) → throws, status unchanged.
3. Reopen attempted at `closed_at + 13 days` → still succeeds (boundary check from Q6).
4. Reopen of a closed, unassigned ticket → succeeds, `drain()` returns nothing.
5. Reopen attempted on a ticket in another organisation → `portal.reopen` returns `null` (same
   pattern as the existing `getMyTicket`/cross-org test at `test/tickets.test.js:43-47`).
6. Reopen attempted on a non-closed ticket (`open`/`pending`/`resolved`) via `portal.reopen` →
   throws `cannot reopen a <status> ticket this way`.
7. Reopen of a ticket already past the 7-day purge (`purged: true`, messages deleted) but still
   inside the 14-day window → succeeds; resulting message list contains only the new customer
   message; `purged` resets to `false`.
8. Reopen, then close again later, then purge again → confirms `purged` reset in (7) didn't break
   the second purge cycle.

## Rollout

No data migration needed — no new fields, no schema change, just a new status transition path.
Safe to ship behind nothing in particular; the only user-visible surface is the portal UI exposing
a "Reopen" action on closed tickets within 14 days (UI/routing layer not present in this repo).
