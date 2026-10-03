---
name: bk-spec
description: "Pin down a request before building: restate, edge cases, assumptions, ACT or COUNCIL, requirements. Use when: new feature, a capability the app lacks (export, login, notifications), add, implement, làm tính năng, thêm chức năng, yêu cầu mới. Not for: bugs, use bk-debug."
---

# bk-spec

## Read first
- The stack profile (run `detect-stack` as bk-protocol's host notes say), the project's instruction files (architecture, conventions, hot paths, "do not" lists), and `bk-protocol/references/gate-patterns.md`.
- Each file the profile lists under `stackFiles`: the stack's rules, which shape the edge cases and the requirements.
- The code the request touches: find the touchpoints and cite them as `file:line`.
- `references/brainstorming.md` when the ask needs questions, a design, or a spec file.
- `references/domain-language.md` when the request uses a word the project already defines, a word that could mean two things, or states how something works.
- `references/module-design.md` when the design adds a module or moves where one ends.
- `references/prototyping.md` when a design question cannot be settled on paper.

## Steps
0. Look for the thing already built, or already tried and dropped, before specifying it: name it with `file:line`, or say that none was found.
1. Restate the request in one paragraph in the user's words plus the technical reading. If the two differ, say where. Where a word of the request means something else in the project's glossary or code, say so.
2. List at least three edge cases with how each is handled (empty input, concurrency, permissions, failure of a dependency, the existing data).
3. List assumptions, each with a confidence (high, medium, low). A fact is looked up, not assumed or asked. A low-confidence assumption about a technology triggers a documentation check before anything else.
4. Classify with the gate patterns: ACT or COUNCIL, and whether a hot path is touched.
5. COUNCIL: fill `bk-protocol/references/rba-lite.md`, present the options, and stop for the decision. ACT: write the requirements as acceptance criteria that a test can check, and one line of what is out of scope. Only where an answer would change the work, questions for the user go in one round of at most four, numbered, each with a recommended answer (`brainstorming.md`); when nobody can answer, they go into the spec as open questions with their recommendations.

## Gates
- An RBA that fails a fail condition goes back for completion; it is never waved through.
- Requirements without an acceptance criterion are not requirements yet.

## Evidence to paste
- The touchpoint list with `file:line`, the classification with the pattern that decided it, the RBA when COUNCIL.

## Next step
- bk-plan when COUNCIL or more than three files; bk-build when ACT and at most three files; bk-audit when the request is really an investigation.

Sources: obra/superpowers 5.1.0 (MIT) via references/brainstorming.md; mattpocock/skills (MIT) via references/brainstorming.md, domain-language.md, module-design.md, prototyping.md; attribution in NOTICE.
