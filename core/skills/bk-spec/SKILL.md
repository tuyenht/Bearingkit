---
name: bk-spec
description: "Pin down a request before building: restate, edge cases, assumptions, ACT or COUNCIL, requirements. Use when: new feature, a capability the app lacks (export, login, notifications), add, implement, làm tính năng, thêm chức năng, yêu cầu mới. Not for: bugs, use bk-debug."
---

# bk-spec

## Read first
- The `[bearingkit]` stack block, the project's instruction files (architecture, conventions, hot paths, "do not" lists), and `bk-protocol/references/gate-patterns.md`.
- The code the request touches: find the touchpoints and cite them as `file:line`.
- `references/brainstorming.md` when the ask needs questions, a design, or a spec file.

## Steps
1. Restate the request in one paragraph in the user's words plus the technical reading. If the two differ, say where.
2. List at least three edge cases with how each is handled (empty input, concurrency, permissions, failure of a dependency, the existing data).
3. List assumptions, each with a confidence (high, medium, low). A low-confidence assumption about a technology triggers a documentation check before anything else.
4. Classify with the gate patterns: ACT or COUNCIL, and whether a hot path is touched.
5. COUNCIL: fill `bk-protocol/references/rba-lite.md`, present the options, and stop for the decision. ACT: write the requirements as acceptance criteria that a test can check.

## Gates
- An RBA that fails a fail condition goes back for completion; it is never waved through.
- Requirements without an acceptance criterion are not requirements yet.

## Evidence to paste
- The touchpoint list with `file:line`, the classification with the pattern that decided it, the RBA when COUNCIL.

## Next step
- bk-plan when COUNCIL or more than three files; bk-build when ACT and at most three files; bk-audit when the request is really an investigation.
