# Stack files `node.md` and `python.md`: design and registered measurement (2026-09-26)

Item 7 of the v0.3 order, first half (`docs/plans/2026-09-26-v03-roadmap.md`, session P3). Split by the owner into **P3a** (this session, cloud: design and text, no measurement) and **P3b** (the owner's machine: fixtures, calibration, guard or full comparison). The owner's instruction for P3a, verbatim: "Phiên P3a của Bearingkit, chạy trên cloud: chỉ thiết kế và viết chữ, không đo. […] Việc: hai file stack node rồi python cho bk-build, theo docs/plans/2026-09-26-v03-roadmap.md. Viết thiết kế trong docs/specs/ gồm phép đo đăng ký trước (task, chỉ số, ngưỡng guard, Sonnet 5; phiên đo của task Python được chạy python -m pytest), cho một agent Sonnet chỉ đọc rà thiết kế và chữ; mỗi câu trong chữ phải có dòng nguồn đỡ, không viết theo fixture."

**Status of the text.** `skills/bk-build/references/stacks/node.md` and `python.md` are written on branch `claude/serene-franklin-3f3bb7`, not on `main`. Under the rule "measure before committing text the model reads", they reach `main` only after P3b's measurement passes the bar registered below. No fixture exists yet: this document registers the tasks before any fixture is built or any session runs.

## Inputs

**Rows.** `docs/specs/2026-09-26-bk-build-idea-classification.md` buckets 26 `idea` rows to `node` and 22 to `python`. Their sources, and what this session could read:

| Source (pin in `upstream/sources.json`) | Licence mode | Rows `node` | Rows `python` | Read in P3a |
|---|---|---|---|---|
| jeffallan/claude-skills `5e8b6b8` | MIT, reference | 586, 607, 642 | 623 | yes, shallow fetch at the pin |
| cloudflare/skills `b052c32` | Apache-2.0, reference | 769 | — | yes, at the pin |
| c0x12c/ai-toolkit (Spartan) `96b2c9d` | none, ideas only | — | 928–932 | yes, at the pin; paraphrased, nothing quoted |
| PatrickJS/awesome-cursorrules `b044f95` | CC0-1.0, reference | 1161 | 1162 | yes, at the pin |
| tuyenht/Antigravity-Core `1774280` | owner's own, adapt | 21 rows (1370–1538) | 15 rows (1385–1523) | **no**: `git fetch` of the pinned sha answered "not our ref" |

So the text rests on **5 of 26** `node` rows and **7 of 22** `python` rows. The Antigravity-Core rows are unread, not rejected. That the pinned sha cannot be fetched is itself a finding: either the history was rewritten after 2026-09-18 or the pin is wrong. P3b reads those rows from the owner's local clone (Sonnet agent, same brief), and any sentence they add goes through the same review before any guard session; if the local clone is not at the pin either, the owner is asked (COUNCIL: it is another repository).

**Reading.** Two Sonnet agents, read only, brief forbidding background commands and any search outside the repository and the fetched sources, produced candidate tables (41 rows for `node`, 58 for `python`), each with a `path:line` and a short quote. The main session opened every line cited below and checked it against the quote. The tables are untracked (`scratchpad`), so the part that matters is copied into the provenance tables of this document.

**Decisions taken in reading, with reasons.**
- The inventory's own last column is binding: a rule it does not name for carrying is not carried (for example `cli-developer`'s exit-code table and its 50 ms startup target, row 586; `javascript-pro`'s "no synchronous I/O", row 607).
- `javascript-pro`'s catch, log and `return null` sample (`SKILL.md:71-82`) is the inverse of what `node.md` says; the inventory rejects it (row 607), and Cloudflare's explicit-error rule (`runtime-patterns.md:290-296`) agrees with the rejection.
- `typescript-pro`'s "`Annotated` pattern" line (`SKILL.md:121`) is a Python leftover (row 642) and is not carried.
- Cloudflare's constant-time comparison names Web Crypto's `crypto.subtle.timingSafeEqual` (`runtime-patterns.md:253`). `node.md` names Node's own `crypto.timingSafeEqual`: the rule is sourced, the Node API name is the kit's adaptation, stated here.
- awesome-cursorrules `es-module-nodejs-guidelines` says "Use ES module syntax" (`:21`). Not carried: the kit repo itself is CommonJS, and `javascript-pro` says to follow the project's module system (`SKILL.md:29`, `:62`).
- awesome-cursorrules `python.mdc:29` prefers `Optional[Type]`; `python-pro` (`SKILL.md:59`) and Spartan (`PYDANTIC.md:109`) prefer `X | None`. Two sources against one; `python.md` follows the two.
- `python-pro`'s timeout sample returns `{"error": "timeout"}` (`async-patterns.md:256-261`); Spartan forbids returning error dicts (`ERROR_HANDLING.md:94`). `python.md` carries the deadline and the "raise, do not return an error dict" rule, not the sample's return.
- Framework layering (Router → Service → Repository), URL style, error-response shape and one project's package list are the project's own conventions (Spartan `ENDPOINTS.md`, `ERROR_HANDLING.md:5-13`; awesome-cursorrules `fastapi-production-architecture`, `python-312-fastapi…`) and stay out, as `kotlin.md` keeps framework conventions out.

## Provenance: every sentence and its source line

Paths are relative to each source's root at its pin. "Kit" means a line of this repository. A sentence with two sources needs both only where marked "+".

### `node.md`

| Section, sentence (short) | Source line |
|---|---|
| Version card | kit `package.json` (`engines.node >=20`, `scripts.test`); `node scripts/detect-stack.cjs .` run 2026-09-26: `javascript`, no framework, `npm`, guardrail `npm test` |
| Framework conventions come from the project; with React, `typescript-react.md` | kit `stacks/kotlin.md:5`, `stacks/index.md:7` |
| No floating promise: dropped result, swallowed error, unfinished | cloudflare `skills/workers-best-practices/references/runtime-patterns.md:219` |
| Run an existing floating-promise lint rule; adding one is a separate change | same, `:221` |
| Concurrency has a bound: a queue with a maximum in flight | jeffallan `skills/javascript-pro/references/async-patterns.md:189-192`; inventory line 607 |
| Every network call has a deadline, via `AbortController` | same file `:9` (`fetchWithTimeout`), `:258-265` |
| No catch, log and `null`; the error propagates or is returned as an error to handle | inventory line 607 (rejects `javascript-pro/SKILL.md:79-82`); cloudflare `runtime-patterns.md:290-296` |
| Module scope is shared; request state through arguments | cloudflare `runtime-patterns.md:188-192`; inventory line 769 ("rules any Node host shares") |
| Unbounded body streamed; small known-size payload fine | cloudflare `runtime-patterns.md:15`, `:17` |
| Constant-time comparison, hashed to the same length, no early return | cloudflare `runtime-patterns.md:253`, `:255`; Node API name: kit adaptation (above) |
| One module system per file; follow `type` and extensions | jeffallan `javascript-pro/SKILL.md:62`, `:29`; "rather than converting": kit `skills/bk-build/SKILL.md:16` |
| A package not in `package.json` is checked before import | awesome-cursorrules `rules/nestjs-anti-hallucination-cursorrules-prompt-file.mdc:251` |
| Data to stdout, the rest to stderr | jeffallan `skills/cli-developer/SKILL.md:81` |
| Colour only when `process.stdout.isTTY` | same, `:82-86` |
| Non-interactive path for every prompt | same, `:98` |
| Renamed flag or subcommand is breaking | same, `:97` |
| `typescript-react.md`'s type rules apply | kit `stacks/typescript-react.md:19-20` |
| Exhaustive `switch` through `never` | jeffallan `skills/typescript-pro/references/type-guards.md:82-97` |
| Branded IDs | jeffallan `typescript-pro/SKILL.md:118` |
| `satisfies` over `as` | same, `:119`; inventory line 642 |
| `noUncheckedIndexedAccess` in a strict config; enabling it is its own change | jeffallan `typescript-pro/references/configuration.md:23` + kit `skills/bk-build/SKILL.md:16` |
| Evidence: full output, red before green | kit `skills/bk-build/SKILL.md:17`, `:28`; `stacks/kotlin.md:23` |
| Guardrails | `detect-stack` on `tests/fixtures/stacks/node-eslint-prettier`, `node-biome` and this repository, run 2026-09-26; kit `stacks/typescript-react.md:34` |

### `python.md`

| Section, sentence (short) | Source line |
|---|---|
| Version card: 3.11 floor | jeffallan `skills/python-pro/references/async-patterns.md:34` (TaskGroup 3.11+); Spartan `toolkit/rules/python-fastapi/ASYNC.md:113-117` (`datetime.UTC`, 3.11+); `X \| None` 3.10+: `python-pro/SKILL.md:59` |
| Version card: fixtures | `detect-stack` on `tests/fixtures/stacks/python`, `python-black-mypy`, `python-pyright`, run 2026-09-26 |
| Project conventions stay out | kit `stacks/kotlin.md:5`; decisions above |
| Tasks belong to a `TaskGroup`, all done when the block exits | jeffallan `python-pro/references/async-patterns.md:34-47` |
| Fan-out bounded by a semaphore; bare `gather` starts all | same, `:190-197` (semaphore); `:22-24` (the unbounded `gather` sample); inventory line 623 ("gather sample has no bound") |
| Await outside the process has a deadline, `asyncio.timeout` | same, `:256-261` |
| Blocking call in `async def` blocks the loop; `requests`, sync driver; `run_in_executor` | Spartan `ASYNC.md:23-27`, `:124-128`; jeffallan `async-patterns.md:333-336`, `SKILL.md:67` |
| No mutable default; Pydantic field exception | jeffallan `python-pro/SKILL.md:66`; Spartan `PYDANTIC.md:108` |
| No bare `except`, no `except: pass` | jeffallan `SKILL.md:69`; Spartan `ERROR_HANDLING.md:93` |
| Expected failure raises, not an error dict; layers between propagate | Spartan `ERROR_HANDLING.md:84-89`, `:94`, `:95` |
| `datetime.now(UTC)`, not `utcnow()` | Spartan `ASYNC.md:113-120`, `:128` |
| No secret or configuration literals | jeffallan `SKILL.md:70` |
| Public functions annotated; `X \| None` | jeffallan `SKILL.md:55`, `:59`, `:65`; Spartan `PYDANTIC.md:109` |
| `Mapping` read-only, `dict` mutable | jeffallan `references/type-system.md:24-25` |
| `assert_never` on a `Literal` | same, `:276-284` |
| Type checker at the project's strictness, errors not silenced | jeffallan `SKILL.md:68`, `:151-159`; inventory line 623 ("mypy at project strictness") |
| Pydantic v2 `ConfigDict(from_attributes=True)`; moving between majors is `major-upgrade.md` | Spartan `PYDANTIC.md:91`, `:110`; kit `skills/bk-build/SKILL.md:11` |
| `asyncio_mode = "auto"` or async tests skip or fail | Spartan `TESTING.md:3-10` |
| `httpx.AsyncClient` + `ASGITransport`, not `TestClient` | Spartan `TESTING.md:23-38`, `:152` |
| No module-level shared state between tests | Spartan `TESTING.md:154` |
| Integration tests on a real test database | Spartan `TESTING.md:155` |
| Evidence: full output, red before green | kit `skills/bk-build/SKILL.md:17`, `:28` |
| Guardrails | kit `scripts/detect-stack.cjs:143-147`; fixture runs above |

Kit additions with no upstream line: the Node API name `crypto.timingSafeEqual` (above), and nothing else. If the reviewer finds another, it is either sourced or removed before P3b.

## Measurement, registered before any fixture or session

There is no precedent for measuring a stack file with sessions: the three files so far were only checked against fixtures. The design follows `build-01` (`docs/specs/2026-09-26-bk-build-design.md`): one task per file, the floor calibrated first, then either the full comparison or a guard.

**Why a task is needed at all.** A stack file changes behaviour only if (1) the session reaches it — `bk-build` must be invoked and must open the file through `index.md` — and (2) the model would not do what the file says anyway. Both are measured: (1) by tool calls, (2) by the floor.

**Hazard selection.** Each task scores three hazards. Each hazard is a sentence the file already contains (the file was written first, from the sources, before any task existed), and each is checked by running the session's final code, not by reading it. Hazards chosen are the ones a script can check without judging style:

| Task | Hazard | Sentence in the file |
|---|---|---|
| `node-01` | N1 bounded concurrency | "Concurrency has a bound." |
| `node-01` | N2 data only on stdout | "Data to stdout, everything else to stderr." |
| `node-01` | N3 network deadline | "Every network call has a deadline." |
| `py-01` | Y1 bounded fan-out | "Fan-out has a bound." |
| `py-01` | Y2 deadline | "An await on anything outside the process has a deadline" |
| `py-01` | Y3 zone-aware timestamp | "Timestamps carry their zone" |

This is the limit of the design, stated now: the tasks test whether the text's rules are applied where they apply, not whether the file helps on arbitrary work.

### Task `node-01`

**Fixture** `evals/bench/node-01/`, built by `build.cjs` in the pattern of `build-01`, at `C:/Projects/.bearingkit-evals/bench/node-01`. A small stock CLI shaped like this repository: CommonJS, no dependencies, `package.json` with `engines.node >=20` and `"test": "node --test"`. `bin/stock.cjs show <sku>` prints one item; `src/client.cjs` exposes `getItem(sku)`, which calls the global `fetch` on `${process.env.STOCK_API_URL}/items/<sku>` and throws on a non-2xx status. The existing suite starts a local `node:http` server in the test and covers `show`. `detect-stack` must report `javascript`, no framework, guardrail `npm test` (checked by the fixture test).

**Prompt**, the same for every branch: "Add an export command to our stock CLI: `node bin/stock.cjs export <file>` reads SKUs from the file, one per line, fetches each one from the stock API, and prints them all as one JSON array. Our nightly job pipes the output straight into another program. Real files have about 2,000 SKUs. You have my go-ahead to make the change without stopping to ask."

**Permissions**, every branch: edits inside the fixture; `node`; `npm test`, `npm run test`; read-only `cat`, `ls`, `grep`, `head`, `tail`; read-only `git` (as `build-01` after the owner's widening).

**Scored after the session, by the scorer's own harness** (a `node:http` server it starts, with `STOCK_API_URL` pointed at it; each response delayed 20 ms; it counts requests in flight):

| Id | Kind | What | How |
|---|---|---|---|
| **N** | **primary** | N1 + N2 + N3, 0 to 3 per session | sum of the three below |
| N1 | hazard | Bounded: peak requests in flight are the same for a 200-SKU and a 400-SKU file, and below 200. A sequential loop (peak 1) passes: it is bounded, and the file asks for a bound, not for speed | two runs of `export`; the server's peak counter, also reported per branch as a class: 1, 2–199, or unbounded |
| N2 | hazard | Data only on stdout: with one SKU answering HTTP 500 in a 20-SKU file, stdout is empty or parses as JSON as a whole | one run; `JSON.parse` of stdout. Whatever the session chose to do with the failure (abort, skip, include an error entry) passes if stdout stays parseable |
| N3 | hazard | Deadline: with one SKU that never answers in a 20-SKU file, the process exits on its own within 60 s | one run, killed at 90 s; exit before 60 s passes |
| O1 | outcome | Happy path: 200 SKUs, all answering, give exit 0 and a JSON array whose `sku` values are the file's set | one run |
| O2 | outcome | Green: the session's suite passes on its final tree | `node --test` in the fixture |
| X | control | Non-zero exit when one SKU failed (N2's run) — not in `node.md`, reported to tell a general gain in care from the text's effect | same run |
| R | reach | `bk-build` invoked; `stacks/node.md` opened; `index.md` opened; `detect-stack` run or refused | stream |
| P4 | process | Files touched outside `bin/`, `src/`, `test/`, `tests/`, and a root notes file | `git status` |
| P5 | process | Commit attempts (definition of `docs/specs/2026-09-25-bk-debug-design.md:126`) | stream |
| C | cost | USD, API calls, tool calls, seconds | stream |

The scorer calls `export` exactly as the prompt spells it. A session that changes the invocation (`--file`) fails O1, N1, N2 and N3 alike; that is read by eye and reported, not re-scored.

### Task `py-01`

**Fixture** `evals/bench/py-01/`, same pattern, at `C:/Projects/.bearingkit-evals/bench/py-01`. A small stock package: `pyproject.toml` declaring `requires-python = ">=3.11"` and pytest only (no other dependency; the machine has pytest, and the fixture must not need a network install); `stock/client.py` with `async def get_item(sku)`, a minimal HTTP GET over `asyncio.open_connection` to `STOCK_API_URL`, raising on a non-2xx status; `stock/__main__.py` with `show <sku>` through `asyncio.run`; a pytest suite that starts a local `http.server` in a thread and covers `show` with synchronous tests (no pytest-asyncio needed). `detect-stack` must report `python`, framework `pytest`, guardrail `pytest` (checked by the fixture test).

**Prompt**, every branch: "Add an export command to our stock tool: `python -m stock export <file>` reads SKUs from the file, one per line, fetches each one from the stock API, and prints them all as one JSON array, each record with the time it was exported. Real files have about 2,000 SKUs. You have my go-ahead to make the change without stopping to ask."

**Permissions**, every branch: edits inside the fixture; `python -m pytest` (the owner's exception for measured sessions of a Python task: "Cho Python trong phiên đo (Recommended)", handoff `2026-09-26-p2-bk-build-guard.md`, Block 2); `node` (for `detect-stack`, which is Node); read-only `cat`, `ls`, `grep`, `head`, `tail`, `git`. Not `python` in general: a session that wants to run the command itself is refused, as `npm` was in `build-01`'s calibration, and P1-style refusals are read by eye.

**Scored after the session**, by the same kind of harness (Node server, delay 20 ms, in-flight counter), running `python -m stock export <file>`:

| Id | Kind | What | How |
|---|---|---|---|
| **Y** | **primary** | Y1 + Y2 + Y3, 0 to 3 | sum |
| Y1 | hazard | Bounded: peak in flight the same for 200 and 400 SKUs, and below 200 | as N1 |
| Y2 | hazard | Deadline: one SKU never answers in a 20-SKU file; the process exits on its own within 60 s | as N3 |
| Y3 | hazard | Zone: in O1's output, every record's export time is a number (epoch) or an ISO 8601 string with an offset or `Z` | parse; a naive ISO string fails. A session that adds no export time fails Y3 and O1 |
| O1 | outcome | 200 SKUs give exit 0, a JSON array with the file's set of `sku` values, each with an export time | one run |
| O2 | outcome | Green: `python -m pytest` passes on the session's final tree | run |
| X | control | With one SKU answering 500, stdout still parses as JSON — `python.md` has no stdout rule, so this is the control here | one run |
| R, P4, P5, C | as `node-01` | `stacks/python.md` opened | stream, `git status` |

**Needs the owner before it can be built (COUNCIL).** The scorer (O1, O2, Y1–Y3, X) and the fixture test (red, then green on a reference port, in `tests/`) must run `python -m pytest` and `python -m stock` on the fixture. The owner's exception covers the measured sessions only, and the rule says the main session runs no Python. Recommended: extend the exception to the `py-01` scorer and its fixture test, on the fixture only, through `python -m`. Rejected: a static scorer (grep for `Semaphore`, `timeout`, `UTC`), which scores words, not behaviour, and would pass a semaphore that never bounds anything. Without the extension, `py-01` is not built and `python.md` stays on the branch. **Decided 2026-09-26: yes** (question 35 (1) of `docs/specs/2026-09-12-d5-owner-questions.md`, owner verbatim: "Đồng ý cả ba khuyến nghị."); `py-01` runs in P3c, after `node-01` in P3b (question 35 (3)).

### Branches, calibration, and the bar (both tasks)

- Model **Sonnet 5**, `natural` variant only, runs interleaved, as every sprint so far.
- **F**: no plugin. **S**: the sources as they ship, pinned — `fullstack-dev-skills` (jeffallan/claude-skills at `5e8b6b8`; it carries `javascript-pro`, `typescript-pro`, `cli-developer`, `python-pro`) and, for `node-01` only, `cloudflare` (cloudflare/skills at `b052c32`). Spartan is not a plugin and awesome-cursorrules ships Cursor rules, not skills; neither can be loaded as shipped, so S omits them and says so. The runner checks each copy against the pin; `--dry-run` must list them before any session. **K-before**: the kit on `main` (no `node.md`/`python.md`; `index.md` says "not written yet"), run from a worktree of `main`. **K-after**: the kit on this branch.
- **Calibration**: three F sessions per task. The task is **usable** if N (or Y) is at most 1 in at least 2 of 3 sessions — room for the text to show — and O1 holds in at least 2 of 3 (the task is doable). Refused commands are read by eye before the verdict (lesson of `build-01`: a refusal is not the process).
- **If usable**: F (the three plus five), S, K-before and K-after, eight each. **Primary**: N (Y) for K-after against K-before, by the exact two-sided permutation test (`permutationTest`, `scripts/lib/bench-score.cjs:162`). **Merge rule for the file**: K-after above K-before with p ≤ 0.05; O2 at least 7 of 8 for K-after; O1 for K-after not below K-before. Otherwise the file stays on the branch and the owner decides. **Against the sources**: K-after against S by the same test; "better than its sources on `node-01` (`py-01`), Sonnet" only at p ≤ 0.05, otherwise "no clear difference".
- **If not usable (guard)**, as in `build-01`: eight K-after sessions. The file is merged only if O1 and O2 are each at least 7 of 8, and N (Y) at its median is not below the floor's calibration median. Everything else is reported with no bar and no "better".
- **Reported with no bar** in both paths: each hazard per branch, X, R (how many sessions reached the file — if K-after opens it in fewer than half, the result says the file was not read and is not evidence about its text), P4, P5, cost median and spread, and the skill each session invoked.
- **Budget.** Read `get_usage` before each batch; the runner stops at 90%. Per task: 3 calibration, then 5 + 8 + 8 + 8 = 29 (full) or 8 (guard); both tasks full is 64 sessions. On earlier Sonnet tasks a session cost 0.11 to 0.77 USD at the median by branch. Recommended: P3b runs `node-01` only, and a P3c runs `py-01`, each in its own session (roadmap lesson: a long session costs more than its measurements).

**Rejected, with reasons.**
- Checking the files against fixtures only, as the three earlier files were. The owner's instruction for this session asks for a registered measurement, and the rule "measure before committing text the model reads" applies to every file under `skills/`.
- One task for both files. The two files share no hazard wording, and a mixed-language fixture would test routing through `index.md` more than either text.
- Scoring by grep of the diff. It rewards the vocabulary of the text, which is what "không viết theo fixture" guards against from the other side.
- A command variant (`/bearingkit:bk-build …`). The natural prompt records whether the kit reaches the file at all, which is half of what a stack file's value depends on.

**Limits, stated now.**
- Two small planted fixtures, three hazards each. A pass says the rules transfer where a task exercises them.
- The text was written before the tasks, from the sources, so the tasks cannot have shaped it; the tasks were then chosen from the text's rules, so they measure the text on its own ground.
- **Reach is the weak link.** In 48 earlier kit sessions on Sonnet, `detect-stack` was not called in 19 and refused by the profile in 12 (`docs/handoff/2026-09-26-p1-bk-build-design.md`). `SKILL.md` also points at `references/stacks/` directly, so the file can be reached without the profile, but nothing guarantees it. R is reported so that a null result caused by the file never being read is not taken as a verdict on its text.
- The protocol reaches K only (as in `build-01`); the prompt pre-approves the change.
- N2 is partly cued by the prompt ("pipes the output straight into another program"); every branch reads the same prompt, and the calibration shows whether the cue alone saturates it.

## Independent review

Before any fixture is built, a Sonnet reviewer that wrote none of this reads this document and both files. It changes no file and runs no session and no Python. It checks: a sentence with no source line or a source line that does not say what the sentence says; a sentence written for a task rather than from a source; a metric the floor trivially passes; a scorer rule a correct session could fail; unequal branches; unverified claims. Findings are weighed on evidence and recorded below with what changed.

### Review result (2026-09-26, Sonnet, read only)

The reviewer changed no file, ran no Python and no session, and opened every cited line in the fetched sources. It confirmed: every sentence of both files has a line that says what the sentence says; no Spartan text is quoted near verbatim; no sentence carries a task noun; the counts (26 and 22 rows, 21 and 15 unread Antigravity-Core rows, 19 and 12 of 48 for `detect-stack`) match their sources; the permutation test takes 0–3 sums; branches are equal apart from what is disclosed; the `py-01` Python question is rightly COUNCIL. Verdict: not ready until two changes.

| Finding | Severity given | Weighed | Change |
|---|---|---|---|
| "a bare `asyncio.gather` … starts them all at once" was cited to the semaphore sample (`async-patterns.md:190-197`), not to the unbounded `gather` sample | should-fix | Correct | Provenance row now cites `:22-24` as well |
| N1 and Y1 pass a fully sequential loop (peak 1), so they may not show whether the rule was applied; proposed a floor of peak ≥ 2 | should-fix | Real risk to discrimination, rejected as a fix: the file says "a bound", not "concurrent". Requiring peak ≥ 2 would score a rule the text does not contain, which is writing the measurement for a behaviour rather than for the text | N1/Y1 kept; sequential passes by registration. The peak is reported per branch as a class (1, 2–199, unbounded), so a floor that passes by staying sequential is visible. If the floor is sequential in 2 of 3 calibration sessions, the calibration verdict says N1 (Y1) cannot discriminate on this task |

The design is registered as above. P3b builds the `node-01` fixture and its test next; `py-01` waits for the owner's answer on Python in the scorer.
