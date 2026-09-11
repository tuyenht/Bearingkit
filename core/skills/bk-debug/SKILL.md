---
name: bk-debug
description: "Root cause before any fix; four phases; council after three failed attempts. Use when: bug, error, fails, broken, không chạy, lỗi, bị sai. Not for: known-good code review, use bk-review."
---

# bk-debug

## Read first
- The `[bearingkit]` stack block, the project's instruction files, the exact error text, and the last change before the failure (git log).
- `references/systematic-debugging.md`: the four phases, tracing to the source, condition-based waiting, defense in depth.

## Steps
1. Reproduce: the exact command and the exact output, saved. A bug that cannot be reproduced is documented as such, not "fixed".
2. Isolate: bisect by change or by input; use a negative control (a case that must pass) to prove the isolation is real.
3. Root cause: the line and the reason, cited as `file:line`. A symptom fix is not a fix.
4. Fix with a regression test that fails before and passes after; keep the fix minimal.
5. After three failed fix attempts, stop. Hand the evidence to bk-audit; never retry the same approach.

## Gates
- No fix without a reproduction. No "resolved" without the regression test.
- A fix inside a hot path is an independent-review item.

## Evidence to paste
- Reproduction output, the bisect trail, the regression test run (red, then green).

## Next step
- bk-test for the surrounding suite, then bk-review.
