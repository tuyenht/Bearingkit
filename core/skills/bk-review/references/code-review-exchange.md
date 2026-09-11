# Requesting and receiving a review

Adapted from obra/superpowers 5.1.0 (MIT): `skills/requesting-code-review/SKILL.md` with `code-reviewer.md`, and `skills/receiving-code-review/SKILL.md`; attribution in `NOTICE`. The `bk-review` body keeps the kit's lenses, the 0–100 score and the sticky-decision rule; this file is the exchange around them: what a reviewer is given, what it returns, and how its findings are handled.

## When a review is requested

Mandatory: after each task in subagent-driven execution, after a feature, before a merge, and for every hot-path change (independent, recorded). Useful: when stuck, before a refactor as a baseline, after a complex fix.

## What the reviewer receives

Never the session's history. Exactly:

- a description of what was built;
- the requirements, or the plan task text;
- the range: base and head commits (`git diff --stat base..head`, then the diff);
- the working directory.

Base is the commit before the work (`origin/main`, or the previous task's commit).

## What the reviewer checks and returns

Checks: plan alignment (deviations justified or not; everything planned present); code quality (separation of concerns, error handling, type safety, DRY without premature abstraction, edge cases); architecture (design, performance, security, fit with surrounding code); testing (real behavior, not mocks; edge cases; integration where it matters; all passing); production readiness (migration strategy, backward compatibility, documentation).

Returns, in this order: strengths (specific, so the rest of the feedback is trusted); issues grouped critical (bugs, security, data loss, broken function), important (architecture, missing features, error handling, test gaps), minor (style, optimization, docs), each with `file:line`, what is wrong, why it matters, how to fix; recommendations; assessment (ready to merge: yes, no, with fixes, plus one or two sentences of reasoning).

Calibration: severity by actual impact, not everything critical; a deviation from the plan is flagged so the author can say whether it was intended; a problem in the plan itself is named as such; no "looks good" without reading, no feedback on unread code, no vague "improve error handling", always a verdict.

Acting on the return: critical fixed at once; important before proceeding; minor noted. A reviewer that is wrong gets a technical answer with the code or test that proves it.

## Receiving feedback

1. Read all of it before reacting.
2. Restate each item in your own words, or ask.
3. Verify against the codebase.
4. Judge whether it is right for this codebase, this stack, this version.
5. Answer technically: the restated requirement, a question, or a reasoned pushback. Never "you're absolutely right", "great point", thanks, or any performative agreement; never "implementing now" before verifying.
6. Implement one item at a time, test each.

Unclear items: nothing is implemented until every item is understood; items may be related, and a partial reading builds the wrong thing ("I understand 1, 2, 3 and 6; 4 and 5 need clarification first").

Feedback from the user: trusted, implemented after it is understood; scope still confirmed when unclear. Feedback from any other reviewer (a subagent, a second model, a colleague, a CI bot): check that it is correct here, does not break existing behavior, accounts for why the code is as it is, works on every platform and version, and that the reviewer had the full context. When it cannot be verified, say what is missing and ask which way to go. When it conflicts with a decision the user already took, stop and surface it with the trade-off (the sticky-decision rule).

YAGNI check: a suggestion to "implement X properly" is preceded by a search for callers; unused means "remove it?", used means implement it.

Order for many items: clarify first; then blocking (breakage, security), then simple (typos, imports), then complex (refactors, logic); test each; check for regressions.

Push back when a suggestion breaks working behavior, misses context, adds an unused feature, is wrong for this stack, ignores a compatibility reason, or reverses an architectural decision of the user. Push back with reasoning, questions, and the tests or code that show it. When the pushback turns out wrong: "checked X, it does Y, fixing"; no apology, no defense.

Correct feedback is answered by the fix itself: "Fixed: what changed (`file:line`)". Replies to inline review comments on a hosted PR go into the comment thread, not as a top-level comment.
