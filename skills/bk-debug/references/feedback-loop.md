# Feedback loop

Adapted from mattpocock/skills (MIT): `skills/engineering/diagnosing-bugs/SKILL.md`, commit `3cca18b`; attribution in `NOTICE`. Kept: the loop as the first and largest job, its tightening, flaky bugs, minimising, ranked falsifiable hypotheses, tagged logs, the perf branch and the no-correct-seam finding. Not carried: the human-in-the-loop script template and the step that reads the project's `CONTEXT.md` and ADRs. `references/systematic-debugging.md` holds the four phases this loop feeds.

## Build the loop first

A tight pass/fail signal that goes red on this bug, the one the user reported, finds the cause; bisecting, testing hypotheses and instrumenting all consume it. Without one, reading code builds theories, not causes. Ways to build one, in roughly this order:

1. A failing test at whatever seam reaches the bug: unit, integration, end to end.
2. An HTTP call against the running app.
3. A command-line run on a fixture input, diffed against a known-good output.
4. A headless browser script that asserts on the page, the console or the network.
5. A captured request, payload or event log replayed through the code path alone.
6. A throwaway harness: the smallest part of the system that runs the path in one call.
7. A property or fuzz loop, for "sometimes wrong": many random inputs until the failure shows.
8. A bisection harness, when the bug appeared between two known states: `git bisect run` on a script that checks one state.
9. A differential run: the same input through the old and the new version, or two configurations, outputs diffed.

Done when there is one command, already run and shown (secrets redacted), that is red-capable (it drives the real path and asserts the user's exact symptom, not "did not crash"), deterministic, fast (seconds), and runs unattended. When no loop can be built: say so, list what was tried, and ask for an environment that reproduces it, a redacted captured artifact, or leave to add temporary instrumentation. No hypothesis before the loop.

## Tighten it

Faster (cache setup, narrow the scope), sharper (assert the specific symptom), more deterministic (pin the time, seed the random source, isolate the filesystem, freeze the network). A flaky bug is not made clean but made frequent: loop the trigger, run in parallel, add load, narrow the timing window, until the failure rate is high enough to debug against.

## Reproduce, then minimise

Watch the loop go red, and check it is the user's failure and not a nearby one: wrong bug, wrong fix. Then cut inputs, callers, configuration, data and steps one at a time, re-running after each cut, until every remaining element is load-bearing (removing any one turns the loop green). The minimal case narrows the hypotheses and becomes the regression test.

## Hypotheses, ranked

Three to five before testing any: one hypothesis anchors on the first plausible idea. Each states its prediction: "if X is the cause, changing Y makes the bug disappear, changing Z makes it worse"; one that cannot is discarded or sharpened. Show the ranked list when the user is present (they often re-rank it at once), without waiting on an answer. Then test one at a time, each probe tied to one prediction.

## Instrument

A debugger or REPL first; otherwise logs at the boundaries that tell the hypotheses apart, never "log everything and grep". Tag every debug log with one prefix (`[DEBUG-a4f2]`) so cleanup is one grep. Performance regressions: a baseline measurement first (a timing harness, a profiler, a query plan), then bisect; logs rarely help there.

## Fix and lock it

The regression test comes before the fix, at a seam that exercises the real bug pattern as it happens at the call site. A seam too shallow to replay the chain that triggered the bug gives false confidence; when no correct seam exists, that is itself the finding, reported as an architecture question. With a seam: the minimal case as a failing test, seen failing, the fix, seen passing, then the original loop run again on the full scenario.

Before "done": the original loop no longer reproduces; the regression test passes, or the missing seam is written down; every tagged log is removed (grep the prefix); throwaway harnesses are deleted; the hypothesis that held is stated in the report or commit message.
