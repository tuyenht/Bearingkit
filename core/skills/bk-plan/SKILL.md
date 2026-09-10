---
name: bk-plan
description: Write a phased plan with exit criteria and evidence per phase; resolve the active plan. Use when: plan this, break it down, lập kế hoạch, chia bước. Not for: small ACT changes, use bk-build.
---

# bk-plan

## Read first
- The `[bearingkit]` stack block, the project's instruction files, the spec or audit verdict this plan implements.
- The active plan, if any: session state, then the branch name against `plans/` and `docs/plans/`; if neither resolves, ask which plan.

## Steps
1. Create `plans/<yymmdd-hhmm>-<slug>/` (or the folder the project's instruction file names) with `plan.md` of at most eighty lines: goal, phases with status, key dependencies, links to the phase files.
2. Write one `phase-NN-<slug>.md` per phase: context links, requirements, files to create and modify, numbered steps, the evidence each step must produce, exit criteria, risks.
3. Every step names the check that proves it: a test command, a rendered check, a diff shown to the user.
4. Ask three to eight validation questions about assumptions, risks, trade-offs and architecture, and record the answers in the plan.
5. Mark which phases are ACT and which contain COUNCIL points.

## Gates
- No step without its evidence line. No placeholder text.
- A plan that touches a hot path names the independent review as a step.

## Evidence to paste
- The plan tree and the validation questions with their answers.

## Next step
- bk-build on phase 1.
