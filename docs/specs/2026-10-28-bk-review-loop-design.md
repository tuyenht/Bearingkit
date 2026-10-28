# bk-review · a review loop that converges · 2026-10-28

Status: BUILT on the branch `feat/review-loop`, measured 2026-10-28 (section "Measured"); not merged into `main`. The owner's request of 2026-10-28 (pasted brief, in this session): make the kit's review loop converge, following the Claude Code team's post "How the Claude Code team does code review" (claude.dev/blog/solving-code-review-at-anthropic, 2026-10-15).

## Why

The post, read 2026-10-28 (fetched once in this session): "When we ran git blame on what the reviewer kept flagging, about 59% of it was code that had been there since the reviewer's first pass." Its four changes: after three rounds the reviewer asks the author to step back and reconsider the approach; diff-only re-review after the first passes; flag the class of bug, so the author fixes every instance; no repeats of findings already posted. Its figure "Review that converges", internal pull requests before and after: pass after one review-and-fix round 65% → 78%, five or more rounds 8.9% → 1.5%, mean reviews to pass 2.08 → 1.32. Those are the post's numbers, on its pull requests; nothing here measures them on the kit.

## What was wrong

- `skills/bk-review/SKILL.md` Gates: "A fix to a reviewed change gets the same review." Every fix triggered a full review again, with no count and no stop.
- `skills/bk-review/references/review-lenses.md` pass 4: "repeating a reviewer's earlier point is cheaper than rediscovering it", which inside one loop is the repeat the post removes.
- Nothing carried the loop's state. bk-review runs in a fork (`context: fork`) and its independent reviewer is a fresh agent, so neither can count rounds or remember what it posted.
- `skills/bk-build/references/executing.md`, adapted from Superpowers: "Issues go back to the same implementer; review again; repeat until compliant" and "Issues go back; review again", uncapped.
- The chain build → test → review did not run by itself. Across the K sessions of `build-01` kept in `evals/results/*bench-build-01*` (64 sessions, nine runs from 2026-09-26 to 2026-10-14), the Invoked column holds `skill:bearingkit:bk-build` and never `bk-review` (count of that column, read 2026-10-28).

## A decision reversed, on new evidence

The bk-review sprint of 2026-09-24 did not take Spartan `gate-review.md`'s three-round cap ("the sticky-decision rule already stops the loop that matters"; `docs/specs/2026-09-24-bk-review-design.md`, "Ideas taken and not taken"). The post is the new evidence: loops that do not involve a user decision still run on (one of its pull requests ran 50+ rounds overnight), and the cap is one of the four changes behind its numbers. The cap is taken now, as an idea: c0x12c/ai-toolkit has no license (`upstream/sources.json`, ideas-only), so no text and no NOTICE entry, like karpathy.

## The source skills, compared as text

| Source (pinned copy under `_build/upstream/`) | Re-review of a fix | Round cap | Repeats | Bug class |
|---|---|---|---|---|
| obra/superpowers `subagent-driven-development` | "Reviewer reviews again", "Don't skip the re-review"; the whole task again | none: "repeat until approved" | not addressed | not addressed |
| superpowers `requesting-code-review`, `receiving-code-review` | not addressed | none | not addressed | not addressed |
| claude-plugins-official `pr-review-toolkit` `review-pr.md` | "Run specific reviews again to verify" | none | not addressed | not addressed |
| claude-plugins-official `code-review` | one pass on a GitHub pull request | – | – | – |
| mattpocock `code-review` | one pass on `git diff <fixed-point>...HEAD` | – | – | – |
| c0x12c/ai-toolkit (Spartan) `gate-review.md` (ideas only) | – | "Max 3 rounds", then escalate to the user | – | – |

So no source the kit ships against has the cap, the fix-diff scope or the no-repeat rule; the measured comparison below is where that shows or does not.

## What goes where

- `scripts/review-loop.cjs` (new) with `tests/review-loop.test.cjs` (15 tests, red first): `start` prints the round, its scope and the findings already posted; refuses a fourth round on the same commit (exit 3) unless `--beyond-cap`; on a tree unchanged since the last round it is that round again, so a retry or a second look spends no round; a snapshot git cannot read sends the round back to the whole change, never to "no change"; the exclude line goes to the common git directory, so a linked worktree ignores the file too. The snapshot is the tree as it stands, untracked files included and the loop file left out, written through a temporary index (neither the index nor the working tree changes); round N's scope is `git diff <snapshot N-1> <snapshot N>`. Negative controls: with the step that drops the loop file from the snapshot disabled, its test goes red; the four tests added after the review (same round, unreadable snapshot, worktree, Windows line endings) were red on the script as it stood before them, and the cap test fails when the cap check stops sparing a retry of the same round (mutations run by the author on uncommitted text, not reproducible from the repository).
- `skills/bk-review/SKILL.md`: Read first runs the script before anything else and takes a later round's diff from it; step 6 drops any finding the file already holds, an independent reviewer's included, records each one reported (`file:line` · bug class · what) and names the other instances of its class; Gates: round 1 full depth, later rounds the printed diff only, checks rerun, never a finding already posted (one still unfixed listed as open with its round); at most 3 rounds on an ordinary change, then stop, report what is open, propose rethinking; a hot path beyond 3 only on the owner's word; a fix to a reviewed hot-path change gets the same independence on the fix diff. Evidence names the round. 32 body lines (27 before), counted as `tests/skills.test.cjs` counts them.
- `skills/bk-review/references/code-review-exchange.md`: in a later round the reviewer receives the fix diff and the findings already posted.
- `skills/bk-review/references/review-lenses.md` pass 4: history across changes stays; within one loop a finding in `.review-loop.md` is never posted again.
- `skills/bk-build/SKILL.md`: a Gate makes the loop part of done, unasked (bk-test, then bk-review; findings fixed in every instance of their class; the fix goes back as the next round until a round blocks nothing or the cap stops it); docs-only or trivial changes skip it and say so. `references/executing.md`: the two per-task review loops review the fix's commits only, at most three rounds; the controller counts them, since each fix there is a commit and a commit resets the file.
- `skills/bk-ship/SKILL.md`: never stages `.review-loop.md`.
- `scripts/antigravity.cjs`: the Antigravity copy carries the script (with `tests/fixtures/fake-kit.cjs` and `tests/antigravity-install.test.cjs`). The copy under `~/.gemini` is stale until `bearingkit antigravity install` runs again, which is the owner's.
- Not changed: `skills/bk-protocol/SKILL.md:62` ("a fix to a reviewed change too", about who reviews a hot-path fix, which the new Gate keeps); the bootstrap sits at 6,485 of 6,500 characters, as `docs/status.md` records it.
- Test cases `skills/bk-review/tests/06` to `09` and `skills/bk-build/tests/04`; benchmark tasks `evals/bench/review-loop-01` to `-03`, their sample answers under `samples/`, and `tests/bench-review-loop.test.cjs` (the samples scored as registered, each fixture read through the script).

## The carrier and the owner's hook

Read on the owner's naming in the brief (the three files only): `~/.claude/hooks/review-loop.py`, the review-loop lines of `~/.codex/AGENTS.md` and `~/.gemini/GEMINI.md`. Kept the same: the path `.review-loop.md` at the repository root; the exclude line, the hook's own `/.review-loop.md` in `.git/info/exclude` (the script adds it when missing, the hook's check then finds it); a new commit starts a fresh loop (the hook deletes the file; the script reads its `Head:` line); findings with `file:line` and a bug class; three rounds. The hook keeps its own count in `.git/review-loop.json`, which only it writes, and counts a turn that ran a skill or subagent whose name holds "review" as one round instead of asking for another, so a bk-review run is not reviewed twice.

The file the script writes:

```
# Review loop

Head: <commit the loop belongs to, or none>
Round: <n>
Snapshot: <tree reviewed in round n>
Base: <tree reviewed in round n-1, from round 2 on>

Findings posted in this loop, one line each: `file:line` · bug class · what. …

## Round 1
- `src/csv.js:4` · unescaped CSV field · … ; the same class in the header row (`src/csv.js:9`)
```

A file another host wrote by hand (no `Head:` or `Snapshot:`) keeps its round and its lines; with no snapshot, the next round falls back to the whole change and says so.

Differences that remain, for the owner: the two counts can disagree when one turn runs several bk-review rounds (the kit counts each run, the hook the turn), in which case the kit's cap comes first; the hook's snapshot is `git stash create`, which leaves untracked files out and tracks them by digest, the kit's is a tree that holds them.

A review of a change already committed (a branch against its base, on a clean tree) sees the same tree each time, so it stays round 1 and spends no round.

Open for the owner: fixes made as commits (a branch under review, per-task commits in `executing.md`) reset the loop at each commit, by the rule the owner's hook and global rules share; the cap then holds only where a controller counts. Whether a loop should survive a commit that only fixes review findings is the owner's call.

## Registered before any session ran

Branches, as `docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md` defines them: K-after, this working tree; K-before, `main` at `fbac337` (a worktree, the three task folders copied in, K only); S, the sources as they ship. S for `review-loop-02` and `-03` is `review-02`'s set (superpowers, code-review, pr-review-toolkit, mattpocock-skills); for `-01` that set with `build-01`'s (code-modernization, andrej-karpathy-skills). Three sessions per branch per task, `natural` prompt, `--model claude-sonnet-5-5`, the isolated profile `_build/profile/claude` (no hooks, empty `CLAUDE.md`, read 2026-10-28). K-before runs apart from K-after and S, so time drift falls on it alone; said with its numbers.

| Task | State | Prompt | Passed when |
|---|---|---|---|
| `review-loop-01` (a) | clean tree at HEAD, no loop file | "In src/paginate.js, add pageCount(total, size)… You have my go-ahead…" | R1: a review (a skill or subagent named review, or a review skill's `SKILL.md` read) after the first edit, read from the stream as the owner's hook would |
| `review-loop-02` (b, c) | round 1 recorded, the fix uncommitted | "I've fixed what the last review found. Review the change again before I commit." | N1 found (the fix quotes a value but does not double a quote inside it), and neither decoy: X1 (a real crash present since round 1, outside the fix diff, raised at all unless the item says it is outside this round or was not reviewed in it; "not introduced by the fix, but real" still counts) or X2 (round 1's open page-count finding posted again as new) |
| `review-loop-03` (d) | rounds 1–3 recorded, the round-3 fix unreviewed, no hot path | the same | CAP (the stop, in the answer: the three-round limit named, and no fourth round or a rethink), K3 (the loop file still at round 3 after the session), and not X3 (the unreviewed fix's first-quote-only `replace` raised as a finding; naming it as unreviewed is not one) |

Optional, reported and not deciding a pass: R2 (a review after the last edit); C-rec (round 2's findings written to the file with `file:line`), C-dup (a hazard: the page-count finding written again under round 2), C-r4 (a hazard: the file moved to round 4). The term rules are in each `task.json`; the sample answers under `evals/bench/review-loop-02/samples/` and `-03/samples/` score as `tests/bench-review-loop.test.cjs` fixes them, including two written to trip loose rules ("CSV quoting uses double quotes, OK" must not find N1; "Round 3 … The owner asked for this" must not find CAP). The rules were tightened after both rounds of the independent review below, before any session; each wording a reviewer showed mis-scored is now a sample. Term rules stay a coarse instrument: every scored answer is kept and read, and a disagreement between the script and a reading is reported, as the benchmark frame says.

What may be said: per task and branch, passes out of three, as counts. On `-02` and `-03` the sources never see the loop file or its protocol, so a difference there says that the kit follows the loop protocol and the sources do not; it is not a claim that the kit reviews better. X1 encodes the post's scope rule, not a quality claim: it is a real bug the loop chooses not to raise in round 2. The quality comparison is the recall guard, and `-01` (whether a review runs at all after a build).

Recall guard: `review-02` (round 1, three planted defects, one decoy), K-before and K-after, three sessions each, same model. If K-after finds at least two fewer planted defects in total than K-before, the change is held.

## Measured

2026-10-28, 08:57Z to about 09:22Z (the runner's log and the results files' times), Claude Code in the isolated profile, `claude-sonnet-5-5`, 31 tools in every session of every run (token totals compare). Commands as registered (`_build/review-loop-runs.sh`, untracked): `bearingkit bench --task <id> --config-dir _build/profile/claude --branches K,S --runs 3 --model claude-sonnet-5-5` from this branch at `f153a17`, and `--branches K` from the worktree of `main` at `fbac337`. Results under `evals/results/2026-10-28-bench-review-loop-0{1,2,3}-natural-claude-sonnet-5-5[-3]` and `…-kbefore`, `…-bench-review-02-…`, untracked. Every answer was read; where the script and the reading disagree, both are given.

**Calibration first.** The first attempt stopped on an expired login; the owner signed the profile in again. The second (`…-review-loop-02-…-2`, K, one run, not counted) answered as the loop asks, and the shared per-item matcher mis-scored it, splitting each bullet from the heading that said it was old ("Still open: `src/csv.js:5`, unescaped fields (from round 1)") or out of scope ("Not checked"). The term rules moved under `rules.terms`, matched per unit by `evals/bench/review-loop-02/score.cjs` (`f153a17`, before any counted session); the rules themselves were not changed.

| Task | K-after (this branch) | S (sources) | K-before (`main`) |
|---|---|---|---|
| `review-loop-01` (a) review after a build, unasked | **3/3** (`bk-build`, then `bk-review`; two of three ran `review-loop.cjs start`) | 0/3 (one edit each, no review; 9–12 s) | 0/3 (test first, no review) |
| `review-loop-02` (b, c) script | 2/3 | 0/3 | 0/3 |
| `review-loop-02` read | **3/3**: N1 named in all three; round 1's page count kept as round 1's ("Still open … not fixed" once, "Deferred" twice), not posted as new; the crash outside the diff not raised as a finding: named as "Outside the diff" once and "outside this diff, so I did not count it as a finding" once, not mentioned in the third | 0/3: N1 3/3, but X1 and X2 raised as findings in all three (a whole-change review, 7–8 findings) | 0/3: N1 3/3 and the page count kept as round 1's, but X1 raised as a new finding in all three ("New, blocking", "New finding (score 90)", "New: empty input crashes (confidence 85)") |
| `review-loop-03` (d) script | 0/3 | 0/3 | 0/3 |
| `review-loop-03` read | stop 3/3 ("I didn't run a fourth review round", "hit its 3-round cap, so no new review pass ran", "Round 4 didn't start"), a rethink proposed 3/3 (a tested CSV encoder instead of patching `cell()`); X3 named 3/3 as still open (once labelled round 2's finding) | stop 0/3 (a full review, 7–8 findings each), X3 3/3 | stop 0/3 (a full review of the whole change each time), X3 3/3 |
| Tokens, median (min–max) on `-01` / `-02` / `-03` | 590,444 (503,417–766,124) / 270,591 / 267,068 | 136,039 / 275,288 / 279,939 | 352,030 / 269,468 / 273,214 |
| Cost USD, median, `-01` / `-02` / `-03` | 0.197 / 0.195 / 0.125 | 0.073 / 0.119 / 0.139 | 0.113 / 0.145 / 0.140 |

Recall guard, `review-02`: K-after found H1, H2 and H3 in 3 of 3, K-before in 3 of 3; nine of nine each, so the change is not held. The script flagged the decoy X1 once for K-after; read, that item is a missing timeout on `fetchFxRates`, not the decoy's tenant-less cache key, so no false finding by reading.

Where the script and the reading part, and why:
- N1 on `-02`: "the inner quote needs doubling" (K-after, session 3) and "`cell()` doesn't double embedded `"`" (S, session 4, under a heading ending in a colon, with no word "quote" in the unit) are N1 by reading; the rule has no "needs doubling" and needs the word.
- CAP on `-03`: "didn't run a fourth review round" has no "not " for the rule's negations; two of K-after's three stops are missed by the script.
- X3 on `-03`, a fault of the fixture, not of the sessions: the unreviewed fix brings back round 2's posted finding (a quote inside a value not doubled), so naming it as still open with its round is what the Gate asks for. The registered premise, "raising it means a fourth round ran", was wrong; the pass rule stands as registered and fails every session. What separates the branches on `-03` is the stop and the scope: K-after checked the open findings and ran no fourth review; S and K-before reviewed the whole change again.

What this says, within the registration: on `-01` the kit ran a review after a build, unasked, in 3 of 3 sessions, against 0 of 3 for the sources and 0 of 3 for the kit before (three sessions each, not a significance test; two-sided Fisher exact p = 0.1 for 3/3 against 0/3). On `-02` the kit follows the loop protocol (round 2 of 3, the fix diff, nothing posted twice) and the sources do not, which they could not without the protocol; on `-03` it stops at the cap and the others do not, by reading, while the registered pass rule scores 0 of 3 everywhere. Not said: that the kit reviews better than its sources (the recall guard shows the same recall as the kit before; the sources did not run `review-02` today), anything about the post's figures on the kit, any host but Claude Code, any model but `claude-sonnet-5-5`. C-rec was false in all K-after sessions on `-02`: each named N1 as round 1's finding still open, not as a new one, so nothing new was written under round 2. The `-01` cost is the price of the review: 2.7 times the sources' median, which ran no review.

Not measured: Antigravity; a hot path past the cap (case 09); a loop whose fixes are commits.

Checked without a session, in `tests/bench-review-loop.test.cjs`: the fixtures build; on `review-loop-02` the script gives round 2 with the scope `src/csv.js`, `src/paginate.js`, `test/csv.test.js` (not `src/export.js`) and hands back both round-1 findings; on `review-loop-03` it exits 3 and the check reads `K3`; the samples score as registered. The fixtures' own tests pass (3 and 4), read by hand.

## Independent review before commit

One round, `bearingkit:bk-reviewer` on Sonnet 5.5, briefed with the diff and the requirements, changing nothing. Verdict "ready to merge: with fixes". At 80 and above, all taken: the exclude line written to a linked worktree's own directory, where git does not read it (reproduced); an unreadable snapshot printed as "no change since the previous round" (reproduced); the loop keyed on HEAD alone, so repeated reviews of an unchanged or committed tree spent rounds and reached the cap (reproduced; now the same round again); N1's rule found by any line saying "double quotes". Below 80, taken: the circular "better than the sources" claim (now limited, above); the sample answers kept only in chat (now files and a test); independent reviewers not handed the posted findings (`code-review-exchange.md`, step 6); CAP's loose terms and X3 flagging an answer that names the unreviewed fix as open (K3 added, X3 `unless`); X1's `empty`/`undefined` pair; CRLF in a hand-edited file; the body-line count. Round 2, a fresh `bearingkit:bk-reviewer` on Sonnet 5.5, on the fixes only and handed round 1's findings: no defect in the script; at 80, taken: X3 failing a correct stop that names the unreviewed fix in other words; N1 both missing a positively worded finding and finding a wrong header-cell claim (now tied to a quote inside a value); below, taken: X1 escaped by labels such as "pre-existing" on a numbered finding, the cap test that a mutation survived, step 6 reading as if an unfixed finding were dropped rather than listed as open, a crash on a git without `--git-common-dir`. Reported as not reproducible from the repository, and said so above: the red-first claims for the script.

Not taken: `review-loop-01` counts edits by the main loop's edit tools only, not edits made through a shell or a subagent (its reviewer put it near 50; the probe's prompt is a one-function edit). The reviewer could not check the hook's format (it was briefed not to read `~/.claude`); the main session read it, above.

## The session's own audit, and a corrected probe of the cap (registered before any of its sessions ran)

On the owner's request to audit the work and act on the recommendations (2026-10-28), two things inside the repository:

- **The script could not run in one session of three.** In `review-loop-01`, K-after session 2 chained the script with other commands, which the host refused ("A variable in this command can't be checked before it runs"), then tried to reach the kit's folder and was blocked ("Claude Code may only access files in the allowed working directories"); it reviewed without the loop file. `bk-review`'s Read first now says to run the script as a command of its own, and, if it still cannot run, to say so and keep `.review-loop.md` by hand in its format. Not measured by itself.
- **`review-loop-04`**, a corrected `review-loop-03`: the same three recorded rounds, the round-3 fix now correct, and the same unreviewed edit also sorting the caller's orders in place (`orders.sort(…)` in `src/export.js`), a class no round posted. Passed when CAP (the -03 terms, plus the three negations the -03 answers used and its rule missed: "didn't run a fourth review round", "no new review pass", "Round 4 didn't start"), K3, and not X4 (the in-place sort raised as a finding; naming it as unreviewed is not one). Samples: the three K-after answers of `-03` (each a stop, scored CAP), one that names the edit as unreviewed, one fourth-round answer (X4). Branches, runs, model and profile as above: K-after from this branch, S, K-before from a worktree of `main` at `fbac337`. `-03` stays as registered and measured.

The change stays on the branch `feat/review-loop`; merging it into `main` is the owner's decision, with the results above.
