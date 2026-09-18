---
name: bk-db
description: "Explain and diagnose database performance from the plan; change indexes and live tables with a way back. Use when: slow query, EXPLAIN, index not used, lock, deadlock, bloat, vacuum; query chậm, tối ưu SQL, sao không dùng index, bị lock. Not for: errors or failing tests, use bk-debug."
---

# bk-db

## Read first
- The project's instruction files, schema and migrations: the engine and its major version, the ORM and migration tool, which databases exist, which one is production, and how the project connects.
- The stack profile (run `detect-stack` as bk-protocol's host notes say) and `bk-build/references/stacks/sql.md`, whose rules every change here keeps.
- A database knowledge base, when the instructions in context name one: search it before answering, in the user's own words, untranslated, with its own search command (its index when it has none), and follow its own rules for answering. One that cannot be reached is said to be unreachable.
- `references/diagnose.md` before reading a plan or chasing a lock, bloat, connection or replication problem; `references/change.md` before an index, a change to a table that holds live data, a backfill or a setting.

## Steps
Name the path first. A slow statement, a lock, bloat or a load problem takes the diagnose path; an index, a live-table change, a backfill or a setting takes the change path, and only after a diagnosis. A question about how the database behaves is answered from the three sources in Gates, the knowledge base first when one is named, and takes neither path unless the user asks for the work.

**Diagnose**
1. Name the database: engine and major version, environment, and whether the connection reaches production. Use only the connection the project already exposes, with a read-only role; credentials never appear in a command or in output.
2. Check that the database is the slow part: the time requests spend in queries and waiting for a connection, against their total. High latency with little database time is not a database problem.
3. Classify the symptom with the tree in `references/diagnose.md` and take the first measurement it names: the plan of one slow statement, statement statistics ranked by total time when many are slow, the lock waits when requests hang. `EXPLAIN ANALYZE` runs the statement, so a write's plan comes from plain `EXPLAIN` or from a rolled-back transaction away from production.
4. Read the plan: estimated against actual rows, logical reads (buffers), the node that dominates, loops. Name the cause with the evidence for it and against it.
5. On a host with subagents the measuring can run as the query-optimizer persona (`bk-protocol/references/personas.md`, `bk-protocol/references/host-tools.md`); its report comes back with the same labels.

**Change**
1. State the baseline before touching anything: the plan and logical reads of the statements the change should help, the writes it will slow, and the method.
2. One change per measurement. Choose the online form (`references/change.md`) and name the lock it takes, for how long, and what queues behind it.
3. Write the way back: the drop or down migration, what it cannot restore (rows a backfill overwrote, a dropped column's data), and the check that proves it worked.
4. Propose it as COUNCIL: the change, its lock, the baseline, the expected effect with its method, its write cost, and the way back.
5. After approval, apply it through a migration (bk-build's migration step), measure the same way on the same data, keep it only if the numbers moved, and revert it if writes or replication lag got worse.

## Gates
- Every claim carries its source, and the three are never blended: the engine's documentation for the pinned version, the knowledge base with its own grade carried through (a rule of thumb stays one), and your own reasoning, marked unchecked.
- Plans are compared by shape and logical reads; a timing counts only on the same data, parameters and cache state, never alone.
- Optimizer hints and planner switches are diagnostics, never fixes; what they reveal (statistics, a predicate, an index) is the fix.
- Read-only until the owner approves: DDL, data changes, ending a session, `VACUUM FULL`, a statistics refresh or a setting change on a shared or production database are COUNCIL. A destructive step (drop, truncate, the contract step of a migration) stops for a human.
- A knowledge base that was not searched or could not be reached is never cited, and general knowledge is never presented as its content.

## Evidence to paste
- Diagnose: the engine and version, the statement, its plan with estimated against actual rows and buffers, the classification, and the cause with its source label.
- Change: the plans and numbers before and after by the same method, the lock taken, and the way back with its check.

## Next step
- bk-build for the migration or the query, bk-test for its regression check, bk-review before push (migrations are a hot path), bk-ops to apply it to production; bk-debug when the database error is a bug, not a slowness.

Sources: no upstream text vendored - ideas only from jeffallan/claude-skills (MIT, reference), addyosmani/agent-skills (MIT, ideas-only), mattpocock/skills (MIT), vercel-labs/agent-skills (no license), c0x12c/ai-toolkit (no license), tuyenht/Antigravity-Core (owner-authored), and the owner's database playbook (method only; the knowledge base stays outside the kit); field lessons L6, L9 and L18 (v1 §18).
