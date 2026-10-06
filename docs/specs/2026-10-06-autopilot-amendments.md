# Autopilot: proposed amendments to the design of 2026-10-06 · 2026-10-06

Status: **proposal, nothing applied, except C, decided by the owner on 2026-10-07.** It changes no file but itself. Each item says who commits it: **owner** (the sections the spec keeps for the owner, the caps, `AGENTS.md`) or **gate** (a later session, through the gate of `docs/specs/2026-10-06-autopilot-design.md` and its advisor question). Where an item is an owner's, a session never commits it. Item numbers are used by the handoff and the log.

Sources: the three points the spec names under change 5; the three points round 6 left open (`docs/autopilot/decisions.md`, entry 5); the advisor's reading of the spec in session 2 (the advisor, Fable, read it once, as entry 7 planned); the result of step 2 below.

## Result of step 2 (the keep-alive check), recorded here and not in the spec

- Run: 2026-10-06, 15:35:40Z to 16:21:04Z, 45 min 24 s, five foreground waits of 9 min each in one session, the owner away. Two detectors: a heartbeat file written every 30 s (largest gap 30.0 s over 95 beats) and the Windows System log, Kernel-Power events 42 and 107 (none inside the window). Positive control: the same query over the previous 48 h finds five sleeps, so the query can see them.
- **The precondition of a meaningful pass failed.** The idle sleep timeout on this machine is 0 (never), on AC and on battery (`powercfg /query SCHEME_CURRENT SUB_SLEEP STANDBYIDLE`). A run of any length therefore cannot show that anything held the machine awake against an idle timeout; it shows only that no sleep happened in 45 minutes of being left alone. The app's keep-awake tool was not available in the session (not found by search), so only one mechanism, the waiting turn, was in play.
- **The five sleeps of the last 48 h are all "Sleep Reason: Application API"** (Kernel-Power 42): a program or the Sleep command asked for them; none came from an idle timeout. They lasted between 24 minutes and 7 h 49 min. Nothing here says which program; the owner may know (a Sleep chosen by hand, a vendor tool, a task). Until the cause is known, the earlier diagnosis that the machine "slept while a background command ran" is not shown to be a keep-awake problem, and a power request cannot be expected to stop an explicit sleep command.
- Stated plainly: step 2 **passed in the letter ("no sleep event inside it") and shows nothing about the keep-alive design**. It is not recorded in the spec as a pass of the design.

## Items

### A. The three things of change 5

**A1. Owner-typed line against a message another agent sends.** Facts: the app lets one session send a user-role message into a running one (`send_message`), so a message's role cannot tell them apart; the spec already says a scheduled, routine or agent-opened session never records a confirmation, which closes most of it; what remains is a line injected into a session the owner opened by hand. **Khuyến nghị: the confirmation of changes 4, 5 and 6 is the owner's own commit** (the owner edits the markers "(waits for confirmation)" and the sentence "Not confirmed yet" in `What this changes`, and commits), instead of a session copying a typed line. It is two or three commits in the life of the project, and nothing in a session can forge it. Trade-off: a little more work for the owner; the session no longer copies anything into that section. Rejected: a session copying the line after checking the session is hand-opened (the check cannot see an injected message); a code word (a session reads it in a file and can be shown it). **Commits: owner.**

**A2. Counters when nobody is present.** Proposed text for the log's rules: every session that writes the lock counts as one session, whoever opened it, and its close line is written even when it made no commit; a session that exits on a fresh lock writes nothing and counts for nothing; a stale lock counts as one session without a commit (as the spec says); the audit counter is the number of such sessions since the last audit session, read from the log lines only. **Commits: gate** (adds a definition; it only makes an audit come earlier).

**A3. The uncommitted change left by a fifth failed round.** The spec says a `PAUSE` is committed alone and the next start stops on an unclean tree; a failed change left in the tree breaks the first and trips the second. **Khuyến nghị: before the `PAUSE` commit, the session commits the failed change to a new branch `autopilot/failed-<date>`, returns to `main`, and commits the `PAUSE` alone.** Nothing is deleted, nothing is merged, the branch is the owner's to keep or delete. Rejected: `git stash` (invisible in the branch list, easy to lose); discarding the change (deletes work); leaving it in the tree. **Commits: owner** (it adds an action no step allows today, creating a branch and committing work that failed review; the advisor question cannot answer yes to it).

### B. The three points round 6 left open

**B1.** Decisions-log entry 3 of round 5 does not say that no `PAUSE` was written (the switch was not yet on `main`). **B2.** The round 4 entry ties the three things to changes 4, 5 and 6; the spec ties them to change 5. **B3.** The spec's "one line" of confirmation becomes "one line per confirmation, at least two (changes 4 and 6 first, change 5 later)", or, with A1 adopted, "one commit of the owner's per confirmation". **Khuyến nghị: B1 and B2 are made by one new log entry that corrects them, not by rewriting the old entries** (the log is a record; an old entry is not edited). B3 is a sentence in an owner-held section: **owner commits** it (with A1 it is replaced by A1's wording). B1 and B2: **gate.**

### C. Does the pilot (step 4) wait for the scheduled-task check (step 3)?

The spec lists step 4 after step 3, and step 3 needs change 5; entry 7 of the log postponed change 5 until the pilot has run well over several sessions. Read to the letter, the pilot can never start. **Khuyến nghị: step 4 needs step 2 and change 6, not step 3; step 3 moves after the pilot.** Rejected: leaving it (a contradiction, so the pilot waits for nothing the owner can supply); asking for change 5 now (entry 7 says not yet). Step 2 has a caveat now (see the result above), but it is not a reason to hold the pilot: the pilot runs with the owner's session open and the turn kept alive as the spec says. **Commits: owner** (it changes what may start and when; the advisor would not be asked to widen it). **Decided by the owner on 2026-10-07** (verbatim in `docs/specs/2026-10-06-autopilot-design.md`, "The owner's confirmation of change 6"): the pilot does not wait for step 3; the spec's Steps now say so, copied in as the owner's word, not as a session's choice.

### D. From the advisor's reading

**D1. A fact-only edit has no path.** The spec's advisor question for an edit ("only adds a stop, review or restriction and widens nothing") cannot be answered yes for an edit that only records a result, such as the result of step 2 or the Status line "steps 2 to 4 not started". Proposed third permitted answer: "records a fact or a result and changes no rule". Because it widens the set of edits that go in without the owner, **owner commits** it.

**D2. Step 2's criterion needs its precondition.** Proposed text for the step: the window is longer than the sleep timeout read beforehand (recorded with it), and the event query is shown to find a past sleep (positive control); with a timeout of 0 the step can only be recorded as "no sleep in N minutes, nothing shown about the keep-alive design", as above. It also adds the second detector (heartbeat file). Only adds conditions: **gate.**

**D3.** Owner-typed against injected: covered by A1.

**D4. The 300,000-token stop.** Entry 7 of the log took it as the working plan; it is a cap and "any change to the caps" is the owner's. Proposed line for `docs/autopilot/state.md`: "Session: stop at about 300,000 tokens of context, read with `get_usage`; the 80% rule above stays the upper bound." **Owner commits** (this session stopped at its own reading of it; see the handoff for the figure).

**D5. The reviewer's brief names its standing files.** The spec fixes what must-fix means but not which files a reviewer reads for contradictions. Proposed: the brief always lists the spec, `AGENTS.md`, the "Luật" block of `docs/handoff/2026-09-26-p3b-node-guard.md` and the newest handoff, and the reviewer says which it read. Only adds a requirement: **gate.**

### E. The shorter Autopilot line for `AGENTS.md`

Checked first: no test or hook reads that line (`tests/`, `hooks/`, `scripts/`, `bin/` mention `AGENTS.md` only in the evals' ancestor-memory check), so the change needs no test change. It keeps, as pointers: read `state.md` first; under `RUN` work inside the repository by the best recommendation behind the gate, decisions logged; a session writes only `PAUSE`; design and scope stay COUNCIL; the owner's instruction in a session wins; changes 4, 5, 6 not in force; everything else is in the spec. It replaces the current line (235 words, counted) with 166 (counted). **Owner commits** (a session cannot commit `AGENTS.md`: entry 4 of the log).

Proposed line, to replace the one beginning "- Autopilot (owner's decision, 2026-10-06":

> - Autopilot (owner's decision, 2026-10-06; the rule is `docs/specs/2026-10-06-autopilot-design.md`, this line only points to it, and that file wins over the Autonomy line above only where its section "What this changes" says so): every session reads `docs/autopilot/state.md` first. Under `RUN`, work inside this repository proceeds by the session's best recommendation without asking, behind that file's quality gate, and every decision the owner used to take is logged in `docs/autopilot/decisions.md`. Under `PAUSE`, or when the switch is missing, unreadable or any word but `RUN`, none of that applies; a session only ever writes `PAUSE`, never `RUN`. A change of the kit's design or scope stays COUNCIL. An instruction the owner gives in a session wins for that session; "without asking" never overrides a stop, wait or ask-first the owner wrote. Changes 4, 5 and 6 of that file are not in force until the owner confirms them as it says. What stays the owner's, and what is never done by rule, is listed in that file and not repeated here.

What it drops from the current line, each held by the spec: the exception for the first `RUN`, the three changes spelled out, and the list of things never done by rule.

## Order, if the owner accepts

1. Owner commits: A1, A3, B3 (or A1 alone), D1, D4, E. (C is decided and applied, by the owner's word of 2026-10-07.)
2. A later session, through the gate: A2, B1/B2 (one log entry), D2, D5; each with a fresh reviewer, and the advisor for the spec edits among them.
3. Only then does anything wait on change 5.
