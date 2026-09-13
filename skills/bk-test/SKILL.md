---
name: bk-test
description: "Tests as the contract, TDD by default; --browser forces rendered checks for UI. Use when: test, coverage, write tests, viết test, kiểm thử, chạy test. Not for: diagnosing a failure, use bk-debug."
---

# bk-test

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say) (test command, framework majors) and the project's testing conventions in its instruction files.
- `references/tdd.md`: the cycle, the rationalizations, the test anti-patterns.

## Steps
1. For each behavior: write the failing test, run it and show the failure, write the minimal code, run it and show the pass, then refactor with the test green.
2. Test behavior, not implementation: inputs and observable outputs, error paths, boundaries (empty, maximum, past dates, concurrent access).
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

Sources: obra/superpowers 5.1.0 (MIT) via references/tdd.md; attribution in NOTICE.
