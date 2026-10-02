# helpdesk

The support desk behind our customer portal. Agents work tickets in the back office; customers see their own organisation's tickets in the portal.

- `src/tickets.js`: the ticket model and what agents can do with a ticket.
- `src/portal.js`: what a customer can do from the portal.
- `src/notify.js`: outgoing email to agents.
- `src/store.js`: the in-memory store the tests run against (production uses the same interface over Postgres).
- `docs/glossary.md`: the words we use, and what they mean here.

Two jobs run every night:

- `src/jobs/close-resolved.js` closes tickets the customer has left alone.
- `src/jobs/purge-closed.js` clears out old closed tickets.

## Tests

```
node --test
```

No dependencies to install. Node 20 or later.
