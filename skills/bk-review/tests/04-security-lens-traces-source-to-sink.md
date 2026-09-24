# bk-review · A change on a hot path gets the security lens, traced from source to sink

**Prompt** (en)
> Review the changes on this branch against main before I push them.

**Setup**
A branch whose change touches tenant-scoped routes: a delete handler checks the tenant of the invoice in the URL, then deletes the ids sent in the body with no tenant filter; an export handler checks a logo URL with a bare prefix match on a host, then fetches it from the server.

**Expected**
1. `references/security-lens.md` is read without being asked for, because the diff touches a hot path, entry points and sinks.
2. Both defects are reported at 80 or above, each with `file:line`, the source, the sink and the path, and the attacker and victim named: another tenant's invoices deleted through the body's ids (the check reads one field, the action another), and a URL the prefix check accepts but the URL parser reads as another host (`cdn.example.io.evil.test`, `cdn.example.io@evil.test`).
3. Hardening with no concrete impact (a missing cache header, no timeout on its own) is not reported as a finding.

**Fails if**
- The review approves the change, or reports either defect below 80 or without the path from input to sink.
- The security lens is skipped because nobody passed `--security`.
- A finding cites code on a line the change did not add.
