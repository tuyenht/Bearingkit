---
name: bk-review
description: "Review a diff or proposal before push, hunting bugs, hot-path risk and untested claims; judges whether a change is safe to merge. Use when: review, PR, safe to merge, soi diff, rà code, merge được chưa. Not for: committing or pushing, use bk-ship."
context: fork
background: false
---

# bk-review

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say), the project's review checklist in its instruction files (the abbreviated hotlist there is compared against the full list), and `bk-protocol/references/evidence.md`.
- The diff: if none is given, take the diff against the base branch.
- `references/code-review-exchange.md`: what an independent reviewer receives and returns, how feedback is handled.
- `references/review-lenses.md` before the first pass: the passes, the confidence rubric and its anchors, and the list of what is not a finding.
- `references/security-lens.md` whenever the security lens runs (step 5).

## Steps
1. Lenses, in this order: correctness, hot-path risk, untested claims, silent failures (swallowed errors, missing transactions across multi-step mutations, unbounded inputs), type design for any type the change introduces, comments added or changed, smells (named as possible, with the move), a weakened bar (a threshold moved, a test skipped, a new suppression), simplification (delegate to the host's built-in simplifier when one exists, otherwise inline). Each lens reads something different — the project's rules, the diff alone, the history of those lines, what earlier reviews said about them: `references/review-lenses.md`.
2. Score each finding 0–100 against the rubric in `references/review-lenses.md`, and drop it through that file's not-a-finding list before reporting. Report at 80 and above, each with `file:line`, the failure scenario, and the smallest fix. List what was checked and found sound.
3. Hot path touched: the review must come from someone who did not write the change. Dispatch an independent reviewer (a subagent on hosts that have them, a fresh conversation elsewhere) when this conversation wrote the change, when the diff is large (over 400 changed lines or 15 files), or when a hot-path candidate still scores 50–79; otherwise this review is the independent one and the report says so. Record either with `record-guardrail.cjs --review "<files>"`.
4. Apply the sticky-decision rule: a finding that reverses a verified or user-confirmed decision is presented as a question with the trade-off, not applied.
5. The security lens runs when the diff touches a hot path, an entry point or a sink, or when asked; `--security` forces it even when nothing matched. It traces source to sink, refutes each candidate by naming attacker and victim, and scores what survives with the same rubric: `references/security-lens.md`.

## Gates
- No approval without the checked-list. A fix to a reviewed change gets the same review.

## Evidence to paste
- The findings table, the checked list, the review record when a hot path was involved.

## Next step
- bk-ship, or back to bk-build on blocking findings.

Sources: obra/superpowers 5.1.0 (MIT) via references/code-review-exchange.md, anthropics/claude-plugins-official (Apache-2.0) via references/review-lenses.md and references/security-lens.md, and mattpocock/skills (MIT) via references/review-lenses.md; attribution in NOTICE. Ideas only, no text: addyosmani/agent-skills and jeffallan/claude-skills (MIT).
