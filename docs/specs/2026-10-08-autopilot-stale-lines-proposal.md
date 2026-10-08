# Autopilot: replacement text for two stale lines, for the owner to commit · 2026-10-08

Status: **PROPOSED. Nothing applied; this file changes no file but itself.** Both places are the owner's to commit: the "Status" paragraph of `docs/specs/2026-10-06-autopilot-design.md` records results (the spec's advisor question has no path for a fact-only edit: item D1 of `docs/specs/2026-10-06-autopilot-amendments.md`), and a session never commits `AGENTS.md` (`docs/autopilot/decisions.md`, entry 4). The owner asked for this file in the opening message of session 5 (verbatim in `docs/handoff/2026-10-08-p5c-proposal.md`): "Soạn sẵn chữ thay cho đoạn Status của spec tự lái và dòng 19 của AGENTS.md thành một file đề xuất để tôi commit; không tự commit hai chỗ đó."

Why they are stale (the audit of entry 17 named both): the spec's Status still says "steps 2 to 4 not started", and line 19 of `AGENTS.md` still says changes 4, 5 and 6 are not in force. Change 6 was confirmed on 2026-10-07; step 2 was run on 2026-10-06; step 4 (the pilot) was run on 2026-10-07 and closed by the owner's word. Until the owner commits a replacement the spec wins over line 19, as the owner's opening message of session 5 says.

## 1. The "Status" paragraph of `docs/specs/2026-10-06-autopilot-design.md` (line 3)

Replace the text from "Status:" up to and including "steps 2 to 4 not started.**" with the text below; the rest of the paragraph ("This file governs how sessions work…") stays as it is.

> Status: **APPROVED by the owner on 2026-10-06 as read below; changes 1 to 3 in force; change 6 confirmed by the owner on 2026-10-07 (see "The owner's word"), so in force; changes 4 and 5 wait for the owner's one-line confirmation (see "What this changes"). Steps: step 1 (this file, the switch, the log) built on 2026-10-06; step 2 (the keep-alive check) run on 2026-10-06: no sleep event inside it, which, with the idle sleep timeout of this machine at 0, shows nothing about the keep-alive design (`docs/specs/2026-10-06-autopilot-amendments.md`, "Result of step 2"); step 3 (the scheduled-task check) not started: it needs change 5; step 4 (the pilot, P5b's way on) run on 2026-10-07 and closed by the owner's word, not "with no question asked" as the step describes it: one second freeze (`afa1a46`), a second run, a `PAUSE` on an incident the registration had no rule for, a verdict under the handling the owner afterwards chose by name, the guard, and the merge of the text into `main` on the owner's word and not by rule (`8a74217`); the record is `docs/autopilot/decisions.md`, entries 9 to 18. The audit the step asks for was read inside session 4, in two readings (entries 17 and 18), and not as a session of its own; the owner reads them as the audit owed (entry 19: the counter is 1). The switch has been at `PAUSE` since `4bb6fa2` (2026-10-07).**

## 2. Line 19 of `AGENTS.md` (the line that begins "- Autopilot (owner's decision, 2026-10-06")

**Khuyến nghị: the smallest edit, one sentence replaced, everything else in the line kept.** It only makes the line agree with the spec. The shorter line of item E of the amendments is a wider edit and belongs with the rest of that proposal, which is still waiting; if the owner takes E instead, its sentence "Changes 4, 5 and 6 of that file are not in force until the owner confirms them as it says" needs the same correction, given below.

Replace this sentence of the line:

> Changes 4, 5 and 6 of that file (a merge into `main` by rule; one scheduled task under `~/.claude/scheduled-tasks/`; its decision lines applied to the `plan-01` run of 2026-10-06) are not in force until the owner's one-line confirmation is copied into it; until then all three are the owner's.

with:

> Change 6 of that file (its decision lines applied to the `plan-01` run of 2026-10-06) is in force: the owner confirmed it on 2026-10-07. Changes 4 and 5 (a merge into `main` by rule; one scheduled task under `~/.claude/scheduled-tasks/`) are not in force until the owner's one-line confirmation is copied into it; until then both are the owner's.

For item E's shorter line, the corresponding sentence would read:

> Change 6 of that file is in force (confirmed 2026-10-07); changes 4 and 5 are not until the owner confirms them as it says.

## What this file does not do

It confirms nothing, widens nothing a session may do, and does not touch the caps, the switch, or the sections "What this changes" and "What stays the owner's". The other items of the amendments proposal (A1, A3, B3, D1, D4, E) wait as before.
