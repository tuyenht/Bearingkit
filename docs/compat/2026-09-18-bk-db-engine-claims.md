# bk-db · engine claims checked against vendor documentation · 2026-09-18

Every engine behaviour that `skills/bk-db/references/diagnose.md` and `change.md` state as fact, with the page that settles it. Checked on 2026-09-18 and 2026-09-19: 29 claims by a research agent restricted to official documentation (it recorded each page and a short quote; the main session read every verdict), the rest by the main session. PostgreSQL "current" is 18; MySQL is 8.4. No text of these pages is copied into the kit.

| Claim as the references use it | Verdict | Source |
|---|---|---|
| `EXPLAIN ANALYZE` executes the statement; a write inside `BEGIN … ROLLBACK` is undone | true | postgresql.org/docs/current/sql-explain.html |
| PostgreSQL 18 includes buffer counts in `EXPLAIN ANALYZE` by default | true, since 18 | same page; release notes 18 |
| `CREATE INDEX CONCURRENTLY` cannot run in a transaction block, does not block writes, waits for older transactions, leaves an invalid index when it fails | true | docs/current/sql-createindex.html |
| `DROP INDEX CONCURRENTLY` exists and cannot run in a transaction block | true | docs/current/sql-dropindex.html |
| A column with a non-volatile default is added without a table rewrite | true, since 11 | release notes 11 |
| `SET NOT NULL` skips its scan when a valid `CHECK` proves no nulls | true, since 12 | release notes 12; docs/current/sql-altertable.html |
| A `NOT NULL` constraint can be added `NOT VALID` and validated later | true, since 18 | release notes 18 |
| `VALIDATE CONSTRAINT` takes `SHARE UPDATE EXCLUSIVE`, which does not block reads or writes | true | docs/current/sql-altertable.html; explicit-locking.html |
| A type change rewrites the table and its indexes unless the old type is binary coercible to the new one | true (the page's example is `text` ↔ `varchar`) | docs/current/sql-altertable.html |
| `lock_timeout` aborts a statement that waits too long for a lock | true | docs/current/runtime-config-client.html |
| A lock request queued behind a conflicting waiting request waits for it | true; not in the user manual, stated in the lock manager's README in the PostgreSQL source (`src/backend/storage/lmgr/README`) | checked by the main session |
| `pg_blocking_pids()` names the sessions blocking a backend | true, since 9.6 | docs/current/functions-info.html |
| A detected deadlock is resolved by aborting one transaction; a consistent lock order is the defence | true | docs/current/explicit-locking.html (checked by the main session) |
| Plain `VACUUM` keeps freed space for reuse; `VACUUM FULL` rewrites under `ACCESS EXCLUSIVE` | true | docs/current/sql-vacuum.html |
| Long or idle-in-transaction sessions, replication slots, prepared transactions and standby feedback hold back cleanup | true | docs/current/routine-vacuuming.html; runtime-config-replication.html |
| `age(datfrozenxid)` / `age(relfrozenxid)` against `autovacuum_freeze_max_age` (default 200 million); the server stops assigning transaction IDs before wraparound | true | docs/current/routine-vacuuming.html |
| `pg_stat_statements` needs preloading and `CREATE EXTENSION`; `total_exec_time` since 13 | true | docs/current/pgstatstatements.html; docs 12 and 13 |
| Index scan counts are per server; a standby keeps its own | true | docs/current/hot-standby.html |
| `pg_stat_replication` lag columns since 10; `pg_last_xact_replay_timestamp()` on a standby | true | release notes 10; docs/current/functions-admin.html |
| `max_connections` defaults to 100 | true | docs/current/runtime-config-connection.html |
| `statement_timeout` and `idle_in_transaction_session_timeout` | true | docs/current/runtime-config-client.html |
| Extended statistics (`CREATE STATISTICS`) capture dependencies between columns | true | docs/current/sql-createstatistics.html |
| `ANALYZE` takes `SHARE UPDATE EXCLUSIVE` and can change plans | true | docs/current/sql-analyze.html; explicit-locking.html |
| A partial unique index enforces uniqueness among the rows it covers | true | docs/current/sql-createindex.html |
| `INSERT … ON CONFLICT` needs an inferable unique index or constraint (`DO NOTHING` may omit the target) | true | docs/current/sql-insert.html |
| `SELECT … FOR UPDATE` blocks other updates, deletes and locking reads of the rows until the transaction ends | true | docs/current/explicit-locking.html |
| PostgreSQL runs one server process per connection | true | docs/current/connect-estab.html |
| An index-only scan depends on the visibility map that vacuum maintains; `INCLUDE` makes a covering index | true | docs/current/indexes-index-only-scans.html |
| A replication slot keeps WAL until consumed and can fill `pg_wal`; `max_slot_wal_keep_size` caps it | true | docs/current/warm-standby.html |
| PgBouncer transaction pooling breaks `SET`, `LISTEN`, SQL-level `PREPARE`, session advisory locks and temporary tables kept across transactions | true | pgbouncer.org/features.html |
| MySQL `EXPLAIN ANALYZE` executes the statement (since 8.0.18; `SELECT`, multi-table `UPDATE` and `DELETE`, `TABLE`); plain `EXPLAIN`, including `FORMAT=TREE`, does not | true | dev.mysql.com/doc/refman/8.4/en/explain.html; 8.0.18 release notes |
| MySQL reports the latest deadlock in `SHOW ENGINE INNODB STATUS`; `innodb_print_all_deadlocks` logs every one | true | refman 8.4, innodb-deadlocks.html |
| MySQL `performance_schema.data_locks` / `data_lock_waits` and `sys.innodb_lock_waits` | true | refman 8.4 |
| MySQL fails an `ALTER TABLE` whose named algorithm is not supported; `ALGORITHM=INSTANT` takes only `LOCK=DEFAULT` | true | refman 8.4, alter-table.html |
| MySQL invisible indexes are still maintained and let a drop be tested first | true | refman 8.4, invisible-indexes.html |
| SQLite `EXPLAIN QUERY PLAN`; `ANALYZE` stores statistics in `sqlite_stat1` | true | sqlite.org/eqp.html; lang_analyze.html |

One correction came from this check: the first draft of `change.md` wrote `ALGORITHM=INSTANT` beside `LOCK=NONE`, a combination MySQL rejects.
