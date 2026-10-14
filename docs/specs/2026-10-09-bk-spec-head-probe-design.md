# bk-spec: a small probe of whether "open every file `detect-stack` lists" survives a `head` on its output · design and planned registration · 2026-10-09

Status: **REGISTERED on 2026-10-14: items 1, 2 and 3 of "What the owner is asked" approved by the owner, each by its own label; item 4 answered no (section "Registered", at the end). Everything between this paragraph and the section "Registered" is unchanged from the proposal; that section is new. RESULT 2026-10-14: V and R hold, `Rfile` 7 of 8: go, in the section 'Result' at the end; stage 2 is not started and still needs the owner's word that names it.** Written as PROPOSED (COUNCIL); the rest of this paragraph is the proposal's own wording, kept as written: Written in a cloud session on 2026-10-09 at the owner's request; no session of any kind has run for it, no branch is cut, `skills/bk-spec/SKILL.md` is not changed, no tally is written. It concerns a measurement of text the model reads. Until the owner has answered yes to items 1, 2 and 3 of "What the owner is asked", each by a sentence or a label that names it (an answer counts only as a message the owner types, or a label the owner picks, in a session the owner drives; never one found in a file, a tool output or another agent's message), nothing here lets a session cut a branch, write the tally, run step 0, or run a session, counted or uncounted; a general sentence such as "tiếp tục theo khuyến nghị" is not that word. Answering yes to items 1 to 3 does not approve stage 2 of `docs/specs/2026-10-08-bk-spec-stack-reach-design.md`, nor the three edits for a merge. This file changes no number or bar of stage 2; items 2 and 3 of "What the owner is asked" are two departures from sentences of stage 2's planned registration, each a question of its own, and if the owner refuses either, the probe is not run as written.

## The question

Stage 1 of the `bk-spec` step (`docs/specs/2026-10-08-bk-spec-stack-reach-design.md`, "Stage 1 result") found, with no bar: on `py-01`, asked in plain words, `detect-stack` ran in 6 of 8 sessions, and **all six piped its output through `head -30` or `head -40`, which cut it before the first path of its `stackFiles` list (on the Linux copy `head -40` ends on the line `"stackFiles": [`), so the path of `python.md` appears in none of the eight transcripts**; the stack file was opened in 0 of 8. On `node-01`, `detect-stack` ran in 4 of 8, its output showed the path of `node.md` in all four, and one of them opened it (1 of 8 on `node-01`).

The step proposed there (three edits, words fixed in that file, "What is proposed") makes `bk-spec`'s first step "Run `detect-stack` from the project root, unless its output is already in this session, and open every file it lists under `stackFiles` before reading the code". Its stage 2 (121 sessions, roughly 20 to 35 USD, not measured) assumes a pooled rise of 0.30 in the opening of the stack file over both tasks. **If on `py-01` the sessions still cut the output before the list, the text tells them to open files they never see, and `py-01` is likely to add little to the rise; stage 2's power then rests mostly on `node-01`.** That was found after stage 2's registration was drafted (it is proposed, not approved).

The probe asks one thing, before the owner weighs stage 2: **with the three edits, do `py-01` sessions asked in plain words open `python.md`, despite the habit of cutting `detect-stack`'s output with `head`?** It is a screen for whether stage 2 is worth its sessions, not a comparison: it can stop a stage 2 that would likely miss on `py-01`, and it cannot show that the step helps.

**Where the list sits in the output** (checked in this session, a reading, not a measurement): `node scripts/detect-stack.cjs` run in a copy of `evals/bench/py-01/app` in a Linux scratch directory, with no git (`"vcs": "none"`), prints 46 lines, with `"stackFiles": [` on line 40 and the path of `python.md` on line 41; for `node-01`, 44 lines, the list opening on line 38. On the owner's machine the fixture is a git repository and the path is a Windows one, so the line numbers there were not checked; the stage 1 transcripts, as recorded, show both `head -30` and `head -40` cutting before the list.

## What is proposed

**Text measured**: the K-after text of stage 2, exactly: a branch `bk-spec-reach` cut from `7a461e4` (stage 1's registered commit, and the base stage 2's planned registration names for K-before and K-after) with exactly the three edits of `docs/specs/2026-10-08-bk-spec-stack-reach-design.md` in `skills/bk-spec/SKILL.md`, words as fixed there. Between `7a461e4` and `main` today, nothing under `skills/bk-spec` or in `scripts/detect-stack.cjs` has changed (`git diff 7a461e4 main` over those paths printed nothing in this session); the paths that did change inside the registered set (`skills hooks agents scripts bin .claude-plugin evals/bench evals/fixtures NOTICE upstream`) are the `c-cpp` merge (`c-cpp.md`, `index.md`, one clause of `bk-build/SKILL.md`, the runner's `pathPrepend`, the task `cpp-01`), plus one sentence in `NOTICE` and the homepage and keywords in `.claude-plugin/plugin.json`; outside it, `package.json`, `site/`, the pages workflow, `CHANGELOG.md`, `PROVENANCE.md`, `evals/analysis/cpp-run.cjs` and `cpp-tally.cjs`, three test files, the READMEs and the docs also changed. None of these is read by `bk-spec` or `detect-stack`. The branch is the one stage 2 would use as K-after; cutting it freezes that text at that commit for both the probe and a later stage 2. Nothing of the branch is merged under any outcome of the probe.

**Task**: `py-01` only, variant `natural` (its plain prompt), as it stands at `7a461e4`. Not `node-01`: its failure on stage 1 was of another kind (the path seen, the file not opened), and four sessions a task would read nothing on either.

**Sessions**: one uncounted session, then eight counted K sessions, all with `--model claude-sonnet-5-5`. Nine in all.

**Instrument**: one new read-only tally, `evals/analysis/spec-probe-tally.cjs`, written and tested before any session (definitions fixed below), plus the existing `evals/analysis/skill-loaded.cjs` and each session's `check.json`. No driver: two `bench` calls, as stage 1 used.

**Rejected.**
- **Going straight to stage 2.** The `head` finding came after stage 2 was drafted and bears on its power; nine sessions can say whether `py-01` is likely to add anything before 121 are spent.
- **Four sessions on each of `node-01` and `py-01`.** The question is about the cut output, seen only on `py-01`; at four a task neither count says anything.
- **A K-before arm inside the probe.** Stage 1 measured that text on this task on 2026-10-08 (0 of 8 opened; the path in no transcript); an arm of eight would double the cost and still be eight. The price, said below: no concurrent control.
- **Changing the text now** (a sentence telling the session to read the whole output, or moving `stackFiles` to the top of `detect-stack`'s output, or a flag that prints only the list). Each is another change: the words of stage 2 are fixed, and `detect-stack` feeds every skill. They are the directions named below for a no-go, each needing its own design.
- **A go bar at 3 of 8.** It would stop a true rate of 0.3 (the size of rise stage 2 assumes, from a baseline near zero) in 55% of probes; 2 of 8 stops it in 26% (table below).
- **No uncounted session.** It is the only check of model, host and the changed text's reach before the eight; it costs one session.

## Planned registration (fixed now, before any data; to be approved before any session)

- **Before any session, in this order, each through the gate** (suite run alone on the final text, its result read, then the commit in a separate command; a new Sonnet reviewer for each commit):
  1. The tally and its test, on `main`. The test feeds it hand-written stream lines and `check.json` files covering each definition below, including a `head`-cut output, an output filtered by `grep` that keeps the list, an empty list, and a refused call.
  2. **Step 0, zero sessions, reported with no bar**: the tally run, on the owner's machine, over the K-after sessions (`meta.json` `kit.branch` `p4c-build-reach`) of these folders of `docs/specs/2026-10-01-bk-build-stack-reach-design.md`, and no other: `evals/results/2026-10-01-bench-php-01-natural`, `evals/results/2026-10-01-bench-php-01-natural-2` to `-9` (K-before sessions and S sessions in them are skipped by branch), and `evals/results/2026-10-01-bench-build-01-natural`; a folder whose `meta.json` has no `kit.branch` is named and not read. Their `bk-build` step 1 has the same sentence as the new `bk-spec` step but for "reading or editing code", and they ran on `claude-sonnet-5`, not `claude-sonnet-5-5` (the tally prints each session's model). It prints for each session `Rrun`, `T`, `L` and `Rfile` for that session's own stack file (`python.md` is the tally's stack-file argument; for step 0 it is that session's own file). A folder not on the list is not read; if a listed folder is absent, that is written, and nothing is substituted. Step 0 is read once, its output is written into this file unedited before the uncounted session, and it says only whether sessions entering through `bk-build` also cut the output; **it is not used to choose, change or reorder anything below (bars, threshold, task, branch, text, reading table, what follows each outcome).**
  3. The branch `bk-spec-reach` cut from `7a461e4` with the three edits; `git diff --name-only 7a461e4 bk-spec-reach -- skills hooks agents scripts bin .claude-plugin evals/bench evals/fixtures NOTICE upstream` must print exactly `skills/bk-spec/SKILL.md`; the suite run on the branch; one reviewer of its own, who checks the three edits against the fixed words character by character; pushed. The commit is recorded in this file.
- **The uncounted session**: from a clean checkout of `bk-spec-reach`, `node bin/bearingkit.cjs bench --task py-01 --config-dir C:/Projects/Bearingkit/_build/profile/claude --branches K --variants natural --model claude-sonnet-5-5 --runs 1`, after a `--dry-run` of the same command that must print exactly one session. Its `init` must name `claude-sonnet-5-5`; it must complete (not cut, `"cut":[]` in `meta.json`); and `node evals/analysis/skill-loaded.cjs <folder> --skill bk-spec --marker "Stack rules before anything else"` must read `loaded` = yes. Any of these failing: the probe does not start, the session is not re-run without the owner's word, and the owner is told. Its host (`claude_code_version`) is written into this file through the gate on `main` before the counted call; **every counted session must name that host**. If it is not `2.1.291` (stage 1's host), the probe goes on and its result says that the set-side with stage 1 crosses hosts. This session is in no tally; its `Rfile`, `T`, `L`, `Rdetect` and `Rrun` are printed with no bar, are not read as a result, and do not stop, change or start anything; only its four registered checks (model, completed, `"cut":[]`, `loaded` = yes) and its host decide.
- **The counted call**, once: the same command with `--runs 8`, from a clean checkout of `bk-spec-reach`; before it, the `git diff` check of step 3 prints exactly that one file, `get_usage` is read (no start above 80% of the five-hour window or 70% of the week, the caps of `docs/autopilot/state.md`), the turn is kept alive, and the Windows System log is read after it for a sleep event (Kernel-Power 41, 42 or 107) inside it. `meta.json` must record `kit.branch` `bk-spec-reach`, the recorded commit and `dirty: false`. No session is re-run. Nothing is written to a tracked file between the start of the call and the reading of the tally. The tally is run from the `main` checkout after the call, against the results folder (untracked); switching checkouts after the call is not a write to a tracked file; `skill-loaded.cjs` is run from either.
- **Read per counted session**:
  - from the stream's `init`: model and host;
  - `M` (the changed text reached): `skill-loaded.cjs --skill bk-spec --marker "Stack rules before anything else"` reads yes; "unknown" counts as no. (`bk-build` holds the same sentence; the predicate looks only at the message that carries `bk-spec`.)
  - `Rfile` (the primary): `check.json`'s `Rfile`, the scorer's `reach()`: a Read, Grep, Bash or PowerShell call whose input names `stacks/python.md`;
  - `Rdetect`: `check.json`'s `Rdetect` is `ran`, as the scorer reads it (any shell call whose text contains `detect-stack` and whose result is not a refusal, so a `cat` of the script counts);
  - `Rrun`: some Bash or PowerShell call runs `scripts/detect-stack.cjs` (or `detect-stack.cjs`) as in `T` below, whether or not its output is cut, and its result is not a refusal; the reading table uses `Rrun`, not `Rdetect`;
  - `T` (the output cut): some Bash or PowerShell call whose command, split on `;`, `&&`, `||` and newlines, has a segment that runs `scripts/detect-stack.cjs` (or `detect-stack.cjs`) as the first stage of a pipeline in which a later stage is `head`, `tail`, `sed -n`, `more`, `Select-Object -First`/`-Last`, or `select -First`/`-Last` (alias). A mention of `detect-stack` that does not run it (`cat`, `grep`, `ls`, `Get-Content`) is not `T`. A session is `T` if any such call exists, whatever other calls it made;
  - `L` (the list seen): the text of a tool result of any call (a string or its text blocks), after replacing `\\` with `/`, contains a match of `/"stackFiles"\s*:\s*\[[^\]]*python\.md"/` (the predicate of `evals/analysis/stack-reach-by-entry.cjs`, narrowed to a list that holds `python.md`; it is the first item on the Linux copy, line 41); the tally records whether that call was a `detect-stack` run, and the predicate is the same either way. An output filtered by `grep` that keeps the list counts; a cut output does not. The tally's test covers a compact one-line JSON;
  - `first` (descriptive): for a session with `Rfile`, one of `before-edit` (the first Read, Grep, Bash or PowerShell call naming `stacks/python.md` precedes the first Edit, Write or NotebookEdit call), `after-edit`, or `no-edit` (no such call); a session without `Rfile` is `none`;
  - `content` (descriptive): for a session with `Rfile`, `yes` if some call returned the file's text: a Read whose input is the file, a Grep whose `path` is the file (not one whose pattern mentions it), or a shell command that applies `cat`, `type`, `Get-Content`, `sed`, `head`, `tail`, `grep`, `rg`, `less` or `Select-String` to its path; in each case with a result that is not an error or a refusal. Any other call naming the file (`ls`, `test`, `wc`, a failed Read, a refused call) is `named`; `no` if every call is `named`;
  - O1, O2, Y1, Y2, Y3, X from `check.json`; cost, tokens and duration from the runner; skills launched; refused calls.
- **Cut, not completed, sleep, never started.** A session is cut if `meta.json` lists it in `cut`; it is not completed if its last `result` event is missing, is not `subtype: success`, or has `is_error` other than false (the `completed()` of `evals/analysis/cpp-tally.cjs`). A session whose own run contains a sleep event is one whose interval, from its first stream event to its `result` event (the timestamps the runner records), holds a Kernel-Power event 41, 42 or 107 in the Windows System log, read by the session by hand after the call (the tally does not read the log and cannot flag it; the session passes the names of the sleep-hit sessions to the tally as arguments) (stage 1 named 42 and 107; this file fixes the set at three). A session never started (fewer than eight session streams in the folder) counts as cut, and fails V. A cut, not completed or sleep-hit session is named and counted `M` no, `Rfile` no; its other figures are printed as its stream shows, flagged.

### The bars and what follows each outcome

| Check | Rule | If it fails |
|---|---|---|
| V. validity | every counted `init` names `claude-sonnet-5-5` and the host of the uncounted session; every counted session has an `init` | nothing is judged; the owner decides |
| R. reach of the text | `M` in at least 7 of 8 | **no-go, for reach**: "`M` in N of 8 (no a, unknown u)", and nothing is said of the text's reach beyond that; if u is above 0 the result says the instrument may be at fault; nothing else is read as an answer (stage 2's own bar 4 asks 21 of 24 a task) |
| P. primary | `Rfile` in at least 2 of 8 | **no-go** |

- **V and R hold, `Rfile` at least 2 of 8: go.** The result is written up here and stage 2 is put to the owner; whether the session recommends it is the session's judgement from every figure, and a go does not oblige the recommendation. If `T` is high and `L` is low, the result says the opens did not come through the list. It does not start by rule: stage 2 still needs the owner's word that names it, and its own uncounted session.
- **V and R hold, `Rfile` at most 1 of 8: no-go.** The result says "with the three edits, `py-01` sessions asked in plain words opened `python.md` in N of 8"; the recommendation is not to run stage 2 as written. The session then proposes the one next design that the reading of `T`, `L` and `Rrun` below gives (rows 1 to 3), or, in row 4, none; nothing of the edits' words is changed under this registration.
- **R fails (V holding): no-go**, as in the table, with the same recommendation and every figure given; the reading of `T`, `L` and `Rrun` is printed and proposes nothing.
- Never by rule: changing a bar, the threshold, the task, the model, the definitions or the reading after the data; re-running the probe on this text. At most one probe of this text, ever; a probe whose V fails or whose call is interrupted has been run, and runs again only on the owner's word that names a second probe.

**The reading of `T`, `L` and `Rrun`, fixed now, descriptive** (used only after a no-go with V and R holding, that is `Rfile` at most 1 of 8; after an R failure or a go it is printed and nothing is proposed from it; it is never a finding and decides no bar). Each count is over the eight sessions; a session cut or not completed after its `init` is read from its stream as it stands, with no forcing. High is at least 5 of 8, low at most 2 of 8, otherwise mixed. The rows are tried in order, 1 to 4, and the first that matches is the only one read; `T` and `L` are not exclusive (a session can be both).

| Row | Pattern | Read as | Direction proposed after a no-go |
|---|---|---|---|
| 1 | `Rrun` low | the step does not get `detect-stack` run | a change of the step's words |
| 2 | `T` high, `L` low | the cut still wins: the sessions never see the list | the order of `detect-stack`'s output (`stackFiles` first), or a flag that prints only the list; both touch every skill, so either needs its own design and guard |
| 3 | `L` high (whatever `T`) | the list is seen and not opened: the cut is not the cause | a change of the step's words; `detect-stack` is not the place |
| 4 | any other | mixed | the session says so and proposes nothing until the owner asks |

**What the threshold does, at eight sessions** (binomial, the chance that `Rfile` reaches at least 2 of 8, by the true rate on `py-01` with the edits):

| True rate | 0.02 | 0.05 | 0.10 | 0.20 | 0.30 | 0.40 | 0.50 |
|---|---|---|---|---|---|---|---|
| Go | 0.01 | 0.06 | 0.19 | 0.50 | 0.75 | 0.89 | 0.96 |

So if the true rate with the edits is 0.05 to 0.10, the probe says go about one time in seventeen to one time in five, and at 0.20 one time in two; if it is 0.30 and the text reaches with 0.95, the probe says go with a probability of 0.745 × 0.943 = 0.70, so no-go about three times in ten (one in four from `Rfile`, the rest from `M`; independence assumed); at a true rate of 0.20, go is 0.50 × 0.94 = 0.47. Stage 1's 0 of 8 does not pin the rate without the edits near zero: its one-sided 95% upper bound is about 0.31, so a go can come with no change at all. With a true reach of the text of 0.95, `M` reaches 7 of 8 with a probability of 0.94; at 0.9, 0.81.

- **What may be said after a go, and no wider**: "with the three edits, on `py-01`, asked in plain words, on `claude-sonnet-5-5`, host H, the stack file was opened in N of 8 sessions (stage 1, on 2026-10-08 and without the edits: 0 of 8)", with `T` and `L`. Not: that the edits raised the opening of the file (no concurrent control); anything about `node-01`, another task, model, host or day; anything about the deadline hazard.
- **After a no-go**: never "the step does nothing", and never that stage 2 would fail; only the figures, and that stage 2 is not recommended as written.
- **Reported with no bar**: `T`, `L`, `Rdetect`, `Rrun`, `first`, `content`, O1, O2, every hazard, Y2 set against `Rfile` session by session, skills launched, refused calls, cost and duration (median, minimum to maximum). If O1 is below 7 of 8, the result names the risk to stage 2's bar 3 (O1 at least 21 of 24 a task).
- **The probe's sessions are never pooled** into stage 2 or into stage 1, and a later stage 2 runs on fresh sessions under its own registration.

## Limits, said now

- **No concurrent control.** The only baseline is stage 1, eight sessions on 2026-10-08 on another checkout of the same text; on `node-01` the same text read 4 of 8 on 2026-10-07 and 1 of 8 on 2026-10-08, so day-to-day drift is real and unmeasured.
- Eight sessions: the table above is the whole of what the threshold can tell apart.
- One task, one fixture, one model, one host. `node-01` is not probed; its failure on stage 1 was of another kind.
- `Rfile` counts any call that names the file, including one that fails or comes after the first edit; the order is reported through `first`, with no bar. The tally also prints, with no bar, how many of the `Rfile` sessions opened the content (`content`) against only named it; if the go rests on sessions that only named it, the result says so before stating the count.
- The three edits are measured together, as in stage 2.
- The branch lacks the `c-cpp` merge (`c-cpp.md`, `index.md`, a clause of `bk-build/SKILL.md`, the runner's `pathPrepend`); the probe says nothing of `main` as it stands, and a merge of the three edits would be a different commit from the one measured, to be reviewed for that.
- `T` is read from the command text: a cut done another way (a redirect into a file then a partial read, a shell function) is not seen as a cut; `L` then still says whether the list was seen.
- The line positions of the list were checked only on a Linux copy of the fixture without git, not on the owner's machine.
- The marker's loaded-sign depends on the host version and on transcripts in the untracked measurement profile, as in stage 1.
- The tally does not exist yet; its definitions are fixed here and its test is the only check that it reads them.

## Budget, not measured

Nine sessions. On stage 1, a plain `py-01` session without the edits cost 0.189 USD at the median (0.163 to 0.207) and took 49 seconds (41 to 69); with the edits a session reads more. Roughly 2 USD, not measured; one owner's-machine session of about an hour with the tally, the branch and the reviews (an estimate, not measured).

## What the owner is asked

1. **This probe's registration as written** (py-01 only; 1 uncounted and 8 counted sessions on the branch `bk-spec-reach` cut from `7a461e4` with the three edits; the tally and step 0 first; the go bar at 2 of 8 with the reach bar at 7 of 8): approve it by a sentence or a label that names it, change it, or drop it. Approving it approves the three edits' words for the probe's branch only, not for a merge.
2. **That the probe is not one of stage 2's "at most two runs of this text on these tasks, ever"** (it cannot lead to a merge), and that there is at most one probe of this text, ever. This departs from that sentence of stage 2's planned registration by reading the probe as not one of the two.
3. **That `bk-spec-reach` is cut on the probe's word, which freezes stage 2's K-after text at that commit**, so a later stage 2 runs on that commit unchanged. This departs from stage 2's sentence "The branches are cut only after stage 1's gate holds and the owner's word" (a word naming stage 2): under this probe the branch is cut on the probe's word. Stage 2's own word is still needed for its sessions and for any change of its text.
4. Whether to add `node-01` (eight more sessions, the same bars per task, 17 in all). The session's recommendation: no.

Items 2 and 3 are each put as a question of their own, with their own label; the probe does not start unless the owner has answered items 1, 2 and 3, and if item 2 or 3 is refused, the probe is not run as written.

Khuyến nghị: approve items 1, 2 and 3 as written, each by its own label, `py-01` only; no to item 4. If this session's closing line makes four sessions since the last audit, the next autopilot session is the audit and does nothing else (`docs/specs/2026-10-06-autopilot-design.md`, "The decision log"), and the probe's sessions would come after it; whether that rule binds a session the owner drives under `PAUSE` is the owner's to say.

## Registered (2026-10-14): the owner's labels and the order of the work; no session has run

**The owner's word**, by label, in a session the owner drives (session 9), four questions put at once, each with its own options; questions and labels verbatim:

1. "Mục 1 của phép dò bk-spec: duyệt bản đăng ký như đã viết (chỉ py-01; 1 phiên không đếm + 8 phiên đếm trên nhánh bk-spec-reach cắt từ 7a461e4 kèm ba chỗ sửa; làm bộ đếm và bước 0 trước; ngưỡng đi tiếp Rfile ≥ 2/8, ngưỡng chữ tới phiên M ≥ 7/8)?" The owner chose **"Duyệt mục 1 như đã viết (Recommended)"**, described as "Chín phiên, khoảng 2 USD (chưa đo). Duyệt chữ của ba chỗ sửa chỉ cho nhánh của phép dò, không cho merge."
2. "Mục 2: phép dò KHÔNG tính vào "tối đa hai lượt" của giai đoạn 2 (nó không thể dẫn tới merge), và văn bản này chỉ được dò tối đa một lần?" The owner chose **"Duyệt mục 2 (Recommended)"**.
3. "Mục 3: nhánh bk-spec-reach được cắt theo lời của phép dò, đóng băng chữ K-after của giai đoạn 2 ở commit đó (giai đoạn 2 sau này chạy đúng commit ấy)?" The owner chose **"Duyệt mục 3 (Recommended)"**.
4. "Mục 4: thêm node-01 (8 phiên nữa, 17 phiên tổng)?" The owner chose **"Không thêm node-01 (Recommended)"**.

**The registration is "Planned registration" above, unchanged**: its steps and their order, the task, the model, the commands, the definitions, the bars, the reading, the limits and what follows each outcome. Nothing is added here but where each step is recorded and the tally's choices on points the definitions leave open (next paragraph): the tally and its test are in the commit that adds this section (step 1); step 0's output, the commit of `bk-spec-reach` (step 3), the uncounted session's host and the counted call are written below, each through the gate, in that order. Stage 2 of `docs/specs/2026-10-08-bk-spec-stack-reach-design.md` is not approved by these labels, nor are the three edits for a merge.

**Step 1, the tally**: `evals/analysis/spec-probe-tally.cjs`, with `tests/spec-probe-tally.test.cjs` (sixteen tests: a `head`-cut output, an output filtered by `grep` that keeps the list, a full output, a compact one-line JSON, an empty list, another stack's list, a refused call by its wording and by the host's `permission_denied` event, a run that exits non-zero, a mention of the script that does not run it, runs in a subshell, an assignment or with a quoted `node` path, a quoted pipe, `first`, `content`, cut, not-completed and sleep-hit sessions, a folder of another branch or with no `kit.branch`, two `init` events, the reading rows, the segment split, a run whose only result is an exit-code error, a list shown by a call that is not a run, the scorer's reach() fallback). Choices the definitions above leave open, made in the tally and named here:
- a session's stream is read only for its K sessions (file names `-K<n>`), so S sessions in a step 0 folder are not read;
- where `check.json` has no `Rfile` or no `Rdetect` (the `build-01` scorer records neither), the scorer's own `reach()` reads them from the stream, and the row says so;
- step 0's stack file is the task's own (`php-01` `php-laravel.md`, `build-01` `node.md`);
- a refusal is a result the scorer's refusal test reads as one, or a call the host marked with a `permission_denied` event, whatever its wording;
- `Rrun` is printed with the number of sessions whose only run came back as an error that is not a refusal (an exit-code error, for example a run chained after a `cat` of a missing file, or an interrupted call), counted in `Rrun` as the definition reads, and shown apart;
- `first` and `content` are read from the stream whatever `check.json` says, so a cut, not-completed or sleep-hit session (whose `Rfile` is forced to no) can show `before-edit` or `content` yes; the summary of the two is printed over the `Rfile` sessions, and again over all; `none` means the stream names no stack file;
- a shell `grep` or `rg` stage counts as reading the file only when it is named after the pattern (`grep -n x FILE`); one that names it only as its pattern is `named`; a `Select-String` stage that names it anywhere counts; `gc` is read as `Get-Content`; a shell reader whose result is an exit-code error counts as not reading it, even when the file's text came back with the error;
- a run of `detect-stack` is read from the command text: the first stage of a pipeline may be preceded by a subshell parenthesis, an assignment (`$x =`, `x=$(`), a call operator `&`, environment assignments, and may be `node` or `node.exe`, bare or by a quoted path; separators inside a quoted string are not read as separators; `sed` with any flag cluster containing `n` (`-ne`, `-En`) is read as `sed -n`; a cut done any other way is not seen (the proposal's Limits say so);
- `T` is printed with the number of sessions whose cut calls were all refused, counted in `T` as the definition reads, and shown apart;
- a session with two `init` events of different models or hosts shows both, joined by `+`;
- without `--expect` the tally warns that a missing session would not be seen; with it, a missing stream is named as never started and counted as no, and more streams than expected are warned of; a name given to `--sleep` that matches no session is warned of, and a bare session name given apart from `--sleep` is read as one.

Limits of the tally, named by its reviewers and not in the proposal's "Limits": `L` needs the key `"stackFiles"` in the text, so a list shown through `jq '.stackFiles[]'`, `ConvertFrom-Json` with `-ExpandProperty stackFiles` or `Format-List` is not seen as the list; a run written as `node --no-warnings scripts/detect-stack.cjs` or as `./scripts/detect-stack.cjs` (the file has a shebang) is not seen as a run, so neither `Rrun` nor `T` is set by it; a lone apostrophe in a command can pair with a later quote and hide a run.

Checks run before this commit, a reading and not a result of the probe: on stage 1's two folders the tally prints, for `py-01`, `Rdetect` and `Rrun` 6 of 8, `T` 6 of 8, `L` 0 of 8, `Rfile` 0 of 8, and for `node-01` (`--stack node`) `Rrun` 4 of 8 and `L` 4 of 8 (Stage 1: `Rdetect` 4 of 8, the path of `node.md` shown in all four) and `Rfile` 1 of 8; with the cut predicate, the list predicate, or the use of the `permission_denied` event broken in turn, three, two and one of the sixteen tests fail. Both round 1 reviewers of this commit ran the tally over the ten step-0 folders while reviewing it, before step 0 was due; they report 18 K-after sessions with `Rrun` 18 of 18 and `T` 0 of 18. Step 0 is still run once by the session after this commit and written below unedited; nothing above was chosen or changed from that reading.

Sentences of the proposal that were true when written and are superseded by this section: in Status, "no tally is written" (the tally exists from this commit; no branch is cut yet); in "Limits", "The tally does not exist yet". No bar, definition or step is among them.

## Step 0 and step 3 (2026-10-14, session 9)

**Step 0**, run once by the session, from `main` at `a1fe6f8`, after the commit of step 1, with no bar: `node evals/analysis/spec-probe-tally.cjs evals/results/2026-10-01-bench-php-01-natural evals/results/2026-10-01-bench-php-01-natural-2 evals/results/2026-10-01-bench-php-01-natural-3 evals/results/2026-10-01-bench-php-01-natural-4 evals/results/2026-10-01-bench-php-01-natural-5 evals/results/2026-10-01-bench-php-01-natural-6 evals/results/2026-10-01-bench-php-01-natural-7 evals/results/2026-10-01-bench-php-01-natural-8 evals/results/2026-10-01-bench-php-01-natural-9 evals/results/2026-10-01-bench-build-01-natural --branch p4c-build-reach`. Every listed folder is present. Its output, unedited:

```
2026-10-01-bench-php-01-natural: kit {"branch":"p4c-build-reach","commit":"32d1497e71f4ce00e48f1c32a92e70b267790205","dirty":false} cut []
2026-10-01-bench-php-01-natural-2: skipped, kit.branch p4a-php, not p4c-build-reach
2026-10-01-bench-php-01-natural-3: kit {"branch":"p4c-build-reach","commit":"32d1497e71f4ce00e48f1c32a92e70b267790205","dirty":false} cut []
2026-10-01-bench-php-01-natural-4: skipped, kit.branch p4a-php, not p4c-build-reach
2026-10-01-bench-php-01-natural-5: kit {"branch":"p4c-build-reach","commit":"32d1497e71f4ce00e48f1c32a92e70b267790205","dirty":false} cut []
2026-10-01-bench-php-01-natural-6: skipped, kit.branch p4a-php, not p4c-build-reach
2026-10-01-bench-php-01-natural-7: kit {"branch":"p4c-build-reach","commit":"32d1497e71f4ce00e48f1c32a92e70b267790205","dirty":false} cut []
2026-10-01-bench-php-01-natural-8: skipped, kit.branch p4a-php, not p4c-build-reach
2026-10-01-bench-php-01-natural-9: kit {"branch":"p4c-build-reach","commit":"32d1497e71f4ce00e48f1c32a92e70b267790205","dirty":false} cut []
2026-10-01-bench-build-01-natural: kit {"branch":"p4c-build-reach","commit":"32d1497e71f4ce00e48f1c32a92e70b267790205","dirty":false} cut []
folder | session | stack | model | host | inits | flags | Rfile (from) | Rdetect | Rrun | T | L (run) | first | content | O1 O2 | Y1 Y2 Y3 X | refused | cost | s | tokens | skills
2026-10-01-bench-php-01-natural | 01-natural-K1 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | n (check) | ran | y | n | y (y) | none | none | y y | - - - y | 3 | 0.4497 | 132 | 892247 | bearingkit:bk-build
2026-10-01-bench-php-01-natural | 02-natural-K2 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | - - - y | 0 | 0.2997 | 95 | 591505 | bearingkit:bk-build
2026-10-01-bench-php-01-natural-3 | 01-natural-K1 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | - - - y | 0 | 0.359 | 111 | 799039 | bearingkit:bk-build
2026-10-01-bench-php-01-natural-3 | 03-natural-K2 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | n (check) | ran | y | n | y (y) | none | none | y y | - - - y | 0 | 0.4057 | 121 | 822523 | bearingkit:bk-build
2026-10-01-bench-php-01-natural-5 | 01-natural-K1 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | - - - y | 0 | 0.3633 | 100 | 818225 | bearingkit:bk-build
2026-10-01-bench-php-01-natural-5 | 03-natural-K2 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | - - - y | 0 | 0.5442 | 213 | 910319 | bearingkit:bk-spec,bearingkit:bk-build
2026-10-01-bench-php-01-natural-7 | 01-natural-K1 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | - - - y | 0 | 0.43 | 124 | 891954 | bearingkit:bk-build
2026-10-01-bench-php-01-natural-7 | 03-natural-K2 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | - - - y | 0 | 0.3969 | 106 | 946065 | bearingkit:bk-build
2026-10-01-bench-php-01-natural-9 | 01-natural-K1 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | n (check) | ran | y | n | y (y) | none | none | y y | - - - y | 0 | 0.3361 | 105 | 723115 | bearingkit:bk-build
2026-10-01-bench-php-01-natural-9 | 03-natural-K2 | php-laravel | claude-sonnet-5 | 2.1.281 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | - - - y | 0 | 0.4229 | 143 | 779642 | bearingkit:bk-build
2026-10-01-bench-build-01-natural | 01-natural-K1 | node | claude-sonnet-5 | 2.1.281 | 1 | - | y (reach) | ran (reach) | y | n | y (y) | before-edit | yes | y y | - - - - | 8 | 0.6538 | 129 | 1879293 | bearingkit:bk-build
2026-10-01-bench-build-01-natural | 02-natural-K2 | node | claude-sonnet-5 | 2.1.281 | 1 | - | y (reach) | ran (reach) | y | n | y (y) | before-edit | yes | y y | - - - - | 3 | 0.5063 | 157 | 1326727 | bearingkit:bk-build
2026-10-01-bench-build-01-natural | 03-natural-K3 | node | claude-sonnet-5 | 2.1.281 | 1 | - | y (reach) | ran (reach) | y | n | y (y) | before-edit | yes | y y | - - - - | 8 | 0.6366 | 173 | 1903482 | bearingkit:bk-build
2026-10-01-bench-build-01-natural | 04-natural-K4 | node | claude-sonnet-5 | 2.1.281 | 1 | - | y (reach) | ran (reach) | y | n | y (y) | before-edit | yes | y y | - - - - | 3 | 0.5128 | 121 | 1483812 | bearingkit:bk-build
2026-10-01-bench-build-01-natural | 05-natural-K5 | node | claude-sonnet-5 | 2.1.281 | 1 | - | y (reach) | ran (reach) | y | n | y (y) | before-edit | yes | y y | - - - - | 8 | 0.5398 | 152 | 1502610 | bearingkit:bk-build
2026-10-01-bench-build-01-natural | 06-natural-K6 | node | claude-sonnet-5 | 2.1.281 | 1 | - | y (reach) | ran (reach) | y | n | y (y) | before-edit | yes | y y | - - - - | 2 | 0.5124 | 119 | 1392894 | bearingkit:bk-build
2026-10-01-bench-build-01-natural | 07-natural-K7 | node | claude-sonnet-5 | 2.1.281 | 1 | - | y (reach) | ran (reach) | y | n | y (y) | before-edit | yes | y y | - - - - | 4 | 0.4535 | 96 | 1325729 | bearingkit:bk-build
2026-10-01-bench-build-01-natural | 08-natural-K8 | node | claude-sonnet-5 | 2.1.281 | 1 | - | y (reach) | ran (reach) | y | n | y (y) | before-edit | yes | y y | - - - - | 9 | 0.6731 | 193 | 1859791 | bearingkit:bk-build
sessions read: 18; models: claude-sonnet-5; hosts: 2.1.281; no init: none
WARNING: --expect not given; a session missing from the folder would not be seen
cut, not completed or sleep-hit (counted M no and Rfile no; M comes from skill-loaded.cjs, so set these names to no by hand): none
Rfile 15 of 18 · Rdetect ran 18 of 18 · Rrun 18 of 18 (by an error result only 0 of 18) · T 0 of 18 (by a refused call only 0 of 18) · L 18 of 18 (by a detect-stack run 18 of 18)
among the 15 Rfile sessions: first: before-edit 15 · content: yes 15; all sessions as streamed: first: none 3, before-edit 15 · content: none 3, yes 15
O1 18 of 18 · O2 18 of 18 · Y1 0 of 18 · Y2 0 of 18 · Y3 0 of 18 · X 10 of 18 · refused calls 48
cost median 0.4516 (0.2997 to 0.6731) · seconds median 122.5 (95 to 213) · tokens median 928192 (591505 to 1903482)
reading of T, L and Rrun: not applicable (not eight sessions)
```

**Step 3**: the branch `bk-spec-reach`, cut from `7a461e4`, holds one commit, **`dfdb3d5`**, with the three edits; `git diff --name-only 7a461e4 bk-spec-reach -- skills hooks agents scripts bin .claude-plugin evals/bench evals/fixtures NOTICE upstream` printed exactly `skills/bk-spec/SKILL.md`; the suite on the branch, run alone: 233 tests, 233 pass; its own reviewer, checking the three edits against the fixed words character by character: "REVIEW (branch edits): 0 must-fix, 0 should-fix"; pushed to `origin/bk-spec-reach`. The uncounted session runs next, from a clean checkout of `bk-spec-reach`.

## The uncounted session (2026-10-14, session 9): its four checks and its host; the host every counted session must name

**Before the call**: a clean checkout of `bk-spec-reach` at `dfdb3d5`; the dry run of the same command printed "1 sessions: nK1"; `get_usage` 11% of the five-hour window, 3% of the week.

**The call**, once: `node bin/bearingkit.cjs bench --task py-01 --config-dir C:/Projects/Bearingkit/_build/profile/claude --branches K --variants natural --model claude-sonnet-5-5 --runs 1`, started 06:53:51Z, ended by 06:56:24Z, run with the turn kept alive. Folder: `evals/results/2026-10-14-bench-py-01-natural-claude-sonnet-5-5` (not in git). `meta.json`: `kit.branch` `bk-spec-reach`, `kit.commit` `dfdb3d5dae31dd2aad770374e1ba670da10d2862`, `dirty: false`, `"cut":[]`.

**The four registered checks**, all hold:
- its `init` names model `claude-sonnet-5-5`;
- it completed (its last `result` event is a success with `is_error` false: the tally flags it neither cut nor not completed);
- `"cut":[]` in `meta.json`;
- `node evals/analysis/skill-loaded.cjs <folder> --skill bk-spec --marker "Stack rules before anything else"` read "bk-spec with marker: loaded in 1 of 1; unknown 0".

**Its host** (`claude_code_version`): **`2.1.291`**, the host of stage 1, so the set-side with stage 1 does not cross hosts. **Every counted session must name host `2.1.291`.**

No Kernel-Power event 41, 42 or 107 in the System log from 03:50Z, about three hours before the call, to the reading after it (the log's latest Kernel-Power events, 105 and 521, were read as a control that the query returns events).

This session is in no tally. Its figures, printed by the tally from `main` with no bar, are not read as a result and do not stop, change or start anything: `Rfile` no, `Rdetect` ran, `Rrun` yes, `T` no, `L` yes (by a `detect-stack` run), `first` and `content` none; O1, O2, Y1, Y3 yes, Y2 and X no; one refused call; 0.2841 USD, 46 s, 307,190 tokens; skills launched: `bearingkit:bk-spec`.

## Result (2026-10-14, session 9): V and R hold, `Rfile` 7 of 8: go

**The counted call**, once, as registered: from a clean checkout of `bk-spec-reach` at `dfdb3d5` (`git diff --name-only 7a461e4 bk-spec-reach` over the registered paths printed exactly `skills/bk-spec/SKILL.md`; the dry run printed "8 sessions: nK1 nK2 nK3 nK4 nK5 nK6 nK7 nK8"; `get_usage` 11% of the five-hour window, 3% of the week), `node bin/bearingkit.cjs bench --task py-01 --config-dir C:/Projects/Bearingkit/_build/profile/claude --branches K --variants natural --model claude-sonnet-5-5 --runs 8`, started 07:15:23Z, ended 07:30:14Z (exit 0), run in the background while the session's turn waited on it in the foreground in pieces of under ten minutes. Folder: `evals/results/2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2` (not in git; the `-2` because the uncounted session took the base name). `meta.json`: `kit.branch` `bk-spec-reach`, `kit.commit` `dfdb3d5dae31dd2aad770374e1ba670da10d2862`, `dirty: false`, `"cut":[]`. No session was re-run. Nothing was written to a tracked file between the start of the call and the reading of the tally. No Kernel-Power event 41, 42 or 107 in the System log from 07:15:00Z to the reading after the call, so no session is sleep-hit and no name was passed to `--sleep`.

**`M`**, `node evals/analysis/skill-loaded.cjs evals/results/2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 --skill bk-spec --marker "Stack rules before anything else"`: yes for each of the eight; "bk-spec with marker: loaded in 8 of 8; unknown 0".

**The tally**, run once from `main` at `9ddb4a8`: `node evals/analysis/spec-probe-tally.cjs evals/results/2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 --expect 8`. Its output, unedited:

```
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2: kit {"branch":"bk-spec-reach","commit":"dfdb3d5dae31dd2aad770374e1ba670da10d2862","dirty":false} cut []
folder | session | stack | model | host | inits | flags | Rfile (from) | Rdetect | Rrun | T | L (run) | first | content | O1 O2 | Y1 Y2 Y3 X | refused | cost | s | tokens | skills
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 | 01-natural-K1 | python | claude-sonnet-5-5 | 2.1.291 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | y y y n | 2 | 0.216 | 53 | 368342 | bearingkit:bk-spec
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 | 02-natural-K2 | python | claude-sonnet-5-5 | 2.1.291 | 1 | - | y (check) | ran | y (error only) | n | y (y) | before-edit | yes | y n | y y y n | 1 | 0.1914 | 51 | 317019 | bearingkit:bk-spec
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 | 03-natural-K3 | python | claude-sonnet-5-5 | 2.1.291 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | y y y n | 1 | 0.192 | 49 | 318043 | bearingkit:bk-spec
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 | 04-natural-K4 | python | claude-sonnet-5-5 | 2.1.291 | 1 | - | n (check) | ran | y | y | n (n) | none | none | y y | y n y n | 3 | 0.2521 | 101 | 598442 | bearingkit:bk-spec
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 | 05-natural-K5 | python | claude-sonnet-5-5 | 2.1.291 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | y y y n | 1 | 0.1858 | 48 | 269198 | bearingkit:bk-spec
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 | 06-natural-K6 | python | claude-sonnet-5-5 | 2.1.291 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | y y y n | 1 | 0.2208 | 58 | 415269 | bearingkit:bk-spec
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 | 07-natural-K7 | python | claude-sonnet-5-5 | 2.1.291 | 1 | - | y (check) | ran | y (error only) | n | y (y) | before-edit | yes | y y | y y y n | 1 | 0.1736 | 45 | 265688 | bearingkit:bk-spec
2026-10-14-bench-py-01-natural-claude-sonnet-5-5-2 | 08-natural-K8 | python | claude-sonnet-5-5 | 2.1.291 | 1 | - | y (check) | ran | y | n | y (y) | before-edit | yes | y y | y y y n | 2 | 0.2447 | 73 | 516194 | bearingkit:bk-spec
sessions read: 8; models: claude-sonnet-5-5; hosts: 2.1.291; no init: none
expected 8 counted sessions, streams found 8
cut, not completed or sleep-hit (counted M no and Rfile no; M comes from skill-loaded.cjs, so set these names to no by hand): none
Rfile 7 of 8 · Rdetect ran 8 of 8 · Rrun 8 of 8 (by an error result only 2 of 8) · T 1 of 8 (by a refused call only 0 of 8) · L 7 of 8 (by a detect-stack run 7 of 8)
among the 7 Rfile sessions: first: before-edit 7 · content: yes 7; all sessions as streamed: first: before-edit 7, none 1 · content: yes 7, none 1
O1 8 of 8 · O2 7 of 8 · Y1 8 of 8 · Y2 7 of 8 · Y3 8 of 8 · X 0 of 8 · refused calls 12
cost median 0.20400000000000001 (0.1736 to 0.2521) · seconds median 52 (45 to 101) · tokens median 343192.5 (265688 to 598442)
reading of T, L and Rrun (descriptive, used only after a no-go with V and R holding): row 3
```

**The bars, fixed before the data:**

| Check | Rule | Read | Holds |
|---|---|---|---|
| V. validity | every counted `init` names `claude-sonnet-5-5` and host `2.1.291`; every counted session has an `init` | 8 of 8 name both; one `init` each; eight streams of eight | yes |
| R. reach of the text | `M` in at least 7 of 8 | 8 of 8 (unknown 0) | yes |
| P. primary | `Rfile` in at least 2 of 8 | 7 of 8 | yes |

**What follows, by the registered rule**: V and R hold and `Rfile` is at least 2 of 8, so the probe says **go**: the result is written up here and stage 2 of `docs/specs/2026-10-08-bk-spec-stack-reach-design.md` is put to the owner. It does not start by rule: stage 2 still needs the owner's word that names it, and its own uncounted session. A go does not oblige the session's recommendation. Nothing of `bk-spec-reach` is merged under any outcome of the probe.

**What may be said, and no wider**: with the three edits, on `py-01`, asked in plain words, on `claude-sonnet-5-5`, host `2.1.291`, the stack file was opened in 7 of 8 sessions (stage 1, on 2026-10-08 and without the edits: 0 of 8); `T` 1 of 8 and `L` 7 of 8. Of the seven `Rfile` sessions, all seven opened the content (`content` yes; K8 by `head -40` of the 41-line file, so without its last line), so the go does not rest on sessions that only named the file. Not: that the edits raised the opening of the file (no concurrent control); anything about `node-01`, another task, model, host or day; anything about the deadline hazard.

**Reported with no bar** (descriptions, not findings), from the tally above:
- `Rdetect` ran 8 of 8; `Rrun` 8 of 8, of which 2 (K2, K7) by an error result only: in both, the call that ran `detect-stack` ended with `cat CLAUDE.md AGENTS.md 2>/dev/null`, which exits non-zero in this fixture, and `L` was read from that same call's output. `T` 1 of 8 (K4), and K4 is the one session with `L` no and `Rfile` no. `L` 7 of 8, all by a `detect-stack` run.
- `first`: before-edit in each of the seven `Rfile` sessions; `content`: yes in each of the seven.
- O1 8 of 8 and O2 7 of 8 (K2 no). O1 is at least 7 of 8, so no risk to stage 2's bar 3 is named.
- Hazards: Y1 8 of 8, Y2 7 of 8, Y3 8 of 8, X 0 of 8. Y2 against `Rfile` session by session: Y2 passed in the seven sessions with `Rfile` and missed in K4, which has no `Rfile`. This puts two columns side by side and claims no link between them: no concurrent control, eight sessions, and nothing about the deadline hazard is said.
- Skills launched: `bearingkit:bk-spec` in each of the eight. Refused calls: 12 in all.
- Cost per session, median 0.204 USD (0.1736 to 0.2521); duration median 52 s (45 to 101); tokens median 343,192.5 (265,688 to 598,442).
- The reading of `T`, `L` and `Rrun` (row 3) is used only after a no-go with V and R holding; after a go it is printed and proposes nothing.

**Limits that bear on this result**, from "Limits, said now": no concurrent control (the only baseline is stage 1, eight sessions on 2026-10-08 from another checkout of the same text); eight sessions; one task, one fixture, one model, one host; the three edits are measured together; the branch lacks the `c-cpp` merge, so a merge of the edits would be a different commit, to be reviewed for that.
