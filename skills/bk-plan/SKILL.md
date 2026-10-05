---
name: bk-plan
description: "Write a phased plan with exit criteria and evidence per phase; resolve the active plan. Use when: plan this, break it down, lập kế hoạch, chia bước. Not for: small ACT changes, use bk-build."
---

# bk-plan

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say), the project's instruction files, the spec or audit verdict this plan implements.
- The active plan, if any: session state, then the branch name against `plans/` and `docs/plans/`; if neither resolves, ask which plan.
- `references/writing-plans.md`: task granularity, the no-placeholder list, the self-review against the spec.
- `references/vertical-slices.md`, when the plan has more than one phase or changes something many call sites use: phases as end-to-end slices, blocking edges, expand, migrate, contract.

## Steps
1. Create `plans/<yymmdd-hhmm>-<slug>/` (or the folder the project's instruction file names) with `plan.md` of at most eighty lines: goal, phases with status, key dependencies, links to the phase files.
2. Write one `phase-NN-<slug>.md` per phase. Each phase is a vertical slice: its file opens with what it makes work and the check that demonstrates it, and names the phases that block it, or "none"; then context links, requirements, files to create and modify, numbered steps, the evidence each step must produce, exit criteria, risks. A wide mechanical change is planned as expand, migrate, contract.
3. Every step names the check that proves it: a test command, a rendered check, a diff shown to the user.
4. Put the validation questions about assumptions, risks, trade-offs and architecture in one round of at most four: numbered, each with a recommended answer, one decision to a question. What would be a fifth is recorded in the plan as an assumption with its default. Record the answers in the plan, or "assumed, not confirmed" when nobody can answer.
5. Mark which phases are ACT and which contain COUNCIL points.

## Gates
- No step without its evidence line. No placeholder text.
- A plan that touches a hot path names the independent review as a step.
- A phase that is one layer of the feature is not a phase; a prefactoring phase and the phases of an expand, migrate, contract sequence are the exceptions.

## Evidence to paste
- The plan tree and the validation questions with their answers.

## Next step
- bk-build on the first phase whose blockers are done.

Sources: obra/superpowers 5.1.0 (MIT) via references/writing-plans.md; mattpocock/skills (MIT) via references/vertical-slices.md; attribution in NOTICE.
