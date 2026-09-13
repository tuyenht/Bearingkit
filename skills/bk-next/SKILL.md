---
name: bk-next
description: "Recommend the next step from the real repository state (git, plans, handoff). Use when: what next, where were we, tiếp theo làm gì, đang dở gì. Not for: executing the step, use the skill it names."
---

# bk-next

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say) if present, the project's instruction files, and the newest file in `docs/handoff/`.
- Version control state: current branch, uncommitted changes, the last ten commits.
- The active plan: session state, then the branch name matched against `plans/` and `docs/plans/`, and which phase is still unchecked.

## Steps
1. State where the work is, in three lines: the last completed step with its evidence, what is uncommitted, what the plan says comes next.
2. Compare the plan with reality. A step marked done without evidence in git or in test output is not done; say so.
3. Name exactly one next step and the evidence that would prove it done (test output, rendered check, commit).
4. If that step is COUNCIL-class, say so and stop. Otherwise hand off to the skill that does it.

## Gates
- Never starts the step itself.
- Proposes only from what git and the files show, never from what was intended.

## Evidence to paste
- The commands run and their output: status, log, the plan excerpt used.

## Next step
- The skill named in step 3, or bk-close when the session should end.

Sources: no upstream text vendored (no license mode applies) - body is kit-original, from field lessons (v1 §18) and the owner's earlier tools (v1 §7.1); nothing owed in NOTICE.
