# Executing a plan

Adapted from obra/superpowers 5.1.0 (MIT): `skills/executing-plans/SKILL.md`, `skills/subagent-driven-development/SKILL.md` with its three prompt templates, `skills/dispatching-parallel-agents/SKILL.md`, `skills/using-git-worktrees/SKILL.md`; attribution in `NOTICE`. The four-state return contract and the escalation rule are in the `bk-build` body; this file carries the rest.

## Before the first task

1. Read the plan and review it critically. A concern about the plan is raised before starting, not discovered mid-task. A plan with gaps that prevent starting goes back to bk-plan.
2. Isolation: detect it before creating it. Compare the resolved paths of `git rev-parse --git-dir` and `git rev-parse --git-common-dir`; different paths mean an existing linked worktree, unless `git rev-parse --show-superproject-working-tree` prints a path (a submodule, treated as a normal checkout). Already isolated: never nest another worktree.
3. Not isolated: prefer the host's native worktree tool when one exists (a tool or command named after worktrees); `git worktree add <dir>/<branch> -b <branch>` from the current HEAD only as the fallback, under the directory the project names or `.worktrees/`, verified ignored with `git check-ignore -q` first (add it to `.gitignore` and commit when it is not). A permission error from the sandbox means work in place and say so. Never start on the default branch unless the project's instruction file allows it.
4. Setup and baseline: install dependencies from the manifest present, run the test suite once. Failures before any change are reported and the user decides whether to proceed; they are never confused with the change's own failures.

## Inline execution (this session, or a host without subagents)

- One task at a time, steps followed as written, each verification run as specified, the task list updated as it goes.
- Stop and ask only for a blocker (missing dependency, a failing verification a retry does not explain, an instruction that cannot be understood); never to report progress or ask "continue?". Guessing past an unclear instruction is the failure pattern.
- Return to the review step when the plan changes or the approach is wrong.

## Subagent-driven execution (hosts with subagents)

Fresh subagent per task; two reviews after each task; the controller keeps only coordination in its own context.

Per task:

1. Dispatch an implementer with the full task text pasted (never "read the plan"), scene-setting context (where the task fits, dependencies), the working directory, and the invitation to ask questions before starting. Answer questions completely before it proceeds.
2. The implementer implements to the task, tests (TDD when the task says so), commits, self-reviews (completeness, quality, YAGNI, tests verify behavior not mocks, patterns followed), and reports in the four-state contract with files changed and test results. It stops with `blocked` or `needs-context` when the task needs an architectural decision, restructuring the plan did not foresee, or code it cannot understand from what was given; bad work is worse than no work.
3. Spec-compliance review by a second subagent that is told not to trust the report: it reads the code, compares it to the requirements line by line, lists what is missing, what was added without being asked, what was misread, with `file:line`. Issues go back to the same implementer; review again; repeat until compliant.
4. Code-quality review only after compliance passes, with the reviewer inputs and output shape in `bk-review/references/code-review-exchange.md`, the task as the requirements and the commit range as the diff; it also checks one responsibility per file, units testable on their own, the plan's file structure followed, and whether this change created or grew large files. Issues go back; review again.
5. Mark the task done only with both reviews clean.

After the last task: one review of the whole implementation against the plan, then bk-test and bk-review as the chain says.

Model choice by task: mechanical work with a complete spec in one or two files gets the cheapest capable model; multi-file integration a standard one; design, architecture and review the most capable. A blocked implementer is re-dispatched with more context, or a more capable model, or a smaller task, or the plan is fixed; never the same approach again.

Never: two implementers on overlapping files at once; an implementer reading the plan file instead of receiving the text; quality review before compliance review; the controller fixing an implementer's work by hand (context pollution: dispatch a fix); "close enough" on compliance; moving on with an open review issue.

## Parallel agents

For independent problems (different failing test files, separate subsystems, bugs with separate root causes): one agent per problem domain, dispatched together.

- Each prompt: the scope (one file or subsystem), the goal, the constraints ("tests only", "do not change production code"), the error text pasted, the expected return (root cause and what changed). "Do not raise timeouts; find the cause."
- Not for related failures (fixing one may fix the others), exploratory debugging (unknown what is broken), or shared state (same files, same resources).
- On return: read every summary, check that edits do not conflict, run the full suite, spot-check for systematic errors.

## Finishing

Worktree cleanup belongs to `bk-ship/references/finishing.md`: only a worktree the kit created is removed, after the merge is verified, from outside the worktree.
