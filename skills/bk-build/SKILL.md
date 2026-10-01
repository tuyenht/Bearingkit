---
name: bk-build
description: "Execute a plan or a small change that fits in at most three files: scout first, minimal touch, migration safety. Use when: build, implement the plan, do it, làm đi, triển khai, sửa file. Not for: a capability the app lacks yet or unclear requirements, use bk-spec."
---

# bk-build

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say) (guardrail commands, hot paths), the project's instruction files, and the plan phase or the acceptance criteria.
- `references/executing.md` before executing a plan: isolation, subagent-driven execution with the two-stage review, parallel agents.
- `references/major-upgrade.md` when a dependency, framework or runtime moves a major version: whether the tests run on the new version, the delta catalog, the baseline before any edit, the pilot.
- `references/stacks/` — one file per stack, opened in step 1 from the profile's `stackFiles`. `references/stacks/index.md` is the map behind that list and says which stacks have no file yet (six of the eight exist). The profile also lists `sql.md` when the tree holds `.sql` files or a migrations directory, and `shell.md` for shell scripts once that file exists; a change that touches a query, a migration or a schema opens `sql.md` even when the profile does not list it. Each file opens with a version card stating what it was checked against; a major newer than that card goes through the pinned-documentation rule first.

## Steps
1. **Stack rules before anything else.** Run `detect-stack` from the project root, unless its output is already in this session, and open every file it lists under `stackFiles` before reading or editing code; an empty list is said, not skipped.
2. Scout the touchpoints: every file and symbol the change reaches, as a `file:line` list, including callers and readers of anything renamed.
3. Work in the smallest steps that keep the code working: change, run the narrowest check, record. Never rewrite working code to change its style, refactor code the plan didn't name, or "clean up" formatting nobody asked about. An edit orphaning an import, variable, or function gets it removed; pre-existing dead code gets named in the report, not deleted.
4. Tests first for every new behavior (bk-test): a failing test, then the code that makes it pass.
5. Migrations: classify additive or destructive; grep every reader of the affected columns beyond the ORM; write and test the rollback; use a concurrent index where the engine supports it; stop for a human only when the migration is destructive.
6. When delegating on a host with subagents: give each subagent file ownership that does not overlap, a worktree branched from the current HEAD, and the four-state return contract (done, done-with-concerns, blocked, needs-context); never retry the same approach after blocked; after three failures, escalate. Without subagents, execute sequentially.
7. Show the diff against the plan: only the files the plan names are touched, or the difference is explained.

## Gates
- No side effects outside the named files without saying so.
- No abstraction, option, or error handling for a scenario the plan doesn't have; a diff that could be half the size and still meet it is too big.
- A hot-path change is flagged for independent review before push.

## Evidence to paste
- The `stackFiles` list and the files opened, the scout list, the test runs (red then green), the diff summary.

## Next step
- bk-test for the suite, then bk-review; bk-debug on an unexpected failure.

Sources: obra/superpowers 5.1.0 (MIT) via references/executing.md; anthropics/claude-plugins-official (Apache-2.0) `code-modernization` via references/major-upgrade.md; and multica-ai/andrej-karpathy-skills (no license, ideas only: two lines paraphrased into Steps and Gates, no NOTICE entry owed); attribution in NOTICE.
