# bk-plan · Every step names the check that proves it

**Prompt** (en)
> Plan the CSV export work for the invoices page.

**Setup**
A spec produced by bk-spec for that feature.

**Expected**
1. A folder plans/<yymmdd-hhmm>-<slug>/ is created, with plan.md of at most eighty lines and one phase-NN file per phase.
2. Every step names its evidence: a test command, a rendered check, or a diff shown to the user.
3. The validation questions about assumptions, risks, trade-offs and architecture come in one round of at most four, numbered, each with a recommended answer; a further one is recorded as an assumption with its default; the answers are recorded in the plan.
4. Each phase is marked ACT or COUNCIL.

**Fails if**
- Any step has no evidence line.
- The plan contains placeholder text: TBD, TODO, or add appropriate error handling.
