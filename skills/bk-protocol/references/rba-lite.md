# RBA-lite (reasoning before action)

For COUNCIL-class tasks only. ACT tasks skip it.

```
Objective: <what changes for the user, one sentence>
Scope: <files or modules touched; what is explicitly out of scope>
Rollback: <the exact way back if this is wrong: revert commit, down migration, feature flag>
Edge cases:
  1. <case and how it is handled>
  2. <case and how it is handled>
  3. <case and how it is handled>
Decision: <proceed | needs approval | rejected>, because <reason>
```

## Fail conditions

An RBA is sent back for completion, not accepted, when any of these holds:

- fewer than three edge cases, or an edge case with no handling;
- rollback written as "N/A", "none" or left empty;
- placeholder text anywhere ("TBD", "to be decided", "later");
- a breaking change (API contract, schema, public behavior) with the decision "proceed" and no approval recorded;
- dependencies listed as required but not verified to exist in the project (lockfile or manifest).

An accepted RBA is pasted into the plan or the PR description, never only in chat.
