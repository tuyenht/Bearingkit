# Diagnosing a database problem from its evidence

Ideas only, no text taken: jeffallan/claude-skills (database-optimizer, postgres-pro), addyosmani/agent-skills (performance-optimization and its checklist), mattpocock/skills (diagnosing-bugs, the performance branch), vercel-labs/agent-skills (vercel-optimize, database-egress-pooling-region), tuyenht/Antigravity-Core (database-design, the database rules), and the owner's database playbook for the knowledge-base method; field lesson L9 of v1 §18. Engine behaviour below was checked on 2026-09-18 against the PostgreSQL 18, MySQL 8.4 and SQLite documentation, the lock manager's README in the PostgreSQL source for the lock queue, and PgBouncer's documentation for transaction pooling; a project on another major checks its own version's pages first. `bk-build/references/stacks/sql.md` holds the rules this file does not repeat. Rows: `docs/specs/2026-09-18-item-inventory.md`, target `bk-db`.

## Is it the database?

- Put the request's total time beside the time it spends in queries and in waiting for a connection. When latency is high and database time is low, the cause is elsewhere: the network, the application's own CPU, a remote call. Compare CPU p95 with latency p95 before blaming the database, and name no provider, pooler or region change unless the project's own configuration shows it applies.
- Every endpoint slow at once, time spent waiting for a connection, the database reporting mostly idle sessions: that is pool exhaustion, not a slow query.
- A page that issues one query per row is an N+1; count the queries per request.

## The tree: symptom, then the first measurement

| Symptom | First measurement |
|---|---|
| one statement is slow | its plan, estimated against actual rows, with buffers |
| many statements are slow, no single culprit | statement statistics ranked by total time; the server's CPU, I/O and cache hit ratio; connections by state |
| requests hang, statements wait | the lock waits: who blocks whom, and how long the blocker's transaction has been open |
| errors name a deadlock | the server's deadlock report: the two statements and the order in which they took their locks |
| a table or index keeps growing without new rows, scans slow down over time | dead rows and the last vacuum per table, then what holds the cleanup horizon back |
| "too many connections", pool timeouts | connections by state and by client; pool size times instances against the server's ceiling |
| a replica returns stale reads | replication lag measured on both sides, and replication slots that retain log |

## Statement statistics

PostgreSQL's `pg_stat_statements` must be preloaded and created as an extension. Rank by total execution time first: the gain is at the top of the total, not of the mean. Then read calls, rows, and shared blocks read against hit for the same entries. Note when the statistics were last reset, so a before and an after cover comparable windows. MySQL keeps statement digests in the Performance Schema (the `sys` schema summarises them) and has its slow query log.

## Reading a plan

- Plain `EXPLAIN` estimates and runs nothing. `ANALYZE` executes the statement; `sql.md` says how to get a write's plan safely. In PostgreSQL 18 `EXPLAIN ANALYZE` includes buffer counts by default; on older majors ask for `BUFFERS`.
- Estimated against actual rows on every node: an order of magnitude apart is the finding. The usual causes are stale statistics, columns whose values depend on each other (extended statistics capture that), and a predicate the index cannot serve: a function on the column, a cast, a parameter whose type differs from the column's.
- Buffers (shared hit plus read) are the logical reads. Compare them before and after; a timing is evidence only on the same data, parameters and cache state.
- Actual time and rows are per loop; multiply by the loop count before calling a node cheap.
- A sequential scan is not a bug in itself: when the predicate matches much of the table it is the cheaper plan, and an index would not be used.
- A sort or hash that spills to disk points at the memory for that operation, or at an index that already delivers the order.
- The same statement can take different plans for different parameter values when the data is skewed; test with the values that are slow.
- Hints and planner switches (disabling one scan type for a session, for example) show whether the other plan is really cheaper. They are diagnostics; the cause they reveal is what gets fixed.
- MySQL: `EXPLAIN ANALYZE` also executes the statement, and `EXPLAIN FORMAT=TREE` shows the plan without running it. SQLite: `EXPLAIN QUERY PLAN`, with `ANALYZE` storing the statistics the planner reads.

## Locks and deadlocks

- A waiting session shows a lock wait event; `pg_blocking_pids()` names the sessions that block it. Build the lock report on that function, not on a hand-written join over the lock tables. The blocker is often idle in a transaction: an application that opened one and then waited on something else.
- Lock requests queue in arrival order, and a request behind a conflicting one waits for it: a schema change waiting for its lock holds up every statement on that table that arrives after it, which is why `references/change.md` sets a lock timeout before any `ALTER`.
- A deadlock is two transactions each waiting for a lock the other holds, usually because they take the same locks in different orders; the server aborts one of them. The fix is one order, or shorter transactions; a retry loop alone only hides it. MySQL reports the most recent deadlock in `SHOW ENGINE INNODB STATUS`.
- Cancelling or terminating a session is a change on a shared database: read the blocker's statement and its age first, and propose it as COUNCIL.

## Bloat and vacuum

- An update or a delete leaves the old row version behind. Vacuum makes that space reusable but normally does not return it to the operating system; `VACUUM FULL` rewrites the table under an exclusive lock that blocks all reads and writes.
- Dead rows that vacuum does not remove are held by the cleanup horizon: a long transaction or one idle in a transaction, a replication slot, a prepared transaction, a standby that reports its own queries back. Find the holder before tuning vacuum.
- Transaction ID age: read `age(datfrozenxid)` per database and `age(relfrozenxid)` per table against `autovacuum_freeze_max_age`. Past that age autovacuum forces a freezing vacuum on the table; an age that keeps climbing anyway points at the same horizon holders as above. The server stops assigning transaction IDs before wraparound could corrupt data.

## Connections

- A PostgreSQL connection is a server process, and `max_connections` is a ceiling, not a target: the pool size of one instance times the number of instances, plus administrative sessions, stays below it.
- When the instance count is unbounded (serverless, autoscaling), a proxy that multiplexes connections is the fix, not a bigger pool. Transaction-mode pooling does not keep session state between transactions: `SET`, session-level advisory locks, `LISTEN`, SQL-level `PREPARE` and temporary tables that outlive a transaction break under it.
- A pool that fails fast when no connection is free makes exhaustion visible; one that queues forever turns it into slow requests.

## Replication

- On the primary, `pg_stat_replication` reports write, flush and replay lag per standby. On a standby, the time since the last replayed transaction estimates the delay, and overstates it when the primary is idle.
- A replication slot whose consumer has gone keeps the primary's log until the disk fills, unless `max_slot_wal_keep_size` caps it.
- A read that must see a write just made goes to the primary.

## The knowledge base

- Search it with the user's words, untranslated: its entries are written in the words people use when the problem happens. Read only the entries that match; loose matching returns neighbours of the question too.
- Carry its grades through. A base that grades its entries (verified, unreviewed, a pointer only) or its claims (a fact, a rule of thumb with its conditions, a benchmark with its environment, an opinion, something not yet checked) keeps those grades in the answer; an unreviewed entry is quoted with a pointer the user can check.
- When it has nothing, say so, then answer from the documentation or from reasoning, labelled.
- Answering never writes to the knowledge base; adding to it is a separate task under its own rules.
