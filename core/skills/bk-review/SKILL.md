---
name: bk-review
description: "Review a diff or proposal before push, hunting bugs, hot-path risk and untested claims; judges whether a change is safe to merge. Use when: review, PR, safe to merge, soi diff, rà code, merge được chưa. Not for: committing or pushing, use bk-ship."
context: fork
background: false
---

# bk-review

## Read first
- The `[bearingkit]` stack block, the project's review checklist in its instruction files (the abbreviated hotlist there is compared against the full list), and `bk-protocol/references/evidence.md`.
- The diff: if none is given, take the diff against the base branch.

## Steps
1. Lenses, in this order: correctness, hot-path risk, untested claims, silent failures (swallowed errors, missing transactions across multi-step mutations, unbounded inputs), simplification (delegate to the host's built-in simplifier when one exists, otherwise inline).
2. Score each finding 0–100; report those at 80 or above with `file:line`, the failure scenario, and the smallest fix. List what was checked and found sound.
3. Hot path touched: obtain an independent review, a reviewer that did not author the change (a subagent on hosts that have them, a fresh conversation elsewhere), and record it with `record-guardrail.cjs --review "<files>"`.
4. Apply the sticky-decision rule: a finding that reverses a verified or user-confirmed decision is presented as a question with the trade-off, not applied.
5. `--security` forces the security lens even when no hot-path pattern matched.

## Gates
- No approval without the checked-list. A fix to a reviewed change gets the same review.

## Evidence to paste
- The findings table, the checked list, the review record when a hot path was involved.

## Next step
- bk-ship, or back to bk-build on blocking findings.
