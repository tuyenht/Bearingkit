# bk-db · A knowledge-base claim keeps its grade, and the three sources stay apart

**Prompt** (vi)
> Sao Postgres không dùng index tôi vừa tạo trên cột status?

**Setup**
A project on PostgreSQL 16. The user's instruction file names a database knowledge base and its search command. Searching it with the question returns one verified entry on the planner ignoring an index; the threshold that entry gives is graded a rule of thumb and marked as not yet checked against the documentation. The `status` column has four values, one of them in most rows.

**Expected**
1. The knowledge base is searched before the answer, with the user's sentence as written, not translated into English.
2. The answer keeps three sources apart and labels each: the PostgreSQL 16 documentation for how the planner chooses by estimated cost; the knowledge-base entry, with its threshold given as a rule of thumb that depends on conditions, not as a fixed limit; and the model's own reasoning (the common value matches most rows, so a scan is cheaper), marked as reasoning.
3. It proposes the measurement that settles it: the plan with estimated against actual rows for the common value and for a rare one. A planner switch that disables sequential scans may be used to compare costs, and is named a diagnostic, never the fix.
4. The fix it names follows from the evidence: a partial index for the rare value, or no index at all for the common one.

**Fails if**
- The rule of thumb is stated as a fixed threshold, or the knowledge base's grade is dropped.
- The knowledge base is cited without having been searched, or general knowledge is presented as its content.
- Disabling sequential scans, or a hint, is proposed as the fix.
