# Changing a database: indexes, live tables, backfills and settings

Ideas only, no text taken: jeffallan/claude-skills (database-optimizer, postgres-pro), addyosmani/agent-skills (performance-optimization, deprecation-and-migration, api-and-interface-design, security-and-hardening), mattpocock/skills (to-tickets: expand, migrate, contract), c0x12c/ai-toolkit (the transaction, schema and timezone rules), tuyenht/Antigravity-Core (the migration and database rules, database-design); field lessons L6 and L18 of v1 §18. Engine behaviour below was checked on 2026-09-18 against the PostgreSQL 18 and MySQL 8.4 documentation and, for the lock queue, the lock manager's README in the PostgreSQL source; a project on another major checks its own version's pages first. `bk-build/references/stacks/sql.md` holds the rules this file does not repeat. Rows: `docs/specs/2026-09-18-item-inventory.md`, target `bk-db`.

## Before any change

- The baseline covers both sides: the plan and logical reads of the statements the change should help, and of the writes it will slow. Every index is paid for on every insert, update and delete.
- One change per measurement, measured the same way afterwards. A change that leaves the numbers where they were is reverted, not kept "just in case", and the attempt is recorded so nobody tries it again.
- The change ships as a migration through the project's own tool and review, never typed into a production console.

## Indexes

- A composite index serves its leading columns, so `(a)` beside `(a, b)` is redundant. Column order is in `sql.md`.
- An index does not help the dominant value of a low-selectivity column (a partial index serves the rare value), a pattern with a leading wildcard (that needs a trigram or full-text index), a function on the column (index the expression instead), or a parameter of another type than the column.
- Under soft delete, a unique constraint is partial too: unique among the live rows only.
- A covering index (`INCLUDE`) pays off when the plan becomes an index-only scan with few heap fetches; it depends on vacuum keeping the visibility map current.
- Build on a live table with `CREATE INDEX CONCURRENTLY`. It cannot run inside a transaction block, and many migration tools wrap each migration in one, so it needs a migration of its own that runs outside a transaction. A failed build leaves an invalid index behind that must be dropped before the retry.
- An index with no scans since the statistics were reset, on every server that serves reads (each keeps its own counts), is a candidate to drop with `DROP INDEX CONCURRENTLY`, its definition kept for the way back. MySQL can make an index invisible first and watch what slows down.
- The change is done when the plan shows the planner using the new index, not when the migration ran.

## Changing a table that holds live data

- Set `lock_timeout` to a few seconds before any `ALTER TABLE`, and retry on timeout: a schema change that waits behind a long transaction holds up every statement on that table queued after it.
- Additive first. Adding a nullable column with no default changes only the catalog, and since PostgreSQL 11 so does one with a non-volatile default; the table is not rewritten.
- `NOT NULL` on an existing column: add `CHECK (col IS NOT NULL) NOT VALID`, run `VALIDATE CONSTRAINT`, which does not block reads or writes, then `SET NOT NULL`, which since PostgreSQL 12 uses the validated check instead of scanning the table; drop the check afterwards. PostgreSQL 18 also takes the `NOT NULL` constraint itself as `NOT VALID`, validated later. Foreign keys and other checks go the same way: `NOT VALID`, then `VALIDATE`.
- A type change rewrites the table and its indexes under an exclusive lock, unless the old type converts to the new one without a rewrite (`varchar` to `text`, for example). A rename or a type change that readers see goes expand–contract: add the new form beside the old, write both, backfill, move every reader (including raw SQL in jobs, views and reports, field lesson L6), stop writing the old form, and drop it in a later deploy. The drop is the destructive step and stops for a human.
- Backfill in batches: walk the primary key, one short transaction per batch, a pause between batches, resumable after a stop, watching replication lag. One `UPDATE` over the whole table holds its locks and its log for the whole run.
- The way back is written with the change (`sql.md`). A down migration cannot restore what a backfill overwrote or a dropped column held; say so in the proposal.
- MySQL: name the algorithm, `ALGORITHM=INSTANT` (which takes no `LOCK` clause but the default) or `ALGORITHM=INPLACE, LOCK=NONE`, so the statement fails instead of silently copying the table under a heavier lock.

## Writes that stay correct under concurrency

- A change that writes to more than one table runs in one transaction (field lesson L18).
- A counter or a balance is updated in place (`SET n = n + $1`), never read, changed in the application and written back. A read that decides a write locks the row (`SELECT … FOR UPDATE`) or becomes a conditional update.
- Idempotency comes from a unique constraint: claim the key with an insert that conflicts on the retry, never check first and insert after.
- Transactions stay short, with no network call inside; statement and idle-in-transaction timeouts bound what a runaway can hold.
- `NOT IN` over a subquery that can return a null matches nothing; use `NOT EXISTS`.

## Settings

- A setting is a change like any other: one at a time, measured, with the value it replaces written down. Some take effect only after a restart, which makes them a production change through bk-ops.
- Memory and pool sizes in a guide are hypotheses for this instance, never values to paste; each carries the measurement that chose it.

## Data model decisions

- Normalised by default. A denormalised copy names its reason and the mechanism that keeps it consistent.
- Foreign keys follow the project's convention when its instructions state one (the sources disagree: one forbids them as a house rule, another calls their absence an anti-pattern). Where the project says nothing, `sql.md`'s rule holds: a constraint encodes the invariant once, against every writer.
- Stay on the relational engine the project already runs until an access pattern proves it cannot serve it. An extension (full text, vectors, time series) is weighed before a second database, which doubles the operations work.
- Personal data: classify the columns, set a retention period, and give deletion a path that reaches backups, caches, search indexes and replicas.
- A backup counts once a restore from it has been tested, on a schedule.
