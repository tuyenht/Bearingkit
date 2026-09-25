# Benchmark · the kit against its own sources · 2026-09-24

Status: BUILT 2026-09-24; the first task `review-01` measured on Claude Code (section "Measured"): equal outcome on every branch, the kit at 2 to 3 times its sources' tokens; the second, `review-02`, failed its calibration on the floor (section "Task 2"), so small planted-defect branches cannot separate the branches; the third, `review-03`, a clean diff for false findings, failed too (section "Task 3"): the floor flagged no decoy outright (one hedged), and the diff held one real defect; the fourth, `debug-01`, failed too (section "Task 4"): the floor made the root fix in every session. On the owner's next choice the frame moved to Haiku 4.5 (section "The frame on Haiku 4.5"): its floor misses what the Sonnet floor found, and on `review-02`, over eight sessions per branch, the kit found the defect outside the diff as often as the floor (6 of 8 each) and missed the tenant-less cache key more often (1 of 8 against 5 of 8); the 3-of-3 advantage of the first three sessions was chance. The owner's three design questions are answered below. Standing rule (owner, 2026-09-24, `AGENTS.md`): "cần phải đối chiếu, kiểm chứng và so sánh hiệu quả thực sự của các skils của chúng ta với các skill mà chúng ta lấy nguồn và tổng hợp, phát triển nhé. Tôi cần dữ liệu kiểm chứng và thực sự chất lượng tốt hơn." Requirements: `docs/plans/2026-09-19-v03-remaining-skills.md`, "Khung benchmark = so với skill nguồn". Until a skill has numbers from this frame, no text says it is better than its sources, only "not compared".

## What one comparison is

One task, one fixture, one prompt, one model, one host, one isolated profile (`_build/profile/claude`). Three branches differ only in the plugins the session loads:

| Branch | Loads | How |
|---|---|---|
| K · kit | the checkout | `--plugin-dir <checkout>`; `bearingkit@inline` switched on for the session |
| S · sources | every source plugin of the skill under test, as it ships | one `--plugin-dir` per plugin, from the sha-pinned copies under `_build/upstream/` (pins in `upstream/sources.json`); each switched on for the session |
| F · floor | nothing | no `--plugin-dir` |

`--plugin-dir` takes one path and may be repeated, and `--settings` takes an inline JSON whose keys override the settings files for that session only (Claude Code CLI reference, read 2026-09-24; `docs/compat/2026-09-24-benchmark-tool-claims.md`). So the branch is fixed on the command line, and the profile's own `enabledPlugins` does not decide it. The profile is the same for all three, including whatever the host syncs into it (the init listing is recorded per session, so a difference shows).

Sessions run interleaved (K, S, F, K, S, F, …), so drift in time, host version or quota falls on every branch alike. The fixture is built once per run and reset before every session (branch back to its tagged commit, `main` back to its parent, untracked files removed). The working directory is the fixture, outside the repository and with no memory file above it (the runner's existing check), so neither the repository's `CLAUDE.md` nor its `.claude/settings.local.json` (which, since this repository was activated on 2026-09-24, enables `bearingkit@bearingkit`) reaches a measured session.

## What is scored, by script

Per session, from the `stream-json` transcript:

- **Outcome**: each planted defect found or missed; each decoy flagged (a false finding) or not; the task passed when every planted defect is found and no decoy is flagged. Rules live in the task file and are matched against the final answer, one paragraph or list item at a time: a defect counts when every term group of its rule matches inside one item; a decoy counts when its terms match and the item does not say the code is safe. The matcher is deliberately simple and every scored answer is kept for audit; a disagreement between the script and a reading is reported, not silently corrected.
- **Tokens**: the result event's per-model usage summed over models (subagents included): input, output, cache creation, cache read; reported as total and as "fresh" (input + output + cache creation). Also cost as the host reports it, turns, wall time.
- **Context**: host version, number of tools and the skills listing in the init event, and every Skill or slash-command invocation. Token totals are compared only between sessions with the same number of tools in the init event (standing rule); a branch whose tool count differs is reported, not compared on tokens.
- A session cut at the time limit scores as failed and is named in the results file.

Per branch: median and spread (min–max) of each number over at least three sessions. With three runs only a large difference means anything; the results say so.

## Task 1 · `review-01`

The review probe of the `bk-review` sprint (`_build/v03-prep/build-review-probe.cjs`), moved into the repository as `evals/bench/review-01/build.cjs` and extended. Branch `feature/invoice-export` against `main` of a Next.js and Prisma app:

| Id | Kind | What | Found when an item names |
|---|---|---|---|
| D1 | planted | `DELETE` checks the tenant of the invoice in the URL, then deletes the ids from the body with no tenant scope | the bulk ids or `deleteMany`, and the tenant |
| D2 | planted | the export route accepts a logo URL on a bare `startsWith` against the CDN host, then fetches it server-side | the logo URL, `startsWith` or `fetch`, and SSRF or the prefix bypass |
| D3 | planted, outside the diff | the branch adds the status `void`; the unchanged payment-reminder job selects every invoice whose status is not `paid` or `draft`, so voided invoices get payment reminders (a registry fan-out: found only by following the new value to its readers) | the reminder job and `void` |
| X1 | decoy | the export route sums line items with Prisma's tagged-template `$queryRaw`, which Prisma sends as a prepared statement ("safe from SQL injections", Prisma raw-query docs, read 2026-09-24) | `$queryRaw` and injection, without saying it is safe |

Prompt, the same for every branch, in English so no branch gains from a language: "Review the changes on branch feature/invoice-export against main before I merge it. List the problems you find, most severe first, each with its file and line." One sentence, no skill named: what the owner types, so routing is part of the outcome (the invocations are recorded, so a branch that never reached its review skill is visible).

Source bundle for `bk-review` (its `Sources:` line and the inventory): Superpowers 5.1.0 (`requesting-code-review`, `receiving-code-review`), `code-review` and `pr-review-toolkit` of claude-plugins-official, `mattpocock-skills` 1.2.3 (it ships a Claude Code plugin manifest). `security-guidance` is question 1: it ships no skill, only hooks, and on a read-only review none of its reviews has anything to read (its LLM review runs on the diff the session itself made, and on the session's own `git commit` or `push`), while its SessionStart hook creates a Python venv and installs the Agent SDK in the profile, and its reviews call a model outside the session's token count.

Limits: 900 seconds per session (the skill forks a reviewer), 40 turns.

## Task 2 · `review-02`, calibrated on the floor

Written before any session ran (2026-09-24). Branch `feature/invoice-stats` of the same app (`evals/bench/review-02/build.cjs`), three candidate defects and one decoy:

| Id | Kind | What |
|---|---|---|
| H1 | candidate, caller outside the diff | `assertTenant` now returns the invoice or null instead of throwing; the branch updates the GET route, but the unchanged pay route still awaits it and ignores the result, so any tenant can mark any invoice paid |
| H2 | candidate | the new stats endpoint memoizes tenant totals under `invoice-stats`, a key with no tenant in it |
| H3 | candidate | its error branch logs every request header, the bearer token included |
| X1 | decoy | the same endpoint memoizes exchange rates under `fx-rates`, no tenant in the key, correctly: the data is global |

Protocol, fixed now: (1) three `natural` sessions on the floor F; (2) a candidate stays in the scored set only if F found it in at most one of three; if none stays, the task is rebuilt, not scored; (3) the scored set is written here before K and S run; (4) then three sessions each of K and S, natural first, then the command variant if the quota allows; F's three sessions are reused as the floor. The matcher rules in `task.json` are frozen once F has run; a change afterwards is reported with the outcome before and after.

### Calibration result (2026-09-24)

`bearingkit bench --task review-02 --config-dir _build/profile/claude --branches F --runs 3`: the floor found **H1, H2 and H3 in all three sessions** and flagged no decoy, at 142,476 to 143,181 tokens and 22 to 27 seconds each (`evals/results/2026-09-24-bench-review-02-natural/`). Read by eye, not only by the matcher: every answer opens with the pay route, names `pay/route.ts:9` as a line outside the diff that the diff breaks, and explains that `assertTenant` stopped throwing. By the protocol no candidate stays, so `review-02` is **not scored** and K and S were not run on it.

What the two tasks say together: on a small branch with planted defects, Sonnet 5 with no plugin already finds the defect outside the diff, the cache key without its tenant, and the token in a log, and does not take the decoys. A review skill cannot show added recall on this shape of task, only added cost. The shapes left that could separate the branches, in the order they are cheapest to build:

1. **A clean diff** (a correct, non-trivial change with no defect): measures false findings, where a method with a refute pass and a confidence bar should differ from a plain review. Scored as the number of items that claim a defect, each read against the fixture.
2. **A realistic size**: the same kind of defects inside a branch of 20 to 40 changed files, most of them benign, so attention is spread as in a real pull request.
3. **Defects only a run shows**: a change whose failure needs a test or the app run (a migration order, a race), where reading alone does not suffice.

Each is calibrated on the floor first by the same protocol.

## Task 3 · `review-03`, a clean diff

Written before any session ran (2026-09-24, the owner's choice "Diff sạch (Recommended)"). Branch `feature/payment-webhook` of a small invoice app of its own (`evals/bench/review-03/build.cjs` builds it from `main/` and `branch/` beside it; not the sample app, whose files carry defects planted for other evals). The branch is correct as far as a reading can tell: a payment-provider webhook that verifies a timestamped HMAC signature, records each event once and marks the invoice paid in one transaction; an endpoint that lists an invoice's payment events; an invoice search with a whitelisted sort; the Prisma model and its migration; tests for the signature check and the search parameters. Next.js 15 route params are awaited. It has no planted defect. It has four decoys, each correct code that a hurried review flags:

| Id | What is correct | False finding when an item says |
|---|---|---|
| X1 | the search query is one `$queryRaw` tagged template: every value is a bound parameter, and the `ORDER BY` fragment is `Prisma.raw` of a value from a fixed map, reached only after `Object.hasOwn` accepted the key | SQL injection in the search, the sort or `Prisma.raw` |
| X2 | the signature check compares the byte lengths before `timingSafeEqual`: both sides are SHA-256 digests, the expected one always 32 bytes, so the length says nothing about the secret | a timing leak or side channel in the length check or the comparison |
| X3 | the webhook marks the invoice paid by id with no tenant filter: the id comes from the provider's signed payload, not from a caller, and no session exists | a missing tenant scope or cross-tenant write in the webhook |
| X4 | the events endpoint loads the invoice by id, returns 404 unless its tenant is the caller's, then lists the events of that id | a missing tenant scope or IDOR in the events endpoint |

Scored by script, per session: each decoy flagged (rules in `task.json`, as for the other tasks), and **blocked**, whether the answer tells the owner not to merge (phrases such as "do not merge", "not ready to merge", "request changes", "must be fixed before merging", read on the whole answer). On a clean diff both are false outcomes. The task passes when no decoy is flagged and the answer does not block the merge. Read by eye, not scored: every other item that claims a defect, each checked against the fixture and recorded as true, arguable or false, with the reason; the script's calls are checked in the same reading and a disagreement is reported.

Scoring additions, all inert on the earlier tasks (the kept `review-01` and `review-02` streams rescored with them: none of the 18 sessions changed outcome):
- a line that starts with `**` and is all bold starts a new item, as a heading does;
- a task may name praise headings (`clearSections`, matched against the whole heading: "Strengths", "What's good"…); their items are left out when decoys are counted, until the next heading or bold line of any level, or until an item that carries an unindented plain line (an "Issues:" line);
- clearing words shared by every decoy (`clear`: "prevents", "properly", "by design"…), each guarded against the negations that turn it around ("not safe", "not acceptable", "without properly");
- clearing words are looked for with the item's fix sentences left out (sentences that open with "Fix", "Suggest", "Recommend", "Consider", "Instead", "Should"…), so "Fix: add tenantId to prevent cross-tenant writes" does not clear the claim before it;
- curly apostrophes are read as straight ones.

The decoy rules require a claim, not only the topic: "no tenant filter", "IDOR", "leak", not merely "tenant". Three independent passes over the rules supplied the phrasings their tests pin (the five "review-03 …" rule and verdict tests in `tests/bench.test.cjs`), including the verdict formats of the source plugins ("Ready to merge? With fixes", "Critical (must fix before merge)" over an empty section). Phrasings no test pins can still be mis-scored; that is what the reading is for.

The independent review found no real defect in the branch and confirmed the four decoys; it listed what a reviewer may reasonably raise, and the cheap ones were closed before any run (a signature with non-hex characters is refused, not truncated; one `v1` per rotating secret is accepted; the overdue order compares in UTC; the amount must be a positive integer that fits the `INTEGER` column). Left open, to be read as **arguable**, not false: a payment that does not match the invoice (amount, currency, status) is recorded and only logged; an event for an unknown invoice is answered 200 and only logged; no test drives the route handlers; several `v1` values give an attacker several guesses per request (harmless against a 256-bit HMAC); `%q%` cannot use a b-tree index; offset paging; no body size limit; `findUnique` plus a tenant comparison where the older route uses `findFirst` with the tenant.

Calibration protocol, fixed now: (1) three `natural` sessions on the floor F; (2) the task is usable only if at least two of the three floor sessions contain a false outcome that the script scored **and** the reading confirms (a decoy flagged, or a block); a script call the reading rejects does not count, so a matcher error cannot make the task look usable; otherwise it is rebuilt with stronger decoys, not scored; (3) decoys the floor never flags stay in the task, because a skill can add false findings the floor does not make; (4) the rules in `task.json` are frozen once F has run, and a later change is reported with the outcome before and after; (5) then three sessions each of K and S, `natural`, then `command`; F's three sessions are reused as the floor. Limits as `review-01`: 900 seconds, 40 turns.

The fixture is reviewed by someone other than its author before the floor runs, for any real defect the author missed: a real defect in a "clean" diff would make a correct finding look false.

### Calibration result (2026-09-24)

Rules committed in `6e58937` before the run. `bearingkit bench --task review-03 --config-dir _build/profile/claude --branches F --runs 3`: 158,075 to 219,216 tokens, 57 to 66 seconds, 0.15 to 0.17 USD each, 31 tools in every init event (`evals/results/2026-09-24-bench-review-03-natural/`). Each answer read in full:

| Session | Script | Reading |
|---|---|---|
| F1 | no decoy, no block | agrees. X1, X2 and X4 named under "Checked and fine" as correct; X3 not mentioned at all. Problems listed: the unmatched payment that is only logged, the unknown invoice answered 200, no route tests, the unbounded events list, `%q%` and offset paging: all arguable, none false |
| F2 | X1, no block | **X1 rejected**: the line says `Prisma.raw(SORTS[sort])` "isn't injectable" under a bold "Checked and fine" (neither "isn't" nor that heading is in the rules). **Missed by the script**: problem 3, "the webhook isn't scoped to a tenant … acceptable if a single provider account serves all tenants … please confirm this is intended", a hedged X3; and "Before merging: fix #1", a block |
| F3 | X3, X4, block | **X3 and X4 rejected**: they come from a test-coverage item that names the untested "cross-tenant 404". **Block confirmed**: "I'd fix problem 1 before merging" |

Confirmed by both, as the protocol counts: one session of three (F3, a block). The task is **not usable**, and K and S were not run. A reading-only count would reach two of three (F2 and F3 both ask to fix the unmatched-payment case before merging), but both blocks stand on an item this section lists as arguable, and all three sessions raised it first.

**The diff was not clean.** F3 found a real defect that the author and the independent review both missed: the offset is clamped to 10,000 while `nextOffset` stays `offset + limit` (`search-params.ts:26`, `search/route.ts:33` at `6e58937`), so a client that follows `nextOffset` past 10,000 receives the same page forever. By the rule above this alone disqualifies the fixture. Fixed after the calibration (no `nextOffset` past `MAX_OFFSET`); any later use calibrates again.

What it says: on this small diff, Sonnet 5 with no plugin flagged no decoy outright in any session (the one hedged X3 asks the owner to confirm), cleared most of them in so many words, and spent its findings on the arguable design choices of the webhook and on one real defect. A skill cannot show fewer false findings where the floor makes almost none. With `review-01` and `review-02`, three small-branch tasks now fail to separate the branches, from the recall side and from the precision side. A rebuild with stronger decoys (the protocol's next step) is not taken yet: the floor came near only one of the decoys it has, and only to ask, so decoy strength is not what is missing. The remaining shapes are the realistic size (20 to 40 changed files) and defects only a run shows (section "Task 2"); which one, or none, is the owner's call (`docs/handoff/`).

The script's errors are recorded, not fixed, since the task is not scored: a bold heading "Checked and fine" is not a praise section; "isn't injectable" and "isn't scoped" are not read as negations; a verdict line that puts "Before merging:" first is missed; an item about missing tests that mentions a "cross-tenant 404" is read as a claim.

## Later tasks

`debug-01` has its own section below. `build-01`: a small feature with a TDD or spec step, where `security-guidance`'s edit and commit hooks act. Each gets its own design line here before it runs.

## Task 4 · `debug-01`, a bug whose symptom has a tempting patch

Written before any session ran (2026-09-24), for the `bk-debug` sprint (v0.3 order, item 4). The review tasks showed that the floor reads small code well; a debugging task is scored on what the code does after the session, which reading alone does not settle.

The fixture (`evals/bench/debug-01/`) is a small invoicing library in plain Node, no dependencies, tests on `node:test`. Calendar dates are `YYYY-MM-DD` strings. `parseDate` builds a **local** midnight (`new Date(y, m - 1, d)`), `formatDate` writes the **UTC** date (`toISOString().slice(0, 10)`), `addDays` uses local `setDate`, and `daysLate` floors a difference of two local midnights. In UTC and west of it the round trip holds, so CI (UTC) and the developer who wrote it (Los Angeles) are green; in UTC+7, the owner's zone and this machine's, local midnight is the previous day in UTC and the due-date tests fail. The last commit before the report reworded the invoice summary, an innocent change nearest the symptom.

- **The tempting patch**: make `formatDate` read local components (`getFullYear`, `getMonth`, `getDate`). Every visible test then passes in every zone, but `daysLate` still floors a local difference, so across a daylight-saving change in Los Angeles a 19-day delay reads 18 (measured on this machine: local midnights of 1 and 20 March 2026 are 18.958 days apart there).
- **The root cause**: local and UTC calendar arithmetic mixed. Fixed when every function works in one frame (UTC throughout, or pure calendar arithmetic).
- Other patches that do not count: expected values changed in the visible tests, a `TZ` pinned in the test script (the checks run `node` directly with their own `TZ`).

Prompt, the same for every branch: "`node --test` fails on my machine but CI is green. Find the cause and fix it." Commands: K `/bearingkit:bk-debug`; S `/superpowers:systematic-debugging` with `mattpocock-skills` also loaded (its `diagnosing-bugs` is the other source bundled into `bk-debug`, inventory row 4 of the mattpocock table). F none.

Scored by script, from the fixture after the session and before the reset (`check()` of the builder; results kept beside each stream so a rescore reads them):

| Check | Passes when |
|---|---|
| `visible` | a bare `node --test` in the fixture, as the owner runs it, passes with `TZ=Asia/Ho_Chi_Minh` and with `TZ=UTC` |
| `root` | hidden tests, copied in only for the check, pass with `TZ` set to `Asia/Ho_Chi_Minh`, `America/Los_Angeles`, `UTC` and `Pacific/Auckland`: `daysLate` across both daylight-saving changes, `addDays` across month, year and leap-day ends, the round trip of a date, and the process zone left as the check set it (a `TZ` pinned inside the code fails) |
| `kept` | the original visible tests, whatever the session did to its copies, pass against the session's code in both zones: an expectation weakened in place does not help |
| `regression` | reported, not required: the suite counts more than its original eight tests (from the TAP reporter's count) |

The task passes with `visible`, `root` and `kept`. Answer text is not scored. The checks run `node` with a bare environment (the zone, `PATH` and what Windows needs to start a process), never the runner's own. Sessions get the permissions a debugging session needs, the same on every branch, through the inline settings: edits inside the fixture, `node` and read-only `git` commands (no PowerShell rule: its syntax is not verified, so a PowerShell call is refused on every branch alike). Limits: 900 seconds, 60 turns.

The independent review of the fixture (2026-09-24, before any run) applied ten patches in temporary builds; the five correct ones (UTC throughout, local throughout with rounding, pure calendar arithmetic, `new Date('YYYY-MM-DD')` with UTC operations, local dates with a UTC difference) all passed, also in Auckland, Kiritimati, São Paulo and London. It found two patches that passed without fixing the cause, a `TZ` pinned inside `src` and a noon-anchored date with rounding; the zone check and the Auckland run were added for them, and the tests of the builder show each patch failing. `tests/bench.test.cjs` pins the controls: the planted state fails every check; the tempting patch passes `visible` and `kept` only; the root fix with a new test passes all four; tests replaced by a placeholder pass `visible` only; a zone pinned in `src` and a noon-anchored date each fail `root`. For reading transcripts: Git Bash drops a `TZ` value that contains a slash, so a session that checks `TZ=America/Los_Angeles` through the Bash tool is still running in UTC+7.

Calibration protocol, fixed now: (1) three `natural` sessions on the floor F; (2) the task is usable only if the floor passes in at most one of three; otherwise it is not scored, and the sprint's comparison waits for a harder task; (3) the checks are frozen once F has run; (4) then three sessions each of K and S, `natural`, then `command`, F's three reused.

### Calibration result (2026-09-24)

Checks committed in `8a8c8d5` before the run. `bearingkit bench --task debug-01 --config-dir _build/profile/claude --branches F --runs 3`: **the floor passed in all three sessions**: `visible`, `root` and `kept` each 3 of 3, `regression` 0 of 3; 264,589 to 330,676 tokens, 27 to 32 seconds, 0.124 to 0.129 USD, 12 to 16 turns, 31 tools in every init event (`evals/results/2026-09-24-bench-debug-01-natural/`). Every session made the same root fix, read from its answer and its two `Edit` calls: `parseDate` through `Date.UTC`, `addDays` through `setUTCDate`; all three named the daylight-saving flaw of `daysBetween` unprompted. None took the tempting patch, none added a test, and one says it did not reproduce the failure before changing the code. All three report the suite passing in Los Angeles (two also in Auckland), but they ran it as `TZ=America/Los_Angeles node --test` through Git Bash, which does not pass such a value to `node` (checked on this machine: `TZ=America/Los_Angeles node -e …` resolves `Asia/Bangkok`, `TZ=UTC` resolves `UTC`); those runs were in UTC+7, and the claims were not verified by the sessions. The runner's hidden check, which sets the zone itself, is what shows the fixes hold there. By the protocol `debug-01` is **not scored**; K and S were not run.

Permissions held: every PowerShell call (six: one, three and two in F1, F2, F3) and one Bash call that began with `python3` (F3, a file edit with a `node -e` fallback) were refused by the host before running; the sessions went on with Bash and `node`.

With the three review tasks, four small tasks now show the same thing: Sonnet 5 with no plugin already does what the task measures (finds planted defects, including one outside the diff; stays off decoys; fixes a root cause over a tempting patch, in about thirty seconds). On such tasks a skill can only add cost, which `review-01` measured at 2 to 3 times the tokens. What is left to separate the branches is the owner's call (`docs/handoff/`): a realistic-size task, defects that only a run shows, a weaker model for the whole frame, or what the process asks for beyond the outcome (a regression test before the fix, a reproduction before the change, which none of the floor sessions made) scored as outcomes of their own.

## The frame on Haiku 4.5 (owner, 2026-09-24)

The owner's answer after four small tasks failed to separate the branches on Sonnet 5 (labels verbatim): benchmark direction "Thử Haiku, dừng task nhỏ (Recommended)"; `bk-review` cost "Reviewer chỉ khi diff lớn (Recommended)". This replaces answer 3 ("3 lượt, Sonnet") for this part of the frame only; the Sonnet results above stand. No new small task is built; the four fixtures are calibrated again on a floor of Haiku 4.5 (`--model haiku`; the model id each session ran is read from its stream's per-model usage and recorded).

Written before any Haiku session ran. Three `natural` floor sessions per task, rules and checks as frozen for each task (the `review-03` fixture had its offset defect fixed after its Sonnet calibration, rules unchanged). A task is usable on Haiku when:

| Task | Usable when |
|---|---|
| `review-01` | the floor passes (all three defects, no decoy) in at most one of three |
| `review-02` | at least one candidate stays: the floor found it in at most one of three |
| `review-03` | at least two of three floor sessions have a false outcome the script scored and the reading confirms |
| `debug-01` | the floor passes (`visible`, `root`, `kept`) in at most one of three |

For each usable task, three `natural` sessions each of K and S on Haiku follow, F's three reused; the `command` variant only if the quota allows. The kit is measured as it ships at that commit: its `bk-reviewer` agent is pinned to Opus whatever the session's model (compat B13), so a K session on Haiku is a Haiku session with an Opus reviewer. Results go to their own folders (`…-haiku`; the runner never writes into a folder that already holds a run).

### Calibration result on Haiku (2026-09-24)

Registered in `9d23b43`, then `bearingkit bench --task <id> --config-dir _build/profile/claude --branches F --runs 3 --model haiku` for each task (`evals/results/2026-09-24-bench-<task>-natural-haiku/`). Every Haiku session saw 35 tools (the Sonnet sessions saw 31), so Haiku tokens compare only with Haiku tokens.

| Task | Floor on Haiku | Read by eye | Usable |
|---|---|---|---|
| `debug-01` | passed 0 of 3: `visible` 3/3, `root` 0/3, `kept` 3/3, `regression` 0/3; 0.05–0.09 USD, 25–42 s | the checks decide, nothing to read | **yes** |
| `review-01` | passed 0 of 3: D1 3/3, D2 1/3, D3 0/3, X1 0/3; 0.08–0.13 USD, 69–107 s | confirmed: F2 and F3 name only an unhandled error of the logo fetch, not the prefix bypass; no session mentions the reminder job or `void` | **yes** |
| `review-02` | H1 1/3, H2 3/3, H3 2/3, X1 0/3; 0.09–0.10 USD | confirmed: F2 and F3 never mention the pay route | **yes**, scored set **H1** (the only candidate the floor found at most once) |
| `review-03` | no decoy flagged, no block, in any session; 0.19–0.24 USD, 199–244 s | nothing scripted to confirm | no |

So the Haiku floor misses what the Sonnet floor found: the defect outside the diff (`review-01` D3, `review-02` H1) and the root cause behind a tempting patch (`debug-01`), and it is still clean on the decoys. Three tasks go on to K and S on Haiku.

### Measured on Haiku (2026-09-24)

`bearingkit bench --task <id> --config-dir _build/profile/claude --branches K,S --runs 3 --model haiku` for `debug-01`, `review-01`, `review-02` (`…-natural-haiku-2/`), at `ae2f514` (the kit with the reviewer-when-needed rule of `bk-review`); the floor's three calibration sessions are reused, and the combined tables are rescored copies (`…-natural-haiku-kvsf/`). Every session ran `claude-haiku-4-5-20251001` and saw 35 tools. Natural prompt, three sessions per branch; with three runs only a large difference means anything.

| Task | What is scored | K kit | S sources | F floor | Cost USD, median K / S / F |
|---|---|---|---|---|---|
| `review-02` | H1, the pay route outside the diff (the scored set) | **3 of 3** | 1 of 3 | 1 of 3 | 0.134 / 0.041 / 0.095 |
| `review-02` | H2 and H3, not scored (the floor found them) | H2 **0 of 3**, H3 3 of 3 | H2 1 of 3, H3 3 of 3 | H2 3 of 3, H3 2 of 3 | |
| `review-01` | D1 / D2 / D3, X1 | 2 / 2 / 0 of 3, X1 0 | 3 / 2 / 1 of 3, X1 0 | 3 / 1 / 0 of 3, X1 0 | 0.141 / 0.084 / 0.104 |
| `debug-01` | `visible` / `root` / `kept` / `regression` | 3 / 0 / 3 / 0 of 3 | 3 / 0 / 3 / 0 of 3 | 3 / 0 / 3 / 0 of 3 | 0.109 / 0.096 / 0.069 |

Read by eye: the three K answers of `review-02` open with the pay route (`pay/route.ts:9`, `assertTenant` returning null) and none mentions the memo cache or `invoice-stats`; the S and F sessions that missed H1 never mention the pay route. What was invoked: K reached its own skill in all nine sessions (`bk-review` six times, sometimes the host's `/code-review` too; `bk-debug` three times, once followed by `bk-ship`), S reached `superpowers:systematic-debugging` three times and the host's `/code-review` or the `code-review` plugin's command in the six review sessions. No K session started an Opus reviewer (the diffs are small and not written by the session); one S session (`review-01` S2) started `pr-review-toolkit:code-reviewer` on Opus and is the only one of the nine `review-01` sessions that found D3.

What it says:
- *(Not confirmed at eight sessions per branch: see "More sessions on `review-02`, Haiku" below; H1 is 6 of 8 for the kit and for the floor, and H2 1 of 8 for the kit against 5 of 8 for the floor.)* **The first outcome difference for the kit:** on `review-02` the kit found the defect outside the diff in every session, its sources and the floor in one of three each. It is also the only task where the kit **lost** something the floor had: the tenant-less cache key (H2), which the floor found every time and the kit never. The kit trades one tenancy defect for the other on this task; its lens order or its hot-path focus may explain it, not established.
- `review-01` does not separate the branches; the one D3 came with an Opus reviewer.
- `debug-01` does not either: no branch fixed the root cause, and no session added the regression test that `bk-debug`'s gate asks for ("No 'resolved' without the regression test"), the kit's sessions included. That is the input for the `bk-debug` sprint.
- Cost: the kit costs 1.4 to 1.6 times the floor and 1.1 to 3.3 times its sources on Haiku (medians per task).
- So `bk-review` against its sources, on Haiku: "one task where the kit found more (3 of 3 against 1 of 3) and one where it found less (0 of 3 against 3 of 3 for the floor), three sessions each"; not a basis for "better". The next step is more sessions on `review-02` and a look at why the kit drops H2.

### More sessions on `review-02`, Haiku (owner, 2026-09-25: "Thêm lượt review-02, rồi tìm vì sao sót H2 (Recommended)")

Written before the sessions ran. Five more `natural` sessions per branch, K, S and F, interleaved, on Haiku, the kit at the commit of the run; with the first three, eight per branch. Reported per branch: H1, H2 and H3 found, out of eight, each count read against the answers by eye. A difference between two branches on one defect is called a difference only when the counts are at least four apart out of eight (for instance 7 against 3); anything closer reads "no clear difference". The first three sessions stay in the count as they are; nothing is rescored. After the runs, the K streams are read for where H2 goes: whether the kit's review reaches the stats endpoint and its memo call at all, and what it says about it.

#### Result (2026-09-25)

`bearingkit bench --task review-02 --config-dir _build/profile/claude --branches K,S,F --runs 5 --model haiku` (`…-review-02-natural-haiku-3/`), the kit at `ce9ca9f` (its `skills/` as at `ae2f514`); merged with the first three per branch and rescored in `…-review-02-natural-haiku-eight/` (the five later sessions renumbered as runs 4 to 8). Every session ran Haiku 4.5 and saw 35 tools; K reached `bk-review` in all eight.

| Defect | K kit | S sources | F floor | By the registered rule |
|---|---|---|---|---|
| H1, the pay route outside the diff | 6 of 8 | 5 of 8 | 6 of 8 | no clear difference |
| H2, the tenant-less cache key | **1 of 8** | 4 of 8 | 5 of 8 | **K below F** (4 apart); K and S 3 apart, no clear difference |
| H3, the bearer token in the log | 8 of 8 | 7 of 8 | 6 of 8 | no clear difference |
| X1, decoy | 0 of 8 | 0 of 8 | 0 of 8 | – |
| Cost USD, median (min–max) | 0.135 (0.084–0.152) | 0.09 (0.039–0.33) | 0.109 (0.085–0.181) | |

H2 was read by eye in every answer, not only scored: K4 is the one kit answer that names the shared `'invoice-stats'` key; S3, S4, S5, S8 and F1, F2, F3, F5, F7 name it too. The S session that started `pr-review-toolkit:code-reviewer` on Opus (S4) found all three.

**The first three sessions misled.** H1 at 3 of 3 against 1 of 3 was chance: the floor found H1 in all five later sessions. What stands at eight sessions is the opposite finding: on this task, on Haiku, the kit misses the tenant-less cache key more often than the floor does, at 1.2 times the floor's cost.

Where H2 goes (the K streams, read 2026-09-25): all three of the first K sessions read the stats route; K2 and K3 read `src/lib/memo.ts` in full, K1 only grepped its signature; and the forked review of K2 lists "**Memoization:** Correct usage with reasonable TTLs (60s for stats, 1h for FX)" among what it checked and found sound. So the kit's review reaches the cache and clears it. A hypothesis, not tested: the loader inside the memo call filters by `tenantId`, and the kit's pass that drops findings which "look like a bug and are not, once the surrounding code is read" (`bk-review/references/review-lenses.md`, "Not a finding") lets a weaker model take the scoped query for a scoped cache, next to `fx-rates`, a global cache that is correct. A change to the skill for it is text the model reads, so it is measured before commit on these same eight-session terms.

#### Control: the kit before `ae2f514` (registered 2026-09-25, before the sessions ran)

The eight K sessions above ran with the reviewer-when-needed rule of `ae2f514`, so none of them sent the hot path to `bk-reviewer`, which is pinned to Opus. Before that commit the same diff (tenant scoping, a hot path) would have gone to that reviewer, and the one session of the 24 that had an Opus reviewer (S4, `pr-review-toolkit:code-reviewer`) found all three defects. So the miss of H2 may come from the cost change, not from the kit's method. Control: eight `natural` K sessions on Haiku with step 3 of `skills/bk-review/SKILL.md` as it stood at `a307111`, set in the main checkout for the run only (never committed) and restored after it; F and S are not run again. Compared with the eight K sessions above, by the same rule (at least four apart out of eight): H2 first, H1 and H3 and X1 as guards, and cost. Read afterwards: whether `bk-reviewer` was dispatched in each session, and whether the H2 finding came from it.

Result (`evals/results/2026-09-25-bench-review-02-natural-haiku/`, the skill restored right after; `git status` clean):

| K on Haiku, eight sessions | H1 | H2 | H3 | X1 | Cost USD, median (min–max) | `bk-reviewer` (Opus) dispatched |
|---|---|---|---|---|---|---|
| step 3 before `ae2f514` (control) | 7 | **5** | 8 | 0 | 0.153 (0.093–0.484) | 2 of 8 (K3, K4) |
| step 3 of `ae2f514` (above) | 6 | **1** | 8 | 0 | 0.135 (0.084–0.152) | 0 of 8 |

By the registered rule the two differ on H2 (four apart): **on this task, on Haiku, the reviewer-when-needed rule of `ae2f514` probably costs the kit the tenant-less cache key**, and the control stands level with the floor (5 of 8). *Strength, added after the audit of 2026-09-25:* the four-of-eight rule is looser than a conventional test. Two-sided Fisher exact, 5 of 8 against 1 of 8 gives p = 0.119; pooled with the next run (same rule, a line only one session read) 5 of 8 against 3 of 16 gives p = 0.065; the first three sessions' 3 of 3 against 1 of 3, which turned out to be chance, gave p = 0.40 (`fisherExact` in `scripts/lib/bench-score.cjs`, tested in `tests/bench.test.cjs`). So this is a lead to act on with care, not a proof; the same caveat applies to "K below F" above (also 1 of 8 against 5 of 8). The Opus reviewer is not the whole story: it ran in two sessions and both found H2, but three sessions without it found H2 too (K2, K5, K7). A reading, not tested: the new sentence "otherwise this review is the independent one" lets a weaker model close its review sooner. On Sonnet, `review-01` kept its outcome under the change (section of `docs/specs/2026-09-24-bk-review-design.md`), but `review-01` has no defect of H2's kind.

#### A cache-key check in the security lens (registered 2026-09-25, before the sessions ran)

Candidate text, one item added to "Also check" in `skills/bk-review/references/security-lens.md`, on top of `ae2f514`, worded without this fixture's names: a cache, memo or module-level store the diff adds or changes, in multi-tenant or per-user code, carries the tenant or user in its key whenever what it holds depends on them; a tenant filter inside the loader does not scope the key; a key without the tenant is right only for data that is the same for every tenant, and the report says which. Measured on eight `natural` K sessions on Haiku, as above. Committed only if H2 reaches 5 of 8 or more (four above the 1 of 8 it replaces), X1 stays at 0 of 8 (the global `fx-rates` cache must not become a false finding), and neither H1 nor H3 falls by four or more; otherwise it is not committed, and the choice between this rule and step 3 before `ae2f514` goes to the owner, since the reviewer-when-needed rule was the owner's choice.

Result (`evals/results/2026-09-25-bench-review-02-natural-haiku-2/`): H1 4 of 8, **H2 2 of 8**, H3 8 of 8; cost 0.109 USD median. The script also scored X1 once (K8), but that item is the header log (H3) and names `fetchFxRates()` only as the call that fails, so by reading X1 is 0 of 8. H2 falls short of 5, so **the text was not committed** and the file was restored. Why it could not work: only one of the eight sessions opened `security-lens.md` (K3; the others ran the review from `SKILL.md` alone), so on Haiku a line in that reference barely reaches the model. What this measured is the kit as it would ship with the line, not the line itself.

#### Step 3 old and new on Sonnet (registered 2026-09-25, before the sessions ran; owner: "Tiếp tục xử lý theo khuyến nghị cho tôi.")

The Haiku evidence above is a lead (p = 0.119), and Haiku is not the owner's daily model, so step 3 is decided on Sonnet. Sixteen `natural` K sessions of `review-02` on Sonnet 5 (the runner's default model), in four blocks of four so that neither version runs only early or only late: new, old, new, old. New is step 3 of `ae2f514` as it ships (the kit at `3852480`, whose `skills/` are as at `ae2f514`); old is the line as it stood at `a307111`, set in the main checkout for its blocks only, never committed, restored after each, and `git status` checked clean after the last. S and F are not run again; the floor found H2 in 3 of 3 at calibration on Sonnet. Reported: H1, H2, H3 and X1 out of eight per version, each read by eye in the answers, not only by the script; the two-sided Fisher p for H2; cost median and spread; and in each session whether `bk-reviewer` was dispatched and whether the H2 finding came from it.

Decision rule, a threshold that favours quality (the protocol's tie-breaker), not a claim of significance:
- new finds H2 in 7 of 8 or more: keep `ae2f514`, and record Haiku as a known limit;
- new finds H2 in at least three fewer sessions than old: restore the old line, which the owner is told with the trade-off before it is committed, since the reviewer-when-needed rule was the owner's choice;
- anything else: keep `ae2f514` and measure more.

H1, H3 and X1 are guards: a version that finds H1 or H3 in three or more fewer sessions than the other, or flags X1 at all, has that reported against it.

## The runner

A new `scripts/bench.cjs` (verb `bearingkit bench`), not an extension of `scripts/evals.cjs`: that file scores routing, is already 512 lines, and shares only the helpers it exports (`parseArgs`, now exported, `parseQuota`, `quotaStop`, `authStop`, `ancestorMemoryFiles`). The old runner already takes `--plugin-dir none` for a floor, but only one plugin directory and no outcome score; the resume prompt of 2026-09-24 said the floor needed a runner change too, which was only half right. Before a run it checks that each source copy is the plugin named and sits at its pinned sha, and refuses a fixture with a memory file above it. The scorer is `scripts/lib/bench-score.cjs`. Tests first, red before green (`tests/bench.test.cjs`): branch to command line (plugin dirs and the inline settings), the matcher on written answers (found, missed, a decoy flagged, a decoy called safe), usage summed over models, median and spread, and the refusal to compare tokens across differing tool counts. Results go to `evals/results/<date>-bench-<task>.md` (untracked) with every scored answer beside it; the numbers that matter are copied into this file with the command that produced them.

## Questions for the owner, decided 2026-09-24 (labels verbatim)

1. `security-guidance`: "Bỏ ở task 1, đưa vào build-01 (Recommended)". It is out of the `review-01` bundle; `build-01` brings it in, and its Python hooks in the isolated profile are asked about again then.
2. Prompt: "Cả hai". Both variants run: `natural`, the one sentence for every branch; `command`, the same sentence behind each branch's own command. K names `/bearingkit:bk-review`. S names `/pr-review-toolkit:review-pr`, because `/code-review` of the `code-review` plugin reviews a GitHub pull request only (its allowed tools are `gh pr …` and `gh issue …`), and the fixture is a local branch with no remote; the other source plugins stay loaded. F has no command, so the `command` variant runs K and S only: 15 sessions for the task, 9 `natural` and 6 `command`.
3. Runs and model: "3 lượt, Sonnet (Recommended)".

Mechanism checked before the run (compat B1 to B4): in the isolated profile each branch loaded exactly its plugins, and all three saw 31 tools, so token totals compare. `bearingkit bench --dry-run` found the four source copies at the shas pinned in `upstream/sources.json`.

## Measured · `review-01`, 2026-09-24

Claude Code 2.1.281, isolated profile, Sonnet 5 for every session (the kit's `bk-reviewer` agent runs on Opus whatever the session's model, compat B13), 31 tools in every init event. Commands: `bearingkit bench --task review-01 --config-dir _build/profile/claude --variants natural --runs 3`, the same with `--variants command`, then `--rescore` on both folders with the final rules. Results and every answer: `evals/results/2026-09-24-bench-review-01-natural/` and `…-command/` (untracked). Five-hour window 48% before the first run and 66% after the second (the same window also carried the DB question of the migration and this session's own work, so the benchmark's share is below 18 points).

| Variant | Branch | Passed | Defects found | Decoys | Tokens total, median (min–max) | Fresh tokens | Cost USD | Seconds |
|---|---|---|---|---|---|---|---|---|
| natural | K kit | 3 of 3 | 3 | 0 | 795,055 (708,466–836,053) | 110,277 | 0.77 (0.59–0.77) | 161 (72–173) |
| natural | S sources | 3 of 3 | 3 | 0 | 383,709 (270,249–387,198) | 35,317 | 0.27 (0.18–0.29) | 75 (51–86) |
| natural | F floor | 3 of 3 | 3 | 0 | 181,677 (179,523–219,189) | 13,981 | 0.11 (0.10–0.12) | 38 (35–40) |
| command | K `/bearingkit:bk-review` | 3 of 3 | 3 | 0 | 577,098 (536,923–842,828) | 71,470 | 0.58 (0.46–0.59) | 129 (129–143) |
| command | S `/pr-review-toolkit:review-pr` | 3 of 3 | 3 | 0 | 177,407 (177,318–266,282) | 23,089 | 0.15 (0.15–0.16) | 47 (39–49) |

What it says:

- **Outcome: no difference.** All fifteen sessions found D1, D2 and D3 and none flagged the decoy, the floor included. The script's credit for D3, the one outside the diff, was read against each of the nine natural answers by eye: every one names the reminder job and the `void` status. So `review-01` does not separate the branches: Sonnet 5 with no plugin finds all three.
- **Cost: the kit loses.** With the same outcome, the kit spent 2.1 times the tokens of its sources on the natural prompt and 3.3 times on the command prompt (medians), 4.4 times the floor's; in cost, 2.9 and 3.9 times the sources' and 7 times the floor's. Part of it is the kit's design as it ships: `bk-review` forks and hands the hot path to `bk-reviewer` on Opus.
- **So on this task `bk-review` is not better than its sources; it costs more for the same result.** That is the finding to carry, not a reason to stop measuring: one easy task says nothing about defects the floor misses, which is where a review skill has to earn its tokens.

Where the kit's tokens go (per session, from each stream's per-model usage; `evals/results/…`, read 2026-09-24):

- **The independent reviewer on Opus**: 267k to 328k tokens in the natural K sessions and 195k to 467k in the command ones, 32 to 55% of the session's tokens and 50 to 66% of its cost. `bk-review` hands a hot-path diff (tenancy, deletion, outbound fetch: all three here) to `bk-reviewer`, which is pinned to Opus (`agents/bk-reviewer.md:4`). The source's own reviewer agent is pinned to Opus too (`pr-review-toolkit/agents/code-reviewer.md`, `model: opus`), but `review-pr` chose not to start any agent on a diff it judged small, and the host's `/code-review` ran inline.
- **The method itself, on Sonnet**: 429k to 569k tokens in the natural K sessions against 270k to 387k for S and 180k to 219k for F. The fork made 14 to 33 tool calls (F: 4 to 9), read three or four kit references (`review-lenses.md`, `code-review-exchange.md`, `security-lens.md`, once `evidence.md`), and read more of the code around the diff. Each call re-reads the whole context, so cache reads grow with every call.
- **Refused calls**: 6 to 8 per natural K session (listing its own folder, tools the background reviewer may not ask for, compat B12); each is a wasted turn. The command K streams do not show the fork's calls at all, so their refusals cannot be counted.
- **What the tokens bought, unscored**: the kit's answers list more items (natural 13 to 15, command 15 to 26) than S (7 to 10, 18 to 22) and F (6 to 11). Whether those extra items are real defects, noise or false findings is not scored: the rules check the three planted defects and one decoy only. A harder task (below) is the way to learn whether the extra method finds what the floor misses.
- The rules were widened (D1's tenant words, X1's "safe" words) after the first run, on the pre-run review's advice; the rescore changed no session's outcome (the run's own scoring had the same 15 of 15).

Read with it:

- **The natural prompt never reached a source skill.** In all three S sessions the model invoked the host's own `/code-review` (listed bare in every branch, compat B10), not a plugin's. The natural S row measures the host's built-in review with the source plugins loaded.
- **`/pr-review-toolkit:review-pr` ran but skipped its agents.** The command expanded (the model ran its `gh pr view` step), then decided the diff was small and reviewed it inline. That is the released command's own behaviour.
- **The kit's fork was refused tools** in the isolated profile: listing its own folder, and PowerShell and Glob for the background reviewer (compat B12). It finished anyway; whether it would cost less or find more with them is not measured.
- The independent review before the run noted that D1 to D3 match the lenses `bk-review` took from `security-guidance`, which S does not load. With the floor finding all three, that advantage did not show.
- One session (K1, natural) was woken by its background reviewer after its first answer; durations and turns are summed over its two result events (compat B11). A K command session reports 0 turns because the whole review ran inside the fork.

Next for this skill: a harder `review-02` whose difficulty is calibrated on the floor first. Candidate defects run three times on F, and a defect enters the task only if the floor misses it in at least two of three; then the three branches run. Until then, `bk-review` against its sources reads "compared on one task: equal outcome, 2 to 3 times the tokens". (Done the same day: `review-02` failed its calibration, the floor found every candidate; see "Task 2".)
