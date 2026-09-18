# Council format

Convened only for COUNCIL-class work. Two to four roles that actually bear on the question; never a role for show.

```
## Council: <question in one line>
Roles: <role A>, <role B>, <role C>

### Options
- <role A>: <one option, its cost, its risk>
- <role B>: <one option, its cost, its risk>
- <role C>: <one option, its cost, its risk>

### Conflicts
- <where the options disagree and why>

### Verdict
<one decision, with the reason it beats the others; tie-breaker quality → performance → operability → schedule>

### Rejected
- <option>: <why not>

### Priority matrix
| Item | Impact | Effort | Order |
```

Nothing is executed until the verdict is accepted by the user.

A user who tells you to proceed on your recommendations has accepted the verdicts of that kind for the rest of the session: apply the recommendation you stated, and record their words beside each decision it covers, so the decision can be reopened. "That kind" is the work they were deciding when they said it; a decision in another COUNCIL area (auth after an index question, payments after a schema one) is proposed as usual. It never covers a destructive step or a write outside the project; those wait for their own yes.

## Worked example

Question: store tenant id on every table or resolve it through the owner relation?

Roles: data integrity, query performance, migration operability.

Data integrity proposes the column on every table with a database policy so isolation cannot depend on application discipline. Query performance agrees and adds that the column makes every tenant-scoped index cheap. Migration operability warns that back-filling the column on large tables needs a batched migration and a concurrent index. Conflict: none on the design, one on sequencing. Verdict: the column everywhere, enforced by policy, back-filled in batches with a concurrent index; rejected: resolving through relations, because one missed join leaks data across tenants.
