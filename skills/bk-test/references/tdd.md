# Test-driven development

Adapted from obra/superpowers 5.1.0 (MIT): `skills/test-driven-development/SKILL.md` and `skills/test-driven-development/testing-anti-patterns.md`; and from mattpocock/skills (MIT) `skills/engineering/tdd/SKILL.md` at `3cca18b`: tests at agreed seams, anti-patterns 6 to 8. Attribution in `NOTICE`. Its rule that refactoring leaves the loop is not carried; step 5 below keeps it.

## The rule

No production code without a failing test first. Code written before its test is deleted and rewritten from the test; it is not kept as reference, not adapted while tests are written, not looked at. Exceptions (throwaway prototypes, generated code, configuration) are agreed with the user, not assumed.

## The cycle

1. Red: one minimal test for one behavior, named for the behavior, against real code (mocks only when unavoidable).
2. Run it and read the failure: it fails (does not error), for the expected reason (the feature is missing, not a typo). A test that passes at once tests existing behavior: fix the test, unless pinning existing behavior is the point (`references/characterization.md`). A test that errors is fixed until it fails correctly.
3. Green: the simplest code that passes. No extra options, no refactoring of other code, nothing beyond the test.
4. Run it and read the pass: this test passes, the others still pass, the output is clean (no warnings). A failure means fix the code, not the test.
5. Refactor with everything green: duplication, names, helpers; no new behavior.
6. Next behavior.

Bug fix: the failing test reproduces the bug first; the fix makes it pass; the test stays as the regression guard.

## What makes a test good

| Quality | Yes | No |
|---|---|---|
| Minimal | one thing; an "and" in the name means split | `validates email and domain and whitespace` |
| Clear | the name states the behavior | `test1`, `retry works` |
| Real | exercises the code under test | asserts on what a mock was called with |
| At a seam | goes through the public interface the change agreed on, so a refactor that keeps behavior keeps the test | reaches into private functions or internal state |

## Rationalizations and the answer

| Excuse | Reality |
|---|---|
| too simple to test | simple code breaks; the test takes thirty seconds |
| I will test after | a test that passes at once proves nothing |
| tests after reach the same goal | after answers "what does it do"; first answers "what should it do" |
| already tested by hand | no record, cannot rerun, misses cases under pressure |
| deleting hours of work is wasteful | sunk cost; unverified code is debt |
| keep it as reference | it will be adapted; that is testing after |
| need to explore first | fine; throw the exploration away and start with a test |
| hard to test | the design is unclear; hard to test is hard to use |
| TDD is slower | debugging is slower |
| existing code has no tests | add tests to what is touched |

Red flags: code before test, a test for new behavior that passes immediately, a failure that cannot be explained, "just this once", "this is different because".

## Anti-patterns in tests

1. Testing the mock: an assertion on a mock element or a mock's call count verifies the mock. Test the real component, or do not mock it; assert on what the code does.
2. Test-only methods on production classes (a `destroy()` only tests call): put cleanup in test utilities; a class owns only its own lifecycle.
3. Mocking without understanding: before mocking, name the real method's side effects and whether the test depends on one. Mock the slow or external operation underneath, not the high-level method the test needs. Unsure: run with the real implementation first, then mock the minimum.
4. Incomplete mocks: a mocked response carries every field the real one has, or downstream code fails on the missing field in production only.
5. Tests as an afterthought: "implementation complete, ready for testing" is not complete.
6. Tautological: the expected value is computed the way the code computes it (`expect(add(a, b)).toBe(a + b)`), so the test cannot disagree with the code. Expected values come from an independent source: a known-good literal, a worked example, the spec.
7. Horizontal slicing: all the tests first, then all the code. The tests pin an imagined shape, not behavior. Work in vertical slices: one test, the code for it, then the next.
8. Verifying through a side channel: checking the database, a file or a log instead of the interface the behavior is for. The test breaks on a refactor that changes nothing a caller sees.

Warning signs: mock setup longer than the test; the test breaks when a mock changes; methods only test files call; "mock it to be safe". Integration with real components is often simpler than the mock.

## When stuck

| Problem | Move |
|---|---|
| do not know how to test it | write the wished-for API and the assertion first; ask the user |
| the test is complicated | the design is complicated; simplify the interface |
| must mock everything | the code is coupled; inject dependencies |
| setup is huge | extract helpers; still huge means simplify the design |

## Before claiming done

Every new function has a test that was seen failing for the expected reason; the minimal code made it pass; the suite is green with clean output; tests exercise real code; edge cases and errors are covered. The `bk-test` body adds the negative control and the rendered check for UI.
