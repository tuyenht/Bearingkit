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
| tuyenht/Antigravity-Core `1774280` | owner's own, adapt | 21 rows (1370–1538) | 15 rows (1385–1523) | not in P3a: the pin exists only in the owner's local repository (`upstream/sources.json`: "the public remote has only the older 1c744167"), so a fetch from GitHub answered "not our ref", as expected; **read in P3b** from `_build/upstream/tuyenht_Antigravity-Core`, `git rev-parse HEAD` = `1774280ee0d5…` |

In P3a the text rested on **5 of 26** `node` rows and **7 of 22** `python` rows; the Antigravity-Core rows were unread, not rejected. **P3b examined all 36** (below, "Antigravity-Core in P3b", which states how: six files in full, the rest by headings plus a scan of their rule-shaped lines). (Corrected after the review, before any fixture or session: the first version of this paragraph called the failed fetch a finding — history rewritten or a wrong pin. `upstream/sources.json` already says why: the pinned commit was fetched on 2026-09-18 from the owner's local repository into `_build/upstream/tuyenht_Antigravity-Core`, and the public remote never had it.) P3b reads those rows from that copy (Sonnet agent, same brief), after checking with `git -C _build/upstream/tuyenht_Antigravity-Core rev-parse HEAD` that it is at the pin; any sentence they add goes through the same review before any session. If the copy is missing or not at the pin, the owner is asked (question 35 (2)).

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

**Antigravity-Core in P3b.** A Sonnet agent (read only, same brief) examined the 36 rows from the local copy at the pin and reported, per row, what it carries against both files; the main session opened every line cited for a sentence. **Method, corrected after the session's own audit:** the agent read six sources in full (`javascript-es2024.md`, `python/async-programming.md`, the `SKILL.md` of `nodejs-best-practices`, `python-patterns` and `typescript-expert`) and two by section (`strict-mode.md` §7–8, `design-patterns.md` branded types); the other files (31,329 lines of rules in all) it judged by their headings. The main session then scanned those files for rule-shaped lines (`never`, `always`, `avoid`, `don't`, `❌`, `⚠`, … — 139 lines) and read each file's "Best Practices" checklist: tool and library choices (Typer, Rich, Polars, uv, pino…), framework and API conventions, and one more source for a sentence already added (`backend-frameworks/express.md:959`, "Avoid synchronous operations"); nothing new within scope. A line of prose outside those patterns and sections was not read; that is the limit of this pass. 31 rows carry nothing within the files' scope (framework or API-design conventions — Express, NestJS, GraphQL, gRPC, SSE, WebSocket, FastAPI, Flask, Django —, one project's layout, ORM or library catalogues, i18n, packaging), and one (1456, branded IDs) is already covered. Four sentences are added, each in the provenance tables below: `node.md` wrapped error keeps its `cause` (row 1471), nothing blocks the event loop on a request path (row 1515), non-null assertion replaced by a guard or a throw (row 1464); `python.md` `CancelledError` re-raised (row 1437). Rejected: `asyncio.shield` for operations that must finish (row 1437, `async-programming.md:528-548`): a technique for a narrow case whose misuse is itself a pitfall, not a rule every project shares. No candidate conflicted with a sentence already written. The four additions went through the P3b independent review (Sonnet, read only) before any session: it opened each cited line and the inventory row, and found each says what its sentence says, none written for the task, none quoted near verbatim.

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
| A wrapped error keeps the original as its `cause` (P3b) | antigravity-core `.agent/rules/web-development/core/javascript-es2024.md:416-421` (sample), `:488` ("Preserve error causes"); inventory line 1471 |
| In a process serving requests, nothing on the request path blocks the loop; sync call such as `fs.readFileSync`, or CPU-heavy work; async API or off the loop (P3b) | antigravity-core `.agent/skills/nodejs-best-practices/SKILL.md:282-285`, `:385`; inventory line 1515; also `.agent/rules/backend-frameworks/express.md:959` (found in the audit scan) |
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
| Non-null assertion `!` replaced by a guard or an explicit throw (P3b) | antigravity-core `.agent/rules/typescript/strict-mode.md:1015-1033`; inventory line 1464 |
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
| A caught `CancelledError` is re-raised after cleanup (P3b) | antigravity-core `.agent/rules/python/async-programming.md:509-516`; inventory line 1437 |
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

**As built in P3b** (`evals/bench/node-01/`, test `tests/bench-node-01.test.cjs`). Three details the table leaves open, fixed before any session: (1) N2, N3 and X count only where the export actually requested the SKU that fails or hangs — without this, the untouched fixture (no `export`: a usage line on stderr, exit 2 at once) passed N2 and N3; N1 likewise needs every distinct SKU requested in both runs. `reach()` reads the skill name from `skill`, `name` or `command`, as `invocations()` does. Both points came from the independent review of P3b (Sonnet, read only); its note that the read-only commands are not path-scoped (a session could read the scorer outside the fixture) is inherited unchanged from `build-01` and is read by eye in the streams. (2) O1 is read from N1's 200-SKU run (the same file, every SKU answering) rather than a separate run. (3) `check()` is async, since the stand-in server runs in the scorer's own process; the runner now awaits it (`scripts/bench.cjs`), which changes nothing for a synchronous check. R is read by `reach()` in `scripts/lib/bench-score.cjs` (an open is a `Read`, `Grep` or shell command naming the path; a `Glob` listing is not). The test builds the fixture and checks, at shrunk sizes and times: untouched green with N = 0; a sequential port with no deadline passes N1 and N2 and fails N3; a `Promise.all` port fails N1 (class "unbounded"); a pool of 8 with a 1 s deadline passes all three and X; the same with a deadline beyond the scorer's limit fails N3 without being killed; one progress line on stdout fails N2 and O1. Four mutations of the scorer (N1 ignoring the peak, N2 ignoring stdout, N3 ignoring the deadline, N3 ignoring whether the hang was reached) each turn the test red.

**S as shipped.** The `cloudflare` plugin at `b052c32` declares an HTTP MCP server (`.mcp.json`: `https://mcp.cloudflare.com/mcp`). S loads it as released; whether it connects in a headless session, and the tool count it adds, is read from the stream. Token totals of S are compared with other branches only where the tool counts match (existing rule).


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

- Model **Sonnet 5**, `natural` variant only, runs interleaved, as every sprint so far. One `bench` call interleaves the branches it is given (F, S, K). K-before and K-after cannot share a call, because K is the checkout the runner runs from; they are interleaved by alternating batches of `--runs 2` between the two checkouts, four rounds each, K-before first.
- **F**: no plugin. **S**: the sources as they ship, pinned — `fullstack-dev-skills` (jeffallan/claude-skills at `5e8b6b8`; it carries `javascript-pro`, `typescript-pro`, `cli-developer`, `python-pro`) and, for `node-01` only, `cloudflare` (cloudflare/skills at `b052c32`). Spartan is not a plugin and awesome-cursorrules ships Cursor rules, not skills; neither can be loaded as shipped, so S omits them and says so. The runner checks each copy against the pin; `--dry-run` must list them before any session. **K-before**: the kit as `main` ships it (no `node.md`/`python.md`; `index.md` says "not written yet"). A worktree of `main` itself cannot run it: `main` has no `evals/bench/node-01/`. So K-before runs from a worktree of a local branch that is this branch with the `skills/` changes of P3a reverted; before its first session, `git diff main -- skills/ hooks/ agents/` there must print nothing, and `--config-dir` points at `C:\Projects\Bearingkit\_build\profile\claude` (this branch's checkout) by absolute path (`_build/` is untracked and exists only there). **K-after**: the kit on this branch, from this branch's checkout at `C:\Projects\Bearingkit`. F and S also run from this branch's checkout at `C:\Projects\Bearingkit`. S needs a copy of cloudflare/skills at `b052c32` under `_build/upstream/cloudflare_skills` (`upstream/sources.json` records no local copy; P3b found one already there, at `b052c32bab7d…`, plugin `cloudflare`, clean — no clone needed).
- **Calibration**: three F sessions per task. The task is **usable** if N (or Y) is at most 1 in at least 2 of 3 sessions — room for the text to show — and O1 holds in at least 2 of 3 (the task is doable). Refused commands are read by eye before the verdict (lesson of `build-01`: a refusal is not the process).
- **If usable**: F (the three plus five), S, K-before and K-after, eight each. **Primary**: N (Y) for K-after against K-before, by the exact two-sided permutation test (`permutationTest`, `scripts/lib/bench-score.cjs:162`). **Merge rule for the file**: K-after above K-before with p ≤ 0.05; O2 at least 7 of 8 for K-after; O1 for K-after not below K-before. Otherwise the file stays on the branch and the owner decides. A pass merges `node.md` alone into `main`: `python.md` waits for `py-01`, so on `main` the `python` row of `index.md` stays "not written yet" and `SKILL.md` says four of the eight, not five. **Against the sources**: K-after against S by the same test; "better than its sources on `node-01` (`py-01`), Sonnet" only at p ≤ 0.05, otherwise "no clear difference".
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

## Results, `node-01` (P3b, 2026-09-26, owner's machine, Sonnet)

**Calibration, three F sessions** (`evals/results/2026-09-26-bench-node-01-natural/`, commit `fd05e36`): N = 2 in 3 of 3 — N1 3/3 (peaks 10/10, 8/8, 10/10: each session chose a pool of 8 or 10 on its own), N2 3/3 (all-or-nothing: stdout empty on a failure), N3 0/3 (no deadline; each killed at 90 s on the hanging SKU); O1 3/3, O2 3/3, X 3/3; R 0/3 (no plugin); P4 0, P5 0. Cost 0.157 USD median (0.136–0.165), 44 s, 31 tools in every session. Refused commands, read by eye: sessions 1 and 2 each had `node --test` refused twice through the PowerShell tool (the task allows `Bash(node:*)`, not PowerShell), then ran the suite through Bash; session 3 had none. The refusals did not change what the sessions built. Session 3's answer says `npm` is not on the PATH of its shell; checked: its own `npm test` calls returned `npm: command not found`, and on the host `Get-Command npm` finds nothing, so `npm test` (the guardrail `detect-stack` names) cannot run on this machine in any branch — sessions ran `node --test` instead.

**Verdict: not usable → guard.** The registration requires N ≤ 1 in at least 2 of 3; the floor scored 2 in all three. The prompt's cues ("about 2,000 SKUs", "pipes the output straight into another program") are enough for Sonnet to bound concurrency and keep stdout clean with no text at all; only N3 leaves room. Per the registration: eight K-after sessions; `node.md` merges only if O1 and O2 are each at least 7 of 8 and N at its median is not below the floor's calibration median (2). Nothing is claimed as "better" from this path. The owner's standing rule asks for at least eight sessions per branch and a p; on the guard path F keeps its three calibration sessions (the registration adds none), so no p is reported — N is 2 in every session of both runs, so any test would give p = 1.

**Guard, eight K-after sessions** (`evals/results/2026-09-26-bench-node-01-natural-2/`, same commit, runner from this branch's checkout): O1 8/8, O2 8/8, N = 2 in 8 of 8 (median 2 = the floor's median) — N1 8/8 (peak 8/8 in every session), N2 8/8, N3 0/8 (each killed at 90 s); X 8/8; P4 0, P5 0. Cost 0.295 USD median (0.203–0.332) against F's 0.157, 89.5 s against 44 s, 31 tools in every session of both runs (tokens compare: 674k against 312k total, median). Refused commands, read by eye: `python3` heredocs tried first in five sessions (refused by the profile, then done with `node -e`), PowerShell `node --test` in two, compound `sed -i … && node --test` mutation checks in five (the sessions were checking their own concurrency test against a raised cap), one `cd … ; git status`; none stopped a session from building or testing (O1, O2 8/8).

**Reach, which decides how the guard reads.** Skills invoked: `bk-spec` in 8 of 8 (the router's row for a feature), then `bk-build` in 2 of 8 (sessions 1 and 3). `stacks/index.md` opened in 0 of 8, `stacks/node.md` in 0 of 8; `detect-stack` ran in 7 of 8. By the registration ("if K-after opens it in fewer than half, the result says the file was not read and is not evidence about its text"): **the file was not read, and this guard is not evidence about its text.** The registered bar (O1, O2 ≥ 7 of 8; N median ≥ 2) is met in form only, because the text never reached the model. The cause is in the path, not the file: a natural feature request routes to `bk-spec`, and even the two sessions that went on to `bk-build` did not follow its pointer to `references/stacks/`. N3, the one hazard with room, is 0 of 8 on both sides; nothing here says whether the file's deadline sentence would move it.

**Decision.** Not merged by this session: merging text that no measured session read would commit, unmeasured, text the model reads. Put to the owner (question 36 of `docs/specs/2026-09-12-d5-owner-questions.md`); **decided 2026-09-26: kept on the branch** (owner chose "Giữ trên nhánh (Recommended)"). Next: the path to the file (bk-spec → bk-build → `references/stacks/`) as its own measured change, then the `node-01` guard again. No comparison against S was run on the guard path (none is registered there), so nothing is said about the sources.

## Reach fix, registered before any session (2026-09-27, owner: "Tự động xử lý tiếp cho tôi với các khuyến nghị tốt nhất phù hợp nhé.")

**Change.** `detect-stack` adds `stackFiles` to the profile: the bk-build stack files its languages and frameworks map to (the table of `stacks/index.md`), absolute paths, only files that exist. `bk-build` "Read first": "Before the first edit, read each file the profile lists under `stackFiles`." `bk-spec` "Read first" gains a line to read the same files. Why here: in the guard, `detect-stack` ran in 7 of 8 sessions while `bk-build` was invoked in 2 and `stacks/` opened in none. Rejected: fixing `bk-build` alone (6 of 8 sessions never reached it); a router row in the protocol (6,485 of 6,500 characters); a hook injecting the file (loads it into sessions that write no code).

**Probe.** Two K-after sessions on `node-01`, same prompt, permissions and scorer. Go on to the guard if `node.md` is opened (R, `reach()`) in at least 1 of 2; otherwise stop and report.

**Guard again.** Eight K-after sessions. `node.md` merges only if O1 and O2 are each at least 7 of 8, N at its median is not below the floor's (2), **and** `node.md` is opened in at least 4 of 8 (the original rule: fewer than half is "not evidence about its text"). The two probe sessions are not counted in the eight. N3 per session is reported: it is the one hazard with room, and a difference there is a lead to confirm on new sessions, not a result.

**The reach change itself.** It changes text the model reads in `bk-build` and `bk-spec`, so it reaches `main` only with a measurement: the `node-01` guard above measures it on this task; `build-01`'s guard (eight K sessions, its bar as registered in `docs/specs/2026-09-26-bk-build-design.md`, 'The owner's choice after calibration': O2 and O3 at least 7 of 8, O1 8 of 8, P3 at least 7 of 8) is run again before merging, since `bk-build` changed. If the quota does not allow both, the change stays on the branch and the owner is asked.

**Probe result (2026-09-27, `evals/results/2026-09-27-bench-node-01-natural/`, commit `5d8d24d`).** `node.md` opened in **2 of 2** (both through the profile's `stackFiles`; `bk-spec` 2/2, `bk-build` 1/2; `index.md` 0/2) → go on to the guard. Both sessions also scored N = 3 (N3 passed: the process exited on its own in 15 s and 10 s): a lead only, confirmed or not by the guard's fresh sessions. The scorer showed `detect-stack` as "refused" in both, which was wrong: the compound command ran and exited 1 (a missing `CLAUDE.md`), and `reach()` read the word "permission" in the profile's own `**/permissions/**` as the host's refusal. Fixed before the guard: an error that starts "Exit code N" is a run, not a refusal (test red without the fix, green with it). `Rdetect` is reported with no bar; the calibration and first guard are re-read with the fixed rule when reported.
