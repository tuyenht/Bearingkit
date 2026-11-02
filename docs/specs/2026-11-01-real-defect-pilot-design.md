# Pilot: measurement points taken from defects seen in real work · design proposal · 2026-11-01

Status: **MERGED into `main` on 2026-11-02, on the owner's label of `docs/autopilot/decisions.md` entry 90, after the audit of entry 91; nothing here is built or run.** The owner's labels on the open choices are recorded in entry 89: choice 1, "Tới Giai đoạn 3 (Recommended)", recorded only, no stage started; choice 6, "Bắt đầu ghi (Recommended)"; choices 2, 3, 4, 5 and 7, "Theo đề xuất cả năm (Recommended)". The text below is the reviewed text of 2026-11-01. No fixture exists, no measured session ran, and no bar below is registered. Every stage needs its own naming word from the owner (section "Stages"). Written on the owner's label "Viết spec, chưa đo (Recommended)" (`docs/autopilot/decisions.md` entry 86), which covers this text only (that label gave no merge; the merge rests on entry 90), no change to `skills/` or `scripts/`, no measurement. It is a change of design, so it stays COUNCIL.

No line here says the kit beats a source. Costs and durations are labelled "chưa đo" where no session measured them.

## The question

The kit's rule compares a skill with its sources on outcome and tokens (`AGENTS.md`, Conventions). The benchmark's hazards were mostly chosen by the kit's author (`docs/specs/2026-11-01-floor-failure-map.md:27-29`), and on Sonnet the four review tasks and `debug-01`'s root fix gave the branches no room to differ (benchmark spec lines 114, 155, 447). The pilot asks two things:

1. Do defects that really happened give points where a session with no plugin fails?
2. On those points, do the kit and its source skills differ, on the same task, model and host?

The first question is cheap and comes first. If its answer is no, the second is not run.

## Three corrections to what this pilot was given

Checked 2026-11-01 by command in this worktree.

**The lesson record exists; it is fed by nobody and read by nobody.** The map says no handoff has a lesson-candidates section (`:37-38`, "0 hits"), and the brief for this spec repeats it. That search matches only the literal words: `grep -il 'lesson candidates\|lesson-candidates'` gives 0. The heading the template prescribes is `### Lessons (candidate lines for the lessons log)` (`skills/bk-protocol/references/handoff-template.md:22`, and `skills/bk-close/SKILL.md:12` asks for it):

| Measured over `docs/handoff/` (86 files) | Count |
|---|---|
| Files with a heading that starts "Lessons" | 46, the newest `2026-10-06-p5b-run-result.md` |
| `RULE |` lines | 135, the newest in `2026-10-26-p6-scorer.md` |
| Handoffs after that one with any such line | 0 of 12 |

So the real gap has three parts. The feed stopped on 2026-10-26. Nothing reads the lines: `.claude/lessons.log` is not in this tree, and `bk-close` appends to it only if it already exists (`skills/bk-close/SKILL.md:16`). And the lines are rules about how sessions work (the largest scopes are `measurement` 15, `shell` 6, `harness` 4, `evidence` 4), not defects in delivered work. The map is not edited on this branch; the correction is listed under "Open choices".

**Four of the map's "not yet measured" lessons already have points.** L1 is `close-01` G2, which the map itself lists with the floor at 0 of 3. L4 is `review-01` D1, `review-02` H1 and H2, `review-04` D1 and D2. The transaction half of L18 is `review-04` D3. L19 is `debug-01`'s `regression` and seen-red-first. Their floors found the review ones on Sonnet. Left unmeasured from section 18: L2, L3, L9, L10, and the past-time and test-state halves of L18.

**Section 18 is not a neutral source.** Those lessons were inputs to the kit's text: `skills/bk-db/references/change.md:33` cites L18, `skills/bk-ops/references/change.md:13` cites L2 and L10, and the "Capability" column of the v1 table names what each lesson added. A point built from such a lesson hands the kit its own answer, which is the fault the map names, one step removed. Defects that happened while the kit was already in use do not have this bias. If anything they lean against it.

## What may become a point

Each candidate carries one of three grades, and the grade travels with every number:

| Grade | What it is | What it can support |
|---|---|---|
| **Replayed** | a defect in this repository's own code: the real code at the commit that introduced it, with kit names removed, and the real fix to check against | a comparison with the sources |
| **Unplanted** | a real defect nobody planted, inside code written for a benchmark | a comparison with the sources, read as not quite real work |
| **Rebuilt** | a one-line lesson of v1 section 18, with the code written anew, because the owner's production SaaS stays out of scope (`AGENTS.md`) and only the anonymized line exists | room on the floor; a lead for the kit is reported as "the kit's text was written from this lesson" and carries no claim |

A candidate must have all of these:
- an anchor: a commit, a log entry or a line of section 18;
- a check that runs offline, with no timing in it (`tests/bench-py-01.test.cjs` goes red erratically at `:122` and `:137`, handoff `2026-11-01-parallel-sessions.md:37`);
- no new software installed for it;
- no floor result on `claude-sonnet-5-5` with the host of the run.

**Chosen before reading the skill.** Candidates are picked from the defect record without opening the skill under test, and the choice is recorded with every candidate left out and why. Afterwards a reader outside the choice says whether the kit's or a source's text names the hazard; the answer is reported beside the result and changes nothing.

## Candidates

Six go to the floor, a fixed set so that the share with room means something. None has been run; "room" is unknown for all six.

| Id | Grade | Shape | Skill | Defect | Anchor |
|---|---|---|---|---|---|
| C1 | Replayed | review | `bk-review` | The list of posted findings counts only bulleted lines while the script's own format has none, and a commented line passes for the exclude line. One review that read the file found no defect. | introduced `9268d2e` (`scripts/review-loop.cjs:47`, `:62`), fixed `654385c`; entry 80 (a), (b) |
| C2 | Replayed | work | `bk-build` | A flag that takes no value swallows the word after it, so a command acts on the wrong folder. The same fault appeared three times. | `8db9781` introduced, `207f9ac` fixed, with its comment on the earlier `antigravity.cjs` case; `scripts/evals.cjs:17-19` still has it, entry 80 (d) |
| C3 | Replayed | work | `bk-build` | A command table looked up by plain key treats `constructor` and `toString` as commands: it does nothing and exits 0. | fixed `511027d`, `CHANGELOG.md` "Fixed (code audit, 2026-09-13)" |
| C4 | Unplanted | review | `bk-review` | Paging: the offset is clamped at 10,000 while `nextOffset` keeps growing, so a client loops on one page. The author and an independent review missed it; one floor session of three found it on Sonnet 5. | `review-03` at `6e58937`, benchmark spec line 112 |
| C5 | Rebuilt | work | `bk-build` | Boundary validation misses a time in the past. | L18 |
| C6 | Rebuilt | work | `bk-test` | Test state leaks through a process-wide rate limiter, so tests pass only in one order. | L18 |

C1 also has a **real false finding**. Entry 80's (c) said half of a test guards nothing; it was read, not run, and it does not hold (entry 83). Stage 1 confirms that test stands in the slice; if so, it is the decoy, and it is the first decoy here that a real audit fell for.

Held in reserve, in this order, used only if a candidate fails its controls in Stage 2: L10 (CI step with the wrong package manager), L2 (CI runtime against the real runtime). Left out, each with its reason:
- L3 needs a rendered page, so it depends on browser software in the fixture (chưa đo whether a built-CSS check is a fair stand-in);
- L9 needs a real library whose major is newer than the model's training, which is not established;
- the hook faults of entry 86 are real and strong, but the file lives under `~/.claude` (see "Open choices");
- the three unplanted defects of `review-04`: the floor found them 3 of 3 on the earlier model; an old result may keep a candidate out, but never counts as its floor;
- `review-loop-02/build.cjs:197`: a scorer, already registered with data, and the owner's item.

## From a defect to a task

**Review shape.** The fixture is the branch that carried the defect, against its parent, holding the changed code files of that commit and their tests. Cutting harder would make the defect easier to see than it was. C1's commit changed 39 files: 18 benchmark files, 11 skill texts, 4 documents, 4 tests and 2 scripts. Its fixture is `scripts/review-loop.cjs`, `tests/review-loop.test.cjs` and one page that restates the format in neutral words, not `skills/bk-review/SKILL.md`. The prompt is the benchmark's plain sentence ("Review the changes on branch … before I merge it…"). Real false findings become decoys.

**Work shape.** The fixture is the tree before the defect, and the prompt is the plain request the work answered, taken from the commit and the log, in English, with no word of the hazard in it. The check is the behaviour the real fix pinned, run from outside through the command or function the prompt names, so any correct design passes. The check does not read the answer text; the answer is read only for the false report (section "What is scored"). A commit too large for one session is replayed as one step: C2's `8db9781` is a whole feature, so its fixture holds the parser and the commands with their value-less flags taken out, and the request adds one such flag back.

Building a fixture:
- A fresh repository of one or two commits, outside this repository, with no memory file above it (the runner's check).
- Kit names removed from the code: a K session must not see its own kit as the subject, and no copy of the fix or of this history goes in.
- A reader who is not the author confirms that the prompt does not give the hazard away and that the cut did not remove what made it hard.

**The scoring rule must be able to fail.** Before any session, tests in `tests/` pin all of these:
1. the defect state fails;
2. the real fix passes;
3. a second correct fix, written differently, passes;
4. a tempting wrong fix fails where one exists (as `debug-01`);
5. every condition of the check dies under a mutant (`evals/bench/*/mutants.cjs`, unmutated control green);
6. an independent reader looks for a real defect the author missed: `review-03` and `review-04` both had some.

Rules freeze when the first floor session runs. A later change is reported with the outcome before and after, and is the owner's.

Tasks live at `evals/bench/real-01` onward, under the existing runner: `builder.check` is called after each session (`scripts/bench.cjs:280`), and `--variants` already exists (`:7`). No change to `scripts/` is expected. That is read, not run; a dry run confirms it in Stage 2.

## Running a point on both sides

- **Same task, model, host:** one prompt, one fixture reset before every session, `--model claude-sonnet-5-5` in every call, and one uncounted session per point and per branch it runs, whose `init` names the host for its counted sessions. A session naming another model or host is reported and not counted.
- **K:** the checkout at a commit written into the registration, clean tree. **S:** the skill's source bundle, each plugin at its pinned sha (`upstream/sources.json`): for `bk-review`, the bundle of the benchmark spec line 43; for `bk-test`, the bundle of `test-01`; for `bk-build`, the bundle of `build-01`, whose `task.json` names no S command, so the S command is chosen and written before Stage 3.
- **The floor F** (no plugin) runs only in calibration.
- **Both texts must actually be read.** Asked in plain words, S sessions reached the host's own review rather than a source skill (`review-01`, benchmark spec line 496), and `shell-01-src` read its source in 0 of 8. So the counted variant is `command`: the same sentence behind each branch's own command. A command leaves no `Skill` call, so a sign in the stream that the text loaded is fixed from the uncounted session and each counted session is read for it, as P5c did. A point where either side loads its text in fewer than three quarters of its counted sessions (6 of 8, 12 of 16) reads "not compared".
- **Order and care:** interleaved K, S; one session at a time under the machine lock; on the profile's login, no API key; usage read before each call; no session re-run; a session cut counts as a miss; the Windows System log read after each call for sleep events.

## What is scored

| Score | Review shape | Work shape |
|---|---|---|
| Defects found | each real defect named: the rule in `task.json`, then read by eye | the defect is absent: the check passes on the session's tree |
| False findings | the real decoy flagged; every other claimed defect read as true, arguable or false by one Sonnet reader who sees no branch name | not applicable, there is no finding list. Scored instead: **false report**, the final answer says done or tested while the session's own suite fails or the claimed run is not in the stream |
| Task passed | every defect found, no decoy flagged | check passes, the session's suite passes on its final tree, the asked work is done, no file touched outside the area the prompt names |
| Tokens | total and fresh, per model, compared only between sessions with the same tool count; cost as the host reports it, turns, wall time, on both shapes | same |

**Task passed** is the primary outcome of a point. A disagreement between the script and a reading is reported, never quietly fixed.

## Stages

Each stage starts only on the owner's naming word, and stops for it. A stage that runs sessions is registered first, in a file of its own, through the gate with its second reviewer.

| Stage | What | Sessions | Stops when |
|---|---|---|---|
| 1 | Seed the defect record once (below); confirm the six anchors and the decoy; write the left-out list | 0 | done |
| 2 | Build six fixtures, scorers, tests and mutants; independent reader | 0 | a candidate that fails its controls is swapped for the next in reserve |
| 3 | **Calibration.** One uncounted, then three F, per point | 24 | always, for the owner's word |
| 4 | **Comparison.** On each point with room: one uncounted K, one uncounted S, eight of each counted | 18 per point | always, for the owner's word |
| 5 | **Confirmation.** Only on a point with a lead: one uncounted K, one uncounted S, sixteen of each counted, all new, never pooled with Stage 4 | 34 per point | end of the pilot |

**Room:** a point has room when the floor passes in at most one of three, by the script and confirmed by reading, as `debug-01`'s protocol. Otherwise the point is closed as "no room on this model", which is a result and goes in the record.

**Lead (Stage 4):** the counts of task passed are at least four apart out of eight, in either direction, the rule of `review-02`. Anything closer reads "no clear difference". Four apart is a rule of thumb, not significance: 5 against 1 gives p = 0.119.

**Better (Stage 5):** the kit reads "better than its sources" on one point, one model, one host, only if its count is higher with two-sided Fisher p ≤ 0.05 divided by the number of points in Stage 5, the rule of `review-04`. The other direction is reported against the kit by the same rule. A rebuilt point carries no claim that the kit is better; a result against the kit on one is still reported.

Why a confirmation at all: on `debug-01`, 16 against 9 (p = 0.007) came back as 16 against 13 on new sessions, and `review-02`'s 3 of 3 against 1 of 3 was chance. Why two steps: exact power from `evals/analysis/fisher-power.cjs`, a gap between S and K of 0.1 to 0.7 at eight sessions per side is 0.60, and 0.1 to 0.6 is 0.39, while at sixteen per side 0.1 to 0.6 is 0.79 and 0.3 to 0.8 is 0.74. These are at 0.05; at the bar of Stage 5, 0.05 divided by the number of points, power is lower (chưa tính). Eight per side finds a lead; it does not settle one.

## Size and cost

All of it **chưa đo** for these tasks. The anchors are figures already recorded for other tasks, as the host reports them on the login: not a bill, and no key is used. Sessions draw on the plan's limits.

| Recorded per session, Sonnet only | USD | Seconds |
|---|---|---|
| F | 0.10 (`review-01`, lowest) to 0.58 (`shell-01`, highest) | 22 (`review-02`) to 66 (`review-03`) |
| K and S | 0.15 (`review-01` command, S) to 1.07 (`shell-01`, S, highest) | 39 to 173 (`review-01`) |
| A plain `node-01` session | 0.228 median | 55.5 median |

| Stage | Sessions | Host-reported USD, rough | Machine time, rough |
|---|---|---|---|
| 1, 2 | 0 measured | not estimated: the work of one or two building sessions | not estimated |
| 3 | 24 | 2 to 14 | under one hour |
| 4, three points with room | 54 | 8 to 58 | under one hour to three hours |
| 4, all six | 108 | 16 to 116 | one to five hours |
| 5, per point | 34 | 5 to 36 | up to two hours |

Session limit 900 seconds, so the worst case is far longer than the rough figures. Each answer of a review point also costs one Sonnet reader's time (chưa đo). The weekly limit read 58% on 2026-11-01, resetting 2026-11-04, against the 70% cap of `docs/autopilot/state.md` (until 2026-11-04T02:59:59Z a rising yield line, entry 90); what one session costs of that limit is chưa đo, and Stage 3 reads it before Stage 4 is proposed. **The expected cost of finding out that the idea fails is Stage 3 alone.**

## Recording lesson candidates from now on

Keep the `RULE` lines as they are, for rules about how sessions work. Add one record for defects in delivered work, because that is what this pilot draws on and what the `RULE` lines do not hold.

**One tracked file, `docs/field-defects.md`, one line per defect, added to and never rewritten:**

```
D-<n> | <date> | <where: this repository, or another project in one anonymized sentence> | <what went wrong> | <how it was found, and what missed it> | <anchor: commit, log entry, or "owner's word"> | <candidate | point <id> | not a point: reason>
```

**What puts a line there, so that it does not depend on anyone remembering:**
- a commit whose type is `fix` touching anything outside `docs/`;
- a must-fix in a review round that changes code rather than wording;
- a code fault an audit confirms;
- a false finding a real review made, once checked: it is a decoy candidate;
- a plain sentence from the owner about something that went wrong in real work. For the production SaaS this is the owner's own anonymized sentence, and the kit reads nothing else of it.

**When:** at close. The session lists its `fix` commits, and each gets a line or a stated reason it is not a defect in delivered work (a slip of the session itself goes to a `RULE` line). If there are none, the handoff says "Field defects: none". A session that writes neither fails its close, and the cold-start drill looks for that line.

**How it reaches the kit:** this is a repository routine, so it is one sentence in the close step of the Resume prompt, plus a count in `docs/status.md`. `skills/bk-close` does not change: a skill change gets its own measurement, and it would move the target during the pilot. Whether users of the kit should get this too is a later question for the owner, once the pilot shows the record is worth keeping.

**Seeding, Stage 1, once:** read the 135 `RULE` lines, log entries 1 to 86 and the `fix` commits (39 on `main` since 2026-09-01 touching `scripts`, `hooks` or `bin`, by subject prefix) and write the lines that describe delivered work. Bulk reading by one Sonnet agent, checked by the main session.

## What counts as success or failure

The pilot judges the method, not the kit. A clear "no difference" is a success of the method.

**The pilot succeeds when all of these hold:**
1. at least 2 of the 6 points have room, at least one of them replayed or unplanted;
2. no fixture or check fault is found after its floor run, on any point with room;
3. both sides load their text in at least 6 of 8 on every point of Stage 4;
4. four weeks after the record starts, every `fix` commit on `main` has its line or its stated reason.

**The pilot fails when any of these holds:**
- at most 1 of 6 points has room: it stops after Stage 3, and Stage 4 is not proposed;
- a point with room turns out to have a broken check: that point's data is void, and two voided points end the pilot;
- the record stays empty or unkept at the four-week check, in which case the source of points dries up and nothing should be built on it.

A pilot that stops after Stage 3 is judged on items 1, 2 and 4; item 3 applies only if Stage 4 runs. Anything between the two (one voided point, or room only on rebuilt points) is neither: it is reported as it stands and the next step is the owner's. These thresholds are proposals until the owner labels them. Once labelled they do not move after data.

## How the data could prove the idea wrong

The idea has three claims, and each has a result that would sink it:

| Claim | Wrong if | Then |
|---|---|---|
| Real defects leave room where constructed ones did not | at most 1 of 6 has room (room only on rebuilt points is not a failure: it is reported as it stands, see "What counts as success or failure", and the next step is the owner's) | stop building points this way on Sonnet; the map's list stops being a backlog, and the floor stays the answer for these shapes |
| On such points the kit does better than its sources | every point in Stage 4 reads no clear difference, or a lead vanishes in Stage 5 | the skill's line changes from "not compared" to "compared on real defects: no clear difference", and if K cost more, that cost is the finding |
| The kit does at least as well as its sources here | K is four or more below S on a point in Stage 4, and Stage 5 meets the Fisher bar in that direction | reported against the kit by name, whichever way the other points fall |

Two readings guard the third way of being wrong, which is looking right for a bad reason:
- If the kit's leads all sit on rebuilt points, they measure the kit's own text returned to it, and no claim follows.
- If K and S both pass where F failed and tie with each other, the result is about having any skill, not about the kit.

## Plan of record (RBA)

- **Objective:** give the owner measured points that come from real failures, or a cheap proof that they do not separate the branches.
- **Scope:** this file only. Later stages touch `evals/bench/real-*`, `tests/`, `docs/field-defects.md` and the Resume prompt. Out of scope: the production SaaS, `skills/`, `scripts/`, `~/.claude`, `~/.gemini`.
- **Rollback:** the spec reached `main` by a merge commit; reverting that commit removes it. Later stages add files only, so a revert of their commits undoes them, and result folders are kept as data.
- **Edge cases:**
  1. *A replayed fixture shows kit code to a K session:* kit names are removed, kit text that states a format is rewritten in neutral words, and a reader checks; a remaining trace sends the fixture back in Stage 2.
  2. *The real fix was partial or wrong:* a second correct fix is written in Stage 2, and if the check cannot accept both, the check is rebuilt on the behaviour before the rules freeze.
  3. *The floor's old result conflicts with the new one (C4):* old sessions are never reused: that run was on the earlier model `claude-sonnet-5`.
  4. *The prompt gives the hazard away:* the reader in Stage 2 rejects it.
  5. *A session reaches the fix through the web:* the session permissions name the tools it may use, and any `WebFetch` or `WebSearch` in a stream is reported.
  6. *A limit runs out during a stage:* no new call starts above the caps; the stage resumes or stops by its registration, and sessions are not re-run.
- **Decision:** needs approval, because it changes the benchmark's design.

## Rejected designs

- Copying defects from the production SaaS: out of scope by `AGENTS.md`, and the anonymized lines are all the kit may hold.
- More hazards chosen from the skills' text: the weakness the map names.
- Replaying the symptom, as `debug-01` did: the report points at the place, and the Sonnet floor already fixes the cause.
- Comparing on the owner's live work: the same task never runs on both sides.
- Mining session transcripts by script for defects: unbounded reading, and it finds slips of sessions, not defects in delivered work.
- Sixteen sessions per side from the start: pays for the comparison before knowing a point has room.
- Three sessions per side, with no eight-session step: `review-02` showed that three mislead.
- One pooled score across points: the sources differ per skill, and the owner's rule compares per skill.
- Changing `bk-close` now to require the record: a skill change during the pilot, unmeasured.
- Haiku as the model: it fails more, but it is not the owner's daily model.

## Open choices for the owner

Each is the owner's; the labels given on 2026-11-01 are listed in the status line above (entry 89). The recommendation comes first.

1. **Start, and how far.** Recommended: approve Stages 1 to 3 only. That builds six tests and tries them on an agent with no skills; the pilot then stops and reports how many left room. Alternative: approve the comparison now too, which saves one question and spends before anyone knows it is worth it.
2. **Where defects may come from.** Recommended: this repository and the one-line lessons only. Alternative: name another of your own projects as a source, which brings defects closer to your daily work, and needs your word per project. The production SaaS stays out either way, except for a sentence you write yourself.
3. **The hook's faults.** The faults found in the file-claims hook are the best real defects on the list, because three rounds of review missed them. Using them means reading a file under `~/.claude` and getting back its faulty version, which may no longer exist. Recommended: leave them out of this pilot.
4. **How sessions are asked.** Recommended: by each side's own command, so both texts are surely read. Alternative: also run the plain sentence you would type, which shows whether the skill gets picked up by itself and doubles the sessions of Stage 4.
5. **The numbers.** Recommended, for your label: a test is worth keeping if the agent with no skills passes it at most 1 time in 3; the pilot goes on if at least 2 of the 6 tests are worth keeping, one of them a real defect, replayed from this repository's code or unplanted in a benchmark fixture, rather than rebuilt from a one-line lesson; one side is ahead if it passes at least 4 more times out of 8; a side counts as compared only if its skill text was really loaded in at least 6 of 8 tries. The other numbers in the sections on stages and on success go under the same label.
6. **The defect record.** Recommended: yes to `docs/field-defects.md` and one sentence in the close step, from the next session on, whatever you choose on the pilot, because the record is what the next points come from. Alternative: keep only the `RULE` lines.
7. **The map.** Recommended: let the session that merges this correct `docs/specs/2026-11-01-floor-failure-map.md` (its section "Gap" and the four lessons already measured). The merge of this spec changes only this file; the map is corrected in a commit of its own.
