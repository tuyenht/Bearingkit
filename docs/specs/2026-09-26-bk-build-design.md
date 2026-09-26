# bk-build sprint design (2026-09-26)

Item 6 of the v0.3 order (`docs/plans/2026-09-19-v03-remaining-skills.md`, "Thứ tự phần còn lại"); session P1 and P2 of `docs/plans/2026-09-26-v03-roadmap.md`. It follows the owner's choice after `review-04` (label verbatim): "Đo quy trình và chi phí, làm bk-test (Recommended)" (`docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md:452`). So this sprint measures, against the skill's sources on Sonnet, the process the skill asks for and its cost, registered here before any session runs.

## Inputs

**Step 1, the stack classification** (handoff 2026-09-26, Next work 2). The inventory has 142 rows with target `bk-build`: 7 absorb, 32 drop, 103 idea (`_build/bk-build-sprint/count-rows.cjs`, and independently `grep -c "| bk-build | idea |"`). The earlier proposal counted 216 ideas (`_build/v03-prep/v03-order-proposal.md`, untracked); that count could not be reproduced. The 103 rows are bucketed in `docs/specs/2026-09-26-bk-build-idea-classification.md`:

| Bucket | Rows | Goes to |
|---|---|---|
| `typescript-react` | 28 | existing `stacks/typescript-react.md` |
| `node` | 26 | item 7, new `stacks/node.md` |
| `python` | 22 | item 7, new `stacks/python.md` |
| `generic-build` | 9 | this sprint may use them; not required |
| `kotlin` | 6 | existing `stacks/kotlin.md` |
| `php-laravel` | 4 | item 7 |
| `c-cpp` | 3 | item 7 |
| `shell` | 2 | item 7 |
| `sql` | 2 | existing `stacks/sql.md` |
| `major-upgrade` | 1 | this sprint |

Item 7 therefore has 57 idea rows for its five new files, and 36 more for the three existing ones.

**The absorb.** Four of the seven absorbs are ported already, into `references/executing.md` from Superpowers. Three remain, all Apache-2.0, from `anthropics/claude-plugins-official` at `3b60051`, `plugins/code-modernization/`:

| Inventory line | File | Into |
|---|---|---|
| 213 | `agents/uplift-migrator.md` | new `references/major-upgrade.md` |
| 214 | `agents/version-delta-analyst.md` | same |
| 224 | `commands/modernize-uplift.md` | same |

A research report (`_build/bk-build-sprint/source-read.md`, untracked) found the following:
- **No conflict with the protocol.** `skills/bk-protocol/SKILL.md:76` says a major bump is its own reviewed change, and the source's procedure is exactly that change.
- **Overlap to point at, not repeat.** `skills/bk-test/references/characterization.md` already carries the same plugin's `test-engineer.md`. The one part it did not carry is the dual run: the same suite run on the old and the new version.
- **The load-bearing new idea** (`modernize-uplift.md:51-63`): before planning, ask whether the existing test suite runs on the target version as it is. If it does not, migrating the tests is the first phase, not the last.

Not portable: the plugin's workflow scripts, its `legacy/`/`modernized/` folders, its other agents, and its brief and preflight files.

**The text planned.** `references/major-upgrade.md`, at most 80 lines, following the report's outline:
1. pin the version pair, and ask whether the suite runs on the target;
2. build a delta catalog, including silent behavioural changes;
3. record the suite's result to a file before any edit;
4. pilot one representative unit, then write a playbook;
5. fan out only after that;
6. prove the result, with a dual run where both versions run;
7. record what was deferred.

Characterization and untrusted content are pointed at, not restated. The `SKILL.md` body gets one "Read first" line for a major bump and the Sources line. `NOTICE` and `derived` in `upstream/sources.json` are updated as for every absorb.

## Task `build-01` (registered 2026-09-26, before any session ran)

Fixture `evals/bench/build-01/`, built by `build.cjs` in the pattern of `test-01`. It is a small Node invoicing module with no package manager and no network. Its public surface is `src/index.js` (`importInvoices`, `renderInvoice`, `dueReminders`, `exportCsv`), which the existing suite uses. Its date library is vendored twice:
- `vendor/datefmt-1/` is the version in use, reached through one line in `src/deps.js`;
- `vendor/datefmt-2/` is the new major, with a `CHANGELOG.md` listing three changes:
  1. **Removed API.** `format(date, pattern)` becomes `formatDate(date, { pattern })`. It is used in three modules: `src/invoice.js`, `src/reminders.js`, `src/export.js`.
  2. **Silent behaviour change.** `parse('01/02/2026')` now reads day-first, where v1 read month-first. It is used once, in `src/import.js`, for US-format CSV dates. The changelog states it in one line under "Behaviour". v2 takes `{ order: 'MDY' }` to keep the old reading. No existing test covers an ambiguous date, so the suite stays green if the change is missed.
  3. **Removed test helper.** `datefmt/testing`'s `assertSameDay` is gone in v2. `tests/helpers.js` uses it, so after the bump the suite cannot run until the helper is ported. This is the source's "can the suite run on the target" case.

**The prompt**, the same for every branch: "Upgrade our date library from datefmt 1 to datefmt 2 (it's already in vendor/datefmt-2). Behaviour must stay the same. You have my go-ahead to make the change without stopping to ask."

Branches get the same permissions as `test-01`:
- edits inside the fixture;
- `node`;
- read-only `git`.

`git commit` is not allowed, so a commit attempt shows as a refused call and is still counted.

**Scored after the session, by script:**

| Id | Kind | What | How |
|---|---|---|---|
| **P1** | **primary, process** | **Baseline first**: the suite was run, and the run completed, before the first edit to any file under `src/` or `tests/` | from the stream: the first `node --test` (or `npm test`) tool result precedes the first `Edit`/`Write` under those folders |
| P2 | process | Delta site pinned: the session's suite fails when, in a scratch copy of its final tree, `vendor/datefmt-2`'s `parse` is patched to ignore the `order` option | scorer copies the tree, patches, runs the suite; path-independent. A session that kept the old reading without the `order` option is read by eye and marked |
| P3 | process | The new library left as released: nothing under `vendor/` changed, except files of the dead `vendor/datefmt-1/` copy that were removed (reported apart as `v1Removed`); a v1 file edited in place still fails | `git status` of the fixture |
| P4 | process | Files touched outside `src/`, `tests/`, `test/`, removed `vendor/datefmt-1/` files and a notes file at the root: count | same |
| P5 | process | Commit attempts: a `Skill` call to `bk-ship`, or a command containing `git commit`, `git push` or `gh pr create` (definition of `docs/specs/2026-09-25-bk-debug-design.md:126`) | stream |
| P6 | process | A way back stated in the answer (revert, restore, rollback, the previous version kept) | regex on the answer; read by eye for every session before the result is written |
| O1 | outcome | Old reading kept: through the fixture's public surface, `require('./src').importInvoices(csv)` on a row dated `01/02/2026` yields 2 January | scorer's own test, not in the fixture; the prompt asks for unchanged behaviour, so the public surface is part of it |
| O2 | outcome | Upgraded: `src/` requires `datefmt-2`, and no `require` or `import` of `datefmt-1` is left under `src/` or `tests/` (a comment naming it does not count) | grep on require and import sites |
| O3 | outcome | Green: the session's suite passes on its final tree | run |
| H | process | Stopped to ask: the session ended with no edit under `src/` and an answer that asks for approval or proposes a plan | stream and answer |
| C | cost | USD, API calls, tool calls, seconds; the skill each session invoked | stream |

A fixture test comes first (red before green, in `tests/`), in the pattern of `test-01`. It must show:
- the untouched fixture is green on v1;
- a naive bump (v2 API only) is green on the existing suite but fails O1;
- a correct reference port passes O1, O2 and O3, and a test pinning the ambiguous date makes P2 true;
- touching `vendor/` makes P3 false.

**Calibration on the floor, Sonnet 5**: three `natural` F sessions. The task is usable if **P1 holds in at most 1 of 3** F sessions, or **O1 fails in at least 2 of 3**; either leaves room for the process to show. If the floor does both (P1 in 2 or more, O1 in 2 or more), the task is not scored, and the text falls back to a guard, as below.

**Then, if usable:**
- Eight `natural` sessions each on Sonnet 5, interleaved:
  - F: the calibration's three plus five;
  - S: the sources as they ship, pinned (`superpowers` at `f2cbfbe`, `code-modernization` of `claude-plugins-official` at `3b60051`, and `andrej-karpathy-skills` at `2c60614`, since `bk-build` paraphrases two of its lines). The runner checks each copy against `upstream/sources.json`, and `--dry-run` must show it loads before any session;
  - K before: the kit as it ships, with no `major-upgrade.md`.
- The text is written only after those runs. Then eight K after sessions run with it.
- **Primary: P1**, compared by the exact two-sided permutation test (`permutationTest`, `scripts/lib/bench-score.cjs:162`).
- **Commit rule for the text:**
  - P1 for K after is above K before with p ≤ 0.05;
  - O3 is at least 7 of 8 for K after;
  - O1 for K after is not below K before;
  - otherwise the text is not committed, and the owner decides.
- **Against the sources.** K after is compared with S by the same test. "Better than its sources on `build-01`, Sonnet" is said only if p ≤ 0.05. Otherwise the result is "no clear difference".
- Reported with no bar: P2 to P6, H, O1 and O2 per branch; cost median and spread per branch; which skill each session invoked; and, for decision 2 of the handoff, commit attempts per branch.

**Guard, if the task is not usable** (the owner's choice for `bk-debug`, "Commit phần chắt lọc, đóng sprint (Recommended)", 2026-09-25, applied as in `bk-test`). Eight K sessions run with the text. It is committed only if all three hold:
- O2 and O3 each at least 7 of 8;
- O1 not below the floor's calibration;
- P3 at least 7 of 8.

P1, P2, P5, P6 and cost are reported, with no bar and no "better".

**Rejected, with reasons:**
- A `command` variant, where S runs `/code-modernization:modernize-uplift`. That command stops for approval at its Step 2, before any edit (`modernize-uplift.md:143-157`), which ends a headless session with nothing changed. It also works in a `legacy/`/`modernized/` copy that the scorer does not read. The natural prompt records which skill or agent each branch actually reached, as in `review-01`.
- Scoring outcome only. The owner's choice after `review-04` is process and cost. O1 to O3 stay as guards.
- Three tasks, one per candidate of the report. One fixture carries all three deltas, and three fixtures would triple the sessions within the same weekly limit.

**Limits, stated now.**
- This is one small fixture, and its deltas are planted.
- The text will be written after reading the K-before sessions, so a pass shows it helps on this fixture. A held-out fixture would be needed to say more, and none is built.
- **The protocol is in K only.** `bk-protocol` is injected by the kit's own hook (`hooks/session-start.cjs`), so K sessions carry `skills/bk-protocol/SKILL.md:76` (a major bump is its own reviewed change) and the ACT/COUNCIL gate; S and F do not. That is the kit as it ships, and is kept. Here the bump is the whole task and the prompt pre-approves it, so the line should not apply; if K stops to ask anyway, H counts it and O2 falls, which is scored against the kit, not excused. Expected direction, stated before the run: no effect on P1, a small risk to O2 for K.
- P1 rewards running the suite before editing. A session could run it without reading the result. The scorer checks that the run completed, not that it was understood.

**Budget.** Before the first session: read `get_usage`; the runner stops at 90%. Planned sessions: 3 calibration, then 5 + 8 + 8 + 8 = 29, or 3 + 8 for the guard. Cost per session is not measured for this task. On earlier Sonnet tasks the median per branch ran from 0.11 USD (`review-01` F) to 0.77 USD (`review-01` K); on `debug-01` and `test-01` it was 0.13 to 0.34 USD at the median, by branch.

## Independent review of this registration

Before the fixture is built and before any session runs, a Sonnet reviewer that did not write it reads this section. It changes no file and runs no session. It checks for:
- a metric the floor trivially passes;
- a scorer rule that a correct session could fail;
- unequal branches;
- unverified claims.

Findings are weighed on evidence and recorded below with what changed.

### Review result (2026-09-26, Sonnet, read only)

The reviewer changed no file and reported breaking no rule.

| Finding | Severity given | Weighed | Change |
|---|---|---|---|
| The protocol (and its line on major bumps) reaches K only, which may push K to stop and ask | blocker | Real asymmetry, but it is the kit as shipped, and the prompt pre-approves the bump | Kept the protocol; added H (stopped to ask) and a limit with the expected direction |
| O1 called a function by name (`importRow`) | should-fix | Correct: a session that renames it would fail a correct port | O1 now goes through the public surface `src/index.js`, `importInvoices` |
| P2 swapped a named file, a no-op if the session moved the parsing | should-fix | Correct | P2 now patches the vendored v2 `parse` in a scratch copy, path-independent; the one blind case is read by eye |
| `build-01/task.json` does not exist, so the S bundle loading is unchecked | note | Correct, and already a precondition (`--dry-run`) | None; checked when the fixture is built |
| Counts, anchors, statistics (8 vs 8: 8/8 against 0/8 gives p ≈ 0.0002, 7/8 against 1/8 p ≈ 0.01) | note | Confirms the design | None |

The reviewer said the registration was not ready until the blocker was resolved or accounted for; it is accounted for above. Under the registration rule, the fixture test and `--dry-run` come next, then calibration.

### Fixture and scorer review (2026-09-26, Sonnet, read only, before any session)

The fixture and scorer were committed (`aed9bb7`) before this review, against the rule that an independent review comes before a commit; the review was run straight after, before any session, and its fixes landed in a new commit. The reviewer ran the suite (174 of 174) and `--dry-run` (`3 sessions: nF1 nS1 nK1`, the three source copies at their pins), and changed no file.

| Finding | Severity given | Change, made before any session |
|---|---|---|
| P4, P5 and H were not in `task.json`'s rules, so the runner's per-branch report would not show them | should-fix | Added as optional rules on boolean checks (`P4out`, `P5try`, `H`); the counts stay in each `.check.json` |
| O2 read comments: a correct port with a comment naming `datefmt-1` failed | should-fix | O2 reads `require` and `import` sites only; a fixture test pins it |
| H missed a statement that waits ("Waiting for your confirmation") | should-fix | The pattern takes statement forms; tests pin two, and one that must not match |
| P3 penalised removing the dead `vendor/datefmt-1/` copy | note | Changed: removal is cleanup, reported as `v1Removed`; editing `datefmt-2` still fails P3 (row above rewritten) |
| P1 needs the suite's summary line; a `node --test` piped to `head` that cuts it scores false | note | Kept, as registered ("the run completed"); read by eye in the write-up |
| `git stash` or `git checkout` as edits are not seen by P1 | note | Unreachable: the permissions allow read-only git only |

The new tests fail on the scorer of `aed9bb7` (2 of 4) and pass on the fixed one (4 of 4).


The reviewer's check of these fixes confirmed them and found one more gap: the v1 exemption covered edits in place as well as removal. It now covers removed files only, with a fixture test (an edit in place fails P3 and counts in P4).

### Calibration result (2026-09-26): usable by the letter, confounded in fact; stopped for the owner

`bearingkit bench --task build-01 --config-dir _build/profile/claude --branches F --runs 3` (`evals/results/2026-09-26-bench-build-01-natural/`). Every session saw 31 tools, ran 32 to 34 seconds and cost 0.143 to 0.172 USD.

| Session | P1 | P2 | P3 | O1 | O2 | O3 | P5 | P6 | H |
|---|---|---|---|---|---|---|---|---|---|
| F1 | false | true | true | true | true | true | 0 | false | false |
| F2 | false | false | true | true | true | true | 0 | false | false |
| F3 | true | false | true | true | true | true | 0 | false | false |

- By the registered rule the task is usable: P1 held in 1 of 3 (the rule asks at most 1). The floor kept the old reading of 01/02 in 3 of 3 (O1).
- **Read by eye, the P1 misses are the profile's permissions, not the process.** F1 ran `cat tests/*.test.js && npm test 2>&1 | tail -15`, and F2 ran `cat …; npm test`, both before any edit, and both were refused: a compound command needs approval, and `npm` is not in the task's allow list (`Bash(node:*)` only). F3 ran its baseline inside an allowed command. So all three floor sessions tried to record a baseline before editing. On intent, the floor does P1 in 3 of 3, and the task would not be usable.
- The runner was stopped here, before any S or K session, and the owner is asked. Continuing as registered would measure which branch writes commands the allow list accepts, not the process `major-upgrade.md` teaches.
