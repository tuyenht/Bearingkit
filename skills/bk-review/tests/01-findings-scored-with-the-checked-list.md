# bk-review · Findings are scored, and what was sound is listed

**Prompt** (en)
> Review this diff before I push.

**Setup**
A staged diff carrying at least one real defect.

**Expected**
1. Lenses are applied in order: correctness, hot-path risk, untested claims, silent failures, simplification.
2. Each finding is scored 0-100; those at 80 or above are reported with file:line, the failure scenario, and the smallest fix.
3. A list of what was checked and found sound accompanies the findings.

**Fails if**
- An approval is given with no checked-list.
- Findings are listed with no file:line or no failure scenario.
