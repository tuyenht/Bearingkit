---
name: bk-test
description: "Tests as the contract, TDD by default; --browser forces rendered checks for UI. Use when: test, coverage, write tests, viết test, kiểm thử, chạy test. Not for: diagnosing a failure, use bk-debug."
---

# bk-test

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say) (test command, framework majors) and the project's testing conventions in its instruction files.
- `references/tdd.md`: the cycle, the rationalizations, the test anti-patterns.
- `references/coverage-lens.md` when the code already exists and the question is which missing test would have caught a real failure.
- `references/characterization.md` before changing code that has no tests: pin what it does now.

## Steps
1. For each new behavior: write the failing test, run it and show the failure, write the minimal code, run it and show the pass, then refactor with the test green. For existing behavior about to change (a refactor, a rewrite, an upgrade) with no tests on it: pin what the code does now, with literal values on every branch and on both sides of every boundary. These tests pass at once; prove each condition is covered by breaking it on purpose, seeing a test fail, and undoing the change (`references/characterization.md`).
2. Test behavior, not implementation: inputs and observable outputs, error paths, boundaries (empty, maximum, past dates, concurrent access). Over a change that already exists, run the coverage lens: name each gap with the failure it would catch and rank it, and check no existing test covers it already (`references/coverage-lens.md`).
3. Add one negative control per suite: a test that proves the check can fail, so a silent pass is never trusted.
4. UI changes, or `--browser`: open the rendered page, take a screenshot, confirm the assets requested and their sizes; class names in the markup are not evidence.
5. Isolate shared state between tests (singletons, caches, rate limiters, time).

## Gates
- A green run without a red run before it is not evidence for new behavior.
- Skipped or ignored tests are named in the report.

## Evidence to paste
- The runner output for the red and the green run; the screenshot path for rendered checks.

## Next step
- bk-review, or back to bk-build when a test exposed a gap.

Sources: obra/superpowers 5.1.0 (MIT) and mattpocock/skills (MIT) via references/tdd.md, and anthropics/claude-plugins-official (Apache-2.0) via references/coverage-lens.md and references/characterization.md; attribution in NOTICE.
