---
trigger: always_on
---
# Security baseline

Applies to every language and framework. Project or vendor rules may tighten it, never loosen it.

- Never print, log, or commit secrets. Configuration comes from the environment or a secret store; `.env` files stay out of version control and out of tool output.
- Parameterize every database query. String-built SQL is a finding, whatever the input source.
- Validate at the boundary (request, message, file) and encode at the output (HTML, URL, shell). Trust nothing that crossed a boundary.
- Least privilege: tokens and database roles carry only the rights the task needs; a read-only role for diagnostics.
- No evaluation of user-supplied code or templates; no shelling out with user-supplied strings.
- Every auth, session, role, or tenant-isolation invariant gets a regression test the first time it is touched.
- Multi-step state changes run inside one transaction; a partial write is a bug, not a corner case.
- Dependency majors are never self-upgraded inside a task; a major bump is its own reviewed change.
- Temporary bypasses (`TEMPORARY`, `REMOVE when done`) carry an expiry date and are listed in the session handoff until removed.
