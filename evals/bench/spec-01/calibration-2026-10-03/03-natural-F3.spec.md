# Spec: Customer-initiated ticket reopen (14-day window)

Status: **proposed, not built**. Author drafted this while the requester was away; every open question below carries the author's recommendation, and the recommendation is what the "Proposed behavior" section assumes. Review and adjust before implementation starts.

## Goal

A customer can reopen their own **closed** ticket from the portal, within 14 days of it closing, by replying to it. The agent who owned the ticket is notified when that happens.

## Current behavior (for reference)

- Statuses: `open → resolved → closed`, plus `pending` (waiting on customer). `closed` is documented as final: "A closed ticket is never changed again. If the customer comes back, they start a new ticket." (`docs/glossary.md:12`)
- `src/portal.js:21` `reply()` is the only customer-facing write path that touches status. On a `resolved`/`pending` ticket it flips status back to `open`. On a `closed` ticket it throws `'this ticket is closed; please open a new one'` (`src/portal.js:24`) — this is the line this feature changes.
- `src/tickets.js:38` `reopenTicket()` is a separate, **agent-only** reopen path, valid only from `resolved`, and already sends a notification when the reopening agent differs from the assignee (`src/tickets.js:42`). This function is untouched by this spec — it's a different trigger (agent action, not customer reply) and already has its own guard.
- `src/notify.js` queues one event shape — `{ to, event, queued_at }` — for an external mail worker to send; nothing in this repo renders or sends actual email. The existing `ticket_reopened` event (`src/tickets.js:42`) is the template to reuse.
- Two nightly jobs touch closed tickets: `src/jobs/close-resolved.js` closes a resolved ticket after 3 quiet days; `src/jobs/purge-closed.js` deletes a closed ticket's *messages* (not the row) after 7 days, for data-retention reasons (comment cites Legal, `src/jobs/purge-closed.js:3-4`). **7 days of message retention is shorter than the proposed 14-day reopen window** — see Q3.
- There is no audit log / history table anywhere in the codebase — only current-state fields (`resolved_at`, `closed_at`, `assignee_id`). Today the message thread is the closest thing to a history.

## Questions and recommendations

### Q1: Is this a new portal action, or does it fold into the existing reply flow?
**Recommendation: fold into `portal.reply()`.** The ticket already reopens-on-reply from `resolved`/`pending`; a closed-but-within-window ticket should behave the same way — the customer just types a message and submits, and the ticket comes back to `open`. This avoids a separate "Reopen" button/endpoint and matches the UX already established for resolved tickets. If product wants an explicit "Reopen" button (distinct from "Reply") instead of implicit reopen-on-reply, that's a UI decision layered on the same backend function — flag it before build if so, but defaulting to "reply reopens" needs no extra UI work.

### Q2: Does the reopen require a message body, or can a customer reopen with no text?
**Recommendation: require a body**, same as every other `reply()` call. A bare status flip with no content gives the agent nothing to act on. If product wants a one-click "Reopen" with no required text, that's a product ask to raise explicitly — default here is "reopening is replying."

### Q3: What happens when the ticket's messages were already purged (day 7+) but it's still inside the 14-day reopen window (days 8–14)?
**Recommendation: allow the reopen anyway.** The ticket row is kept specifically "as a summary... for reporting" (`src/jobs/purge-closed.js:2-3`), and purge is a data-retention rule, not a reopen-eligibility rule — conflating them would mean the reopen window is *effectively* 7 days for anyone who waits, which contradicts the ask. The customer's new message just starts the thread fresh (empty history + one new message). Surface this in the portal copy (e.g. "earlier messages on this ticket aren't available anymore") so the customer isn't confused by the gap, but don't block the reopen. No change to `purge-closed.js`'s 7-day window — that's a Legal-driven retention rule and out of scope here.

### Q4: What's the eligibility boundary — "within 14 days" inclusive or exclusive?
**Recommendation: match the existing job convention.** `close-resolved.js` and `purge-closed.js` both use `now - timestamp < N * DAY` as "not yet due" and act once that's false. Reopen should be the mirror: eligible while `now - closed_at < 14 * DAY`, rejected once `>= 14 * DAY`. Export the `14` as a named constant (`REOPEN_WINDOW_DAYS`) next to `STATUS`/`SLA_HOURS` in `src/tickets.js`, the same way `QUIET_DAYS`/`KEEP_DAYS` are exported from the job files — keeps it one tunable number instead of a magic literal, and testable.

### Q5: What if the ticket has no assignee (`assignee_id === null`)?
**Recommendation: skip the notification silently**, don't error. `notifyAgent()` already throws if given a falsy agent id (`src/notify.js:7`), so the call site must guard it — same pattern `reopenTicket()` already uses at `src/tickets.js:42`. A reopened, unassigned ticket just re-enters the unassigned queue as `open`, same as it would from any other path.

### Q6: Does reopening reset anything else — the SLA clock, `resolved_at`?
**Recommendation: no SLA recompute.** `sla_due_at` is documented as "when the first answer is due... set when the ticket is created" (`docs/glossary.md:16`) — a one-time historical value, never touched by any existing transition including the agent reopen path. Treat it the same way here: leave it alone. Do clear `resolved_at` and `closed_at` back to `null` on reopen, consistent with how `reopenTicket()` already clears `resolved_at` (`src/tickets.js:41`) and how a ticket's `closed_at` has no meaning once it's open again.

### Q7: Should there be a limit on how many times one ticket can be reopened this way?
**Recommendation: no limit for v1.** Nothing in the codebase tracks reopen counts today, and inventing a counter/abuse-limit is new scope the ask didn't request. If reopen abuse turns out to be a real support problem, that's a follow-up with its own data to justify a threshold.

### Q8: Does this need an audit trail ("ticket X reopened by customer Y at time Z")?
**Recommendation: not a separate audit log** (none exists in this codebase, and building one is a much bigger project than this feature). The new customer message itself, plus the `ticket_reopened` notification event already queued for the agent, is the record — same minimal-by-design approach the codebase already takes. If/when a real audit log gets built for other reasons, this event should feed into it, but that's not a prerequisite for shipping this.

### Q9: Does `docs/glossary.md`'s definition of `closed` need updating?
**Yes — it must change**, since it currently states a closed ticket "is never changed again" (`docs/glossary.md:12`), which this feature directly contradicts. Recommended rewording:

> **closed**: final after 14 days. A closed ticket can still be reopened by the customer replying within 14 days of closing; after that, or once an agent needs to make a change, the customer starts a new ticket.

## Proposed behavior

1. `portal.reply(store, customer, id, body, { now })`, when the ticket's status is `closed`:
   - If `now - closed_at >= REOPEN_WINDOW_DAYS * DAY` (14 days): throw an error, e.g. `` `this ticket closed more than ${REOPEN_WINDOW_DAYS} days ago; please open a new one` ``. (Replaces today's unconditional close-path error at `src/portal.js:24`.)
   - Otherwise: append the customer's message (as today), set `status: 'open'`, `closed_at: null`, `resolved_at: null`, and — if the ticket has an assignee — queue `notifyAgent(store, assignee_id, { type: 'ticket_reopened', ticketId: id, by: 'customer:<customer.id>' })`, mirroring the existing agent-reopen event shape (`src/tickets.js:42`) so the (external) mail worker can handle both with one template, distinguished by the `by` prefix.
2. `resolved`/`pending`/`open` behavior of `reply()` is unchanged.
3. `src/tickets.js`: add `REOPEN_WINDOW_DAYS = 14` next to `STATUS`/`SLA_HOURS`; no other change to that file (the agent-only `reopenTicket()` keeps its own rule — only from `resolved`).
4. No schema/store changes: reuses existing `status`, `closed_at`, `resolved_at`, `assignee_id` fields. No migration needed.
5. `docs/glossary.md` gets the reworded `closed` definition (Q9).

## Out of scope

- An explicit "Reopen" button distinct from replying (Q1) — revisit only if product asks.
- Any reopen-count limit or abuse detection (Q7).
- A general audit/history log (Q8).
- Changing the 7-day message purge window (Q3) — stays a Legal-driven retention rule, independent of this feature.
- Recomputing SLA on reopen (Q6).

## Testing plan

Add cases to `test/tickets.test.js` (existing single-file convention), using the file's `at(days)` helper and `drain()`:
- Customer replies to a closed ticket 5 days after closing → ticket is `open`, assignee receives `ticket_reopened` with `by: 'customer:<id>'`.
- Customer replies to a closed ticket 15 days after closing → throws, status unchanged.
- Customer replies to a closed, purged ticket (day 10, after the day-7 purge) → still reopens; message list contains only the new message.
- Customer replies to a closed, unassigned ticket within the window → reopens, `drain()` is empty (no notification attempted, no throw).
- Existing "a resolved ticket closes after three quiet days, and a closed one takes no answer" test (`test/tickets.test.js:52`) asserts `reply()` throws on any closed ticket — this test's premise changes and needs updating to reflect the new window-based behavior rather than a blanket rejection.

## Open items before build

- Confirm Q1 (implicit reopen-on-reply vs. explicit button) with whoever owns the portal UI.
- Confirm the exact customer-facing copy for the rejection message and for the "history unavailable" notice (Q3) — the strings above are placeholders.
- Confirm 14 days is calendar days from `closed_at` (UTC, matching how every other window in this codebase is computed) and not business days — assumed yes, since no existing window (`QUIET_DAYS`, `KEEP_DAYS`) accounts for weekends/holidays.
