---
name: bk-audit
description: Council investigation with one verdict and rejected options; lenses chosen by context. Use when: audit, evaluate options, should we, rà soát, đánh giá phương án, có nên. Not for: reviewing a diff, use bk-review.
context: fork
background: false
---

# bk-audit

## Read first
- The `[bearingkit]` stack block, the project's instruction files, and `bk-protocol/references/council.md`.
- The material under audit: code, a design, a document, or a decision, with its current evidence.

## Steps
1. State the question in one line and pick the lenses the question needs, no more: risk prediction, edge-case decomposition, security, performance, doc-versus-code reconcile, cost.
2. Choose two to four roles that bear on the question. Each states one option with its cost and risk.
3. Debate only the conflicts. Verify disputed facts in the repository before arguing about them.
4. Deliver one verdict, the rejected options with reasons, and a priority matrix (impact × effort).
5. For a doc-versus-code audit, use the reconcile format: verified, mismatch, gap, decision; label each item ACT or COUNCIL.

## Gates
- Verdicts rest on evidence with `file:line` or command output; an opinion without an anchor is labelled as such.
- A verified decision is reversed only by new evidence (`bk-protocol/references/evidence.md`, rule 6).
- No execution during the audit.

## Evidence to paste
- The council block from the reference format, with the anchors checked.

## Next step
- bk-plan for the accepted verdict; bk-spec when the scope is still unclear.
