---
name: bk-close
description: End the session: handoff in two blocks verified against git, live bypasses listed, lessons prompt. Use when: close, wrap up, end session, kết phiên, bàn giao, tổng kết. Not for: mid-task summaries.
---

# bk-close

## Read first
- `git status`, `git log` since the session started, the previous handoff, and `bk-protocol/references/handoff-template.md`.

## Steps
1. Write `docs/handoff/<date>.md` from the template: Block 1 durable knowledge (facts with how they were verified, decisions, rejected options, lesson candidates), Block 2 resume payload (state, decisions waiting, open threads, live bypasses, next work, resume prompt).
2. Verify every Block 2 line against git: uncommitted files are listed as uncommitted, unpushed commits as unpushed. Nothing is described as done that git does not show.
3. List every `TEMPORARY` or `REMOVE` marker in files touched this session, with its expiry or "no expiry".
4. Flag uncommitted edits to the project's instruction files; they are lost with the machine.
5. If the session state shows a guardrail failure after the agent's own change, or a phrase from `bk-protocol/references/correction-cues.md` appeared in the user's turns, ask once whether to append a lessons line to `.claude/lessons.log` (only when that file already exists). Never write a rule unasked.
6. `--docs`: also list documentation that drifted from the code, as proposals, never applied.

## Gates
- No secrets, credentials or private hostnames in the handoff.
- The handoff is committed before the session ends; a handoff that lives only in chat does not exist.

## Evidence to paste
- The handoff path and the git status after the final commit.

## Next step
- End of session. The next session starts with the resume prompt.
