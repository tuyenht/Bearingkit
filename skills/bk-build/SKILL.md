---
name: bk-build
description: "Execute a plan or a small change that fits in at most three files: scout first, minimal touch, migration safety. Use when: build, implement the plan, do it, làm đi, triển khai, sửa file. Not for: a capability the app lacks yet or unclear requirements, use bk-spec."
---

# bk-build

## Read first
- The `[bearingkit]` stack block (guardrail commands, hot paths), the project's instruction files, and the plan phase or the acceptance criteria.
- `references/executing.md` before executing a plan: isolation, subagent-driven execution with the two-stage review, parallel agents.

## Steps
1. Scout the touchpoints first: every file and symbol the change reaches, as a `file:line` list, including callers and readers of anything renamed.
2. Work in the smallest steps that keep the code working: change, run the narrowest check, record. Never rewrite working code to change its style.
3. Tests first for every new behavior (bk-test): a failing test, then the code that makes it pass.
4. Migrations: classify additive or destructive; grep every reader of the affected columns beyond the ORM; write and test the rollback; use a concurrent index where the engine supports it; stop for a human only when the migration is destructive.
5. When delegating on a host with subagents: give each subagent file ownership that does not overlap, a worktree branched from the current HEAD, and the four-state return contract (done, done-with-concerns, blocked, needs-context); never retry the same approach after blocked; after three failures, escalate. Without subagents, execute sequentially.
6. Show the diff against the plan: only the files the plan names are touched, or the difference is explained.

## Gates
- No side effects outside the named files without saying so.
- A hot-path change is flagged for independent review before push.

## Evidence to paste
- The scout list, the test runs (red then green), the diff summary.

## Next step
- bk-test for the suite, then bk-review; bk-debug on an unexpected failure.
