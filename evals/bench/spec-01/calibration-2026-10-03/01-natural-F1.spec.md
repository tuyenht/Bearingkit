# Spec: Customer-initiated reopen of a closed ticket

Status: **draft — not yet built**
Owner: tuyenht
Requested by: customers, via support feedback ("customers keep asking for this")

## 1. Summary

Today, once a ticket is `closed`, it is final: `docs/glossary.md` says "closed... is never changed again. If the customer comes back, they start a new ticket," and `portal.js`'s `reply()` enforces that (`portal.js:24`). This spec adds one exception: a customer can reopen their own closed ticket from the portal **within 14 days of its `closed_at`**, and the ticket's assigned agent is notified when that happens.

## 2. Current behavior (for reference)

- Statuses: `open`, `pending`, `resolved`, `closed` (`src/tickets.js:4`).
- Only path into `closed` today: the nightly `close-resolved` job, 3 quiet days after `resolved_at` (`src/jobs/close-resolved.js`).
- Only existing reopen path: an **agent** reopening a `resolved` ticket, `resolved → open` (`tickets.js:38-44`). Reopening anything else throws `cannot reopen a ${status} ticket`. This already notifies the previous assignee via `notifyAgent` if a different agent reopens it (`tickets.js:42`).
- Customer replies to a `resolved`/`pending` ticket already flip it back to `open` (`portal.js:26`) — reopening-by-replying is an existing pattern, just not for `closed`.
- Nightly `purge-closed` job deletes a closed ticket's **messages** 7 days after `closed_at`, for legal/retention reasons, but keeps the ticket row as a summary (`src/jobs/purge-closed.js:2-4`).
- No HTTP/UI layer exists in this repo — `portal.js` is the backend surface a web layer would call. This spec only covers that backend surface.
- No audit/history log exists anywhere; the only record of ticket events is the `notify.js` outbound queue and the ticket row's own timestamp fields.
- Portal access is scoped by `org_id` only (`portal.js:11-13`), not by which customer created the ticket — any customer in the org can already view/reply to any of the org's tickets. Reopening follows the same model.

## 3. Open questions and recommendations

I didn't have you to ask, so each question below is answered with the recommendation I built the design around. Flag any you'd call differently and I'll adjust before building.

1. **How is "14 days" measured?**
   Recommend: exact elapsed time from `closed_at`, `now - closed_at < 14 * DAY`, matching the existing `QUIET_DAYS`/`KEEP_DAYS` style (`close-resolved.js:11`, `purge-closed.js:14`) rather than calendar days. At exactly 14×24h elapsed, the window is closed (same `<` convention as those jobs).

2. **Is this an on-demand check or a nightly sweep?**
   Recommend: on-demand, checked at the moment the customer requests the reopen — there's nothing to precompute. No new nightly job needed.

3. **Who is allowed to reopen — only the customer who filed it, or anyone in the org?**
   Recommend: anyone in the org, same as every other portal operation today (`listMyTickets`, `getMyTicket`, `reply` all scope by `org_id` only, not `customer_id`). Introducing a stricter per-customer check here would be inconsistent with the rest of the portal and out of scope for this change.

4. **Does reopening require a message from the customer, or is a bare "Reopen" action enough?**
   Recommend: message optional. The reopen action itself (e.g. a "Reopen ticket" button) should succeed with just that click — lower friction, matches "customers keep asking for this." If a message is supplied, append it to the thread so the agent has context; if not, the agent still gets a notification and can follow up.

5. **What status does it reopen into — straight to `open`, or back through `pending`/`resolved`?**
   Recommend: straight to `closed → open`, clearing `closed_at` and `resolved_at`, same shape as the existing `resolved/pending → open` flip in `reply()` (`portal.js:26`). No intermediate state.

6. **Does the assignee change?**
   Recommend: no — keep `assignee_id` as-is, so it goes back to the same agent who last owned it (and that's who gets notified). If the ticket was never assigned, it just re-enters the unassigned `open` queue as normal; skip notification (see Q8).

7. **Does `sla_due_at` need to be recalculated?**
   Recommend: yes, reset to `now + SLA_HOURS`. Today `sla_due_at` is set once at creation and never touched again (`tickets.js:16`); a ticket reopened up to 14 days after closing would otherwise show as wildly SLA-breached the instant it reopens, which would be misleading in queues/dashboards that sort on it. Treat the reopen like a fresh "first response" clock.

8. **What event type and recipient for the notification?**
   Recommend: reuse `notify.js`'s existing queue (`notifyAgent`), but a **new** event type, e.g. `ticket_reopened_by_customer`, distinct from the agent-driven `ticket_reopened` (`tickets.js:42`) — so anything downstream (templates, metrics) can tell the two apart. Only notify if `assignee_id` is set; `notifyAgent` throws on a missing agent id (`notify.js:7`), and an unassigned ticket has no one to notify.

9. **Conflict: the 7-day message purge happens *before* the 14-day reopen window closes.**
   `purge-closed.js` deletes a closed ticket's messages after 7 days (legal requirement — "do not keep conversation text of finished tickets longer than a week," `purge-closed.js:3-4`). If a customer reopens on day 10, their old conversation is already gone; only the ticket row (subject, dates) survives.
   Recommend: **don't** touch the 7-day retention — that's a legal constraint, not an engineering tradeoff, and shrinking the reopen window to match it undercuts the 14 days customers are being told. Instead, allow the reopen through day 14 regardless of purge state, and when `getMyTicket` is called on a ticket reopened after purge, it correctly shows an empty message list (it already does — `deleteMessages` just empties the array, `store.js:34-36`). The portal UI, when built, should say something like "earlier messages on this ticket aren't available" rather than imply a bug. Worth a sign-off from whoever owns that legal requirement before shipping, since it is a deliberate, visible gap — I'm flagging it rather than deciding it quietly.

10. **Reopen limits — can a customer reopen the same ticket indefinitely (reopen, let it re-close, reopen again)?**
    Recommend: no limit for v1. The existing agent-side reopen has no limit either, and adding abuse controls without evidence of abuse is scope creep. Note it as a candidate follow-up if it turns out to be a problem.

11. **New audit trail?**
    Recommend: don't build general audit infrastructure (none exists today, and this change shouldn't be the reason to add it). Do add one new field, `reopened_at`, set each time a customer reopens a ticket, so there's at least a last-reopened timestamp for reporting ("customers keep asking for this" implies someone will want to know how often it's used). This mirrors the existing style of plain timestamp fields (`resolved_at`, `closed_at`) rather than a separate log table.

## 4. Design

### 4.1 New constant (`src/tickets.js`)

```js
const REOPEN_WINDOW_DAYS = 14;
```

alongside the existing `SLA_HOURS`, and reusing the existing `DAY`/`HOUR` constants already defined per-file.

### 4.2 Core transition — `src/tickets.js`

New function, parallel to the existing agent-side `reopenTicket`:

```js
function reopenClosedTicket(store, id, { now = new Date() } = {}) {
  const t = mustGet(store, id);
  if (t.status !== STATUS.CLOSED) throw new Error(`cannot reopen a ${t.status} ticket`);
  if (now.getTime() - new Date(t.closed_at).getTime() >= REOPEN_WINDOW_DAYS * DAY) {
    throw new Error('this ticket closed more than 14 days ago; please open a new one');
  }
  const updated = store.updateTicket(id, {
    status: STATUS.OPEN,
    closed_at: null,
    resolved_at: null,
    reopened_at: now.toISOString(),
    sla_due_at: new Date(now.getTime() + SLA_HOURS * HOUR).toISOString(),
  });
  if (t.assignee_id) {
    notifyAgent(store, t.assignee_id, { type: 'ticket_reopened_by_customer', ticketId: id });
  }
  return updated;
}
```

Exported alongside the existing `reopenTicket`. Kept as a separate function rather than overloading `reopenTicket(store, id, agentId)`, because the two have different auth models (agent id vs. portal/org scoping), different source statuses (`resolved` vs. `closed`), and different window rules (none vs. 14 days) — forcing them into one function would mean branching on an implicit "who is calling" flag.

### 4.3 Portal entry point — `src/portal.js`

```js
function reopenTicket(store, customer, id, body, { now = new Date() } = {}) {
  const t = getMyTicket(store, customer, id);
  if (!t) return null;
  if (body) store.addMessage(id, { from: 'customer', body, at: now.toISOString() });
  reopenClosedTicket(store, id, { now }); // tickets.js — throws if not closed or window elapsed
  return getMyTicket(store, customer, id);
}
```

- Ownership/org scoping reuses `getMyTicket`, same as `reply()`.
- The message, if any, is added *before* the status flip, so it lands in the thread regardless of what happens next (it isn't gated by the window check — but the throw from `reopenClosedTicket` still surfaces to the caller either way).
- `reply()` itself is **not** changed: it continues to reject all `closed` tickets outright (`portal.js:24`). Reopening is a distinct, explicit action, not an implicit side effect of replying — this keeps "can I even talk to this ticket" (reply) separate from "can I bring this ticket back" (reopen), which matters once the window logic only applies to the latter.

### 4.4 Status/transition summary

```
open ──resolve──> resolved ──(3 quiet days, nightly)──> closed
  ^                   │                                    │
  │                reply/agent-reopen                       │ customer reopen,
  └───────────────────┘                                      │ within 14 days of closed_at
                                                              ▼
                                                            open
```

### 4.5 Data model

New ticket field: `reopened_at` (nullable timestamp, same shape as `resolved_at`/`closed_at`). In the real store this is a new column; `store.js`'s in-memory `Map` needs no schema change (`updateTicket` just does `Object.assign`, `store.js:19-24`), but the Postgres-backed production store (per `store.js:2`, not in this repo) needs a migration adding `reopened_at timestamptz null` to the tickets table.

## 5. Edge cases

- **No assignee**: skip notification; ticket re-enters the unassigned `open` queue like any other unassigned open ticket.
- **Reopened, closes again, reopened again**: window is always measured against the *current* `closed_at`; no special-casing needed since `closed_at` is overwritten each time it closes.
- **Exactly at the 14-day boundary**: rejected (uses `>=` for the rejection check, i.e. strictly less than 14×24h is allowed) — consistent with the `<` pattern in the nightly jobs.
- **Messages already purged (reopen on day 8–14)**: ticket reopens successfully with an empty message history; see open question 9.
- **`assignTicket`/`resolveTicket` after reopen**: no change needed — both already key off `status`, and a reopened ticket is `open` like any other, so existing agent-side functions work unmodified.

## 6. Testing plan

Add to `test/tickets.test.js` (or a new `test/portal.test.js` if the file is getting crowded):

- Reopen a `closed` ticket 1 day after `closed_at` → succeeds, status `open`, `closed_at`/`resolved_at` null, `reopened_at` set, `sla_due_at` refreshed.
- Reopen at 13 days, 23 hours → succeeds. At exactly 14×24h and beyond → throws the "closed more than 14 days ago" error.
- Reopen an `open`/`pending`/`resolved` ticket via the new portal function → throws `cannot reopen a ${status} ticket` (not a closed-specific error).
- Reopening with a message appends it to `getMessages`; reopening without one does not add a message but still flips status.
- Assignee gets a queued `ticket_reopened_by_customer` notification; unassigned ticket produces no notification and does not throw.
- Reopen after `purge-closed` has run (messages empty, `purged: true`) still succeeds; returned ticket has an empty message list.
- `getMyTicket`/org-scoping: a customer from a different org gets `null`, same as today's `reply()`/`getMyTicket` behavior.

## 7. Out of scope

- Any HTTP/UI wiring — this repo has no routes/views layer yet; this spec covers only the `tickets.js`/`portal.js`/`notify.js` functions a future web layer would call.
- Changing the 7-day message retention policy (legal-owned).
- Reopen rate limiting / abuse controls.
- General audit/event log infrastructure (only the single `reopened_at` field is added).
- Any change to the existing agent-initiated `resolved → open` reopen path.
