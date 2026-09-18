# SQL

**Written against:** PostgreSQL semantics, written from the vendor's own documented behaviour rather than from a version pinned on this machine. **Cross-checked against a live database: no.** No database exists on the machine this file was written on, so no number here comes from a run — every claim below is a rule to check, not a measurement. The first project that reads this file refreshes this line with its engine and major from its own `detect-stack` output, and anything engine-specific beyond what is written here is verified against that engine's documentation first.

**Read as a starting point, not vendored:** PatrickJS/awesome-cursorrules (CC0-1.0) PostgreSQL set. The text here is the kit's own. A project that ships its own schema conventions — how it names things, whether it uses foreign keys, how it soft-deletes — keeps them; this file never overrides a project's own instruction files.

## Before optimising anything

`EXPLAIN (ANALYZE, BUFFERS)` first, then the change, then the same plan again. A query "optimised" without both plans is an opinion. Read the plan for the row-count estimate against the actual: an estimate off by an order of magnitude is the finding, and the index is usually not the fix — stale statistics or a non-sargable predicate is.

`ANALYZE` runs the statement it explains. For an `INSERT`, `UPDATE`, `DELETE` or `MERGE` the write really happens, so the plan of a write comes from plain `EXPLAIN`, or from `ANALYZE` inside `BEGIN; … ROLLBACK;` on a database that is not production: the rollback undoes the rows, not the locks the statement held meanwhile or the sequence values it drew.

A predicate stops using an index the moment the column is wrapped in a function or coerced to another type. `WHERE lower(email) = $1` needs an index on `lower(email)`, or it scans.

## Schema

- **Timestamps carry their zone.** `TIMESTAMPTZ`, always. `TIMESTAMP` without one silently stores whatever the session's timezone was, and the value cannot be repaired later because the offset it was written with is gone.
- **`NOT NULL` is the default position.** Nullable is a decision, and a nullable column with no code path that reads the null is a bug in waiting.
- **Constraints encode the invariant once.** A check constraint holds against every writer, including the migration script and the person in a `psql` session; the application-layer check holds only against the application.
- **Explicit columns.** `SELECT *` couples the caller to column order and to columns it does not know about yet, and it defeats covering indexes.

## Indexes

- Every column a query filters or joins on is a candidate; every index is a write cost. Both halves are real, and an index nobody's plan uses is pure cost.
- On a live table, `CREATE INDEX CONCURRENTLY` — the plain form takes a lock that blocks writes for as long as the build runs.
- A partial index on the rows that are actually queried (`WHERE deleted_at IS NULL`) is smaller and faster than the full one.
- Composite index order follows the predicates: equality columns first, then the range, then what is only selected.

## Migrations

- **Additive and destructive are different risks.** Adding a nullable column is cheap; adding a `NOT NULL` with a default rewrites the table on older engines, and dropping a column is irreversible once the deploy is out.
- Every reader of a column being changed is found before the change, including the ones outside the ORM: raw SQL in jobs, views, materialised views, reports, dashboards.
- The rollback is written and tested in the same change, or the migration is not ready.
- A destructive step stops for a human. That gate is in `bk-build`, and this file is the reason it exists.

## Queries

- Parameterised, always. String interpolation into SQL is the injection, whatever the layer above claims to escape.
- A result set that can grow without bound needs a `LIMIT` and a deterministic `ORDER BY`, or pagination will repeat and skip rows.
- Multi-statement changes run in one transaction, with a `statement_timeout` so a runaway holds nothing for long.
- The N+1 is found by counting queries per request, not by reading the code — a loop that looks innocent issues one query per row.
