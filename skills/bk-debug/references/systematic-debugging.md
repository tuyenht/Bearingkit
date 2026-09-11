# Systematic debugging

Adapted from obra/superpowers 5.1.0 (MIT): `skills/systematic-debugging/SKILL.md`, `root-cause-tracing.md`, `condition-based-waiting.md` and `defense-in-depth.md` in the same folder; attribution in `NOTICE`. The `bk-debug` body holds the five steps and the three-attempt stop; this file holds the technique behind each.

## The rule

No fix before the root-cause investigation is complete. The pressure cases are exactly where guessing is tempting: an emergency, an "obvious" one-liner, a fix that already failed once. Systematic is faster than thrashing.

## Phase 1: root cause

1. Read the whole error and stack trace; note file, line, code. They often name the fix.
2. Reproduce reliably: exact steps, exact command, every time. Not reproducible means gather more data, not guess.
3. Recent changes: diff, commits, new dependencies, config, environment differences.
4. Multi-component systems (workflow to build to signing; API to service to database): before any fix, log what enters and leaves each component and whether configuration propagates; run once; read where it breaks; investigate that component.
5. Trace the data flow: where does the bad value originate, what called this with it, up the chain until the source. Fix at the source, never where the error surfaces (Tracing, below).

## Phase 2: pattern

Find working code that does the same thing in this codebase; read a reference implementation completely, not skimmed; list every difference between working and broken, however small; list the dependencies, settings and assumptions.

## Phase 3: hypothesis

One hypothesis, written: "X is the cause because Y". The smallest change that tests it, one variable at a time. Confirmed: phase 4. Not confirmed: a new hypothesis, never a second fix stacked on the first. Not understood: say so and research; do not pretend.

## Phase 4: fix

1. A failing test that reproduces the bug (the simplest one; a script when there is no framework), before the fix.
2. One change for the root cause. No "while I am here", no bundled refactor.
3. Verify: the test passes, the others still pass, the original symptom is gone.
4. Fix failed: count attempts. Under three, back to phase 1 with the new information. Three or more, stop: this is an architecture question (each fix reveals shared state or coupling somewhere else; fixes need a large refactor; fixes create new symptoms); the kit hands it to bk-audit.

Rationalizations: "quick fix now, investigate later", "just try X", "change several things and run the tests", "skip the test, I checked by hand", "probably X", "one more attempt" after two failures. All of them mean back to phase 1.

Signals from the user that the process was skipped: "is that not happening?", "will it show us that?", "stop guessing", "we're stuck?".

No root cause found after the full process: document what was investigated, handle the environmental or timing cause (retry, timeout, clear error), add logging for the next time. Most "no root cause" cases are an incomplete investigation.

## Tracing to the source

Symptom (a `git init` ran in the source tree). Immediate cause (the call with `cwd: projectDir`). Caller, and its caller, until the value's origin (`projectDir` was an empty string from a test fixture read before setup). When the chain cannot be followed by reading, instrument before the dangerous operation: print the arguments, the working directory, the environment and `new Error().stack`, to stderr in tests (loggers may be suppressed); run and grep. A test that pollutes state is found by running tests one by one until the artifact appears.

## Waiting on conditions, not time

A fixed delay (`sleep`, `setTimeout(fn, 50)`) in a test is a guess that passes on a fast machine and fails in CI. Poll the condition instead: a `waitFor(predicate, description, timeout)` that re-evaluates every ten milliseconds, returns the value when truthy, and throws a descriptive timeout otherwise; the getter is called inside the loop (no stale cache). Events, state, counts, files and compound conditions all fit. A fixed delay is right only when the timing itself is the behavior (a tick interval): wait for the triggering condition first, then the known duration, with a comment saying why.

## Defense in depth

After the source fix, make the bug impossible: validate at the entry point (reject empty or missing values), in the business logic (the operation's own preconditions), with an environment guard (refuse dangerous operations outside the expected context, such as no `git init` outside a temp directory under test), and with debug instrumentation before the dangerous call. Each layer catches what the others miss (other code paths, mocks, platform edge cases); test each by trying to bypass the one above it.
