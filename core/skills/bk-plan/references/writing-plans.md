# Writing plans

Adapted from obra/superpowers 5.1.0 (MIT): `skills/writing-plans/SKILL.md` and `skills/writing-plans/plan-document-reviewer-prompt.md`; attribution in `NOTICE`. The kit's plan folder (`plans/<yymmdd-hhmm>-<slug>/`, `plan.md` plus phase files) replaces the source's single file; the task rules below apply inside each phase file.

## Who the plan is for

An engineer with no context of this codebase, skilled but new to the toolset and the domain, and not to be trusted with test design. Everything they need is in the plan: which files, what code, how to test, what to read. DRY, YAGNI, TDD, frequent commits.

## Scope check

A spec covering several independent subsystems becomes several plans, one per subsystem, each producing working, tested software on its own. Say so instead of writing one plan that spans them.

## File structure first

Before tasks, list every file to create or modify and what each is responsible for; this is where decomposition is locked in.

- One clear responsibility per file, a defined interface; files that change together live together; split by responsibility, not by technical layer.
- Smaller focused files: the model reasons best about what it can hold in context at once.
- In existing code follow the established layout. A large file is not restructured unilaterally; a file the plan modifies and that has grown unwieldy may get a split as part of the plan.

## Task granularity

One step is one action of two to five minutes:

1. Write the failing test.
2. Run it and confirm it fails for the expected reason.
3. Write the minimal code.
4. Run the tests and confirm they pass.
5. Commit.

Each task names its files with exact paths (create; modify with the line range; test), shows the code for every code step, gives the exact command with its expected output, and ends with the commit command. Checkbox syntax (`- [ ]`) per step so execution can be tracked.

## No placeholders

These are plan failures, never written: "TBD", "TODO", "implement later", "add appropriate error handling", "add validation", "handle edge cases", "write tests for the above" without the test code, "similar to task N" (repeat the code; tasks are read out of order), a step that says what without showing how, a reference to a type or function no task defines.

## Self-review against the spec

Run by the author, fixed inline, no second round:

1. Coverage: every spec requirement points at a task; a requirement without one gets a task added.
2. Placeholder scan for the list above.
3. Consistency: names, signatures and types used in later tasks match the earlier task that defined them (`clearLayers()` in task 3 and `clearFullLayers()` in task 7 is a bug).

The `bk-plan` body adds the three to eight validation questions and the evidence line per step.

## Execution handoff

Offer the two ways to execute and record the choice in `plan.md`: subagent-driven (a fresh subagent per task with the two-stage review, on hosts with subagents) or inline (this session, checkpoints between phases). Both are in `bk-build/references/executing.md`.

## Independent plan review (when a reviewer is dispatched)

Give the plan path and the spec path, never the conversation. It checks completeness, spec alignment (no scope creep), task decomposition and buildability (could an engineer follow it without getting stuck), and flags only what would make an implementer build the wrong thing or stall. Output: status, issues as `[task, step]: issue, why`, recommendations separately.
