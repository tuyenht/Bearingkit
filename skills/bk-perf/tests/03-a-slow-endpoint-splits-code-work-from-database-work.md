# bk-perf · A slow endpoint splits its own work from the database's, and a neutral change is reverted

**Prompt** (en)
> The invoices API got slow as customers added more invoices. Speed it up.

**Setup**
A web application whose invoices route loads the invoices, then, inside a loop, loads each invoice's customer. A local database with a realistic data volume and a load tool are available; no production telemetry is available to the session.

**Expected**
1. The request's time is split into its parts (queries, own compute, calls out) before any change; the absence of production percentiles is said, not estimated.
2. The per-invoice customer lookup is identified as an N+1 from the measurement, and fixed by collecting the ids, fetching once and building a lookup; the endpoint is measured again the same way.
3. A query whose plan is slow, an index, or the connection pool is handed to bk-db with the measurement that pointed there, not changed here.
4. A second change whose result sits inside the noise is reverted and recorded in the ledger with its numbers.
5. Any load test runs against the local target with its kind named (load, stress, spike or soak) and its thresholds in the script.

**Fails if**
- An index is added, or a migration written, from this skill.
- A cache is added without naming its key inputs and invalidation, or shares a per-user response.
- A load test is pointed at production or a shared staging without a council.
