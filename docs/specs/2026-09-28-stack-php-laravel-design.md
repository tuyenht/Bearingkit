# Stack file `php-laravel.md`: design and registered measurement (2026-09-28)

Item 7 of the v0.3 order, second half, first file (`docs/plans/2026-09-26-v03-roadmap.md`, row P4; P4a in `docs/handoff/2026-09-27-p3c-py01-guard.md`). The owner's instruction for this work, verbatim from the session prompt: "Bước 2, theo lời owner: viết từng file từ nguồn đã ghim (mỗi câu có dòng nguồn trong bảng nguồn của một spec mới, không viết theo fixture; nguồn mỏng thì nói rõ, không viết vượt nguồn), reviewer Sonnet chỉ đọc rà chữ trước mọi phiên đo; đăng ký đo trước khi dựng. Mỗi phiên làm một file […]: dựng task (test fixture đỏ rồi xanh, đột biến scorer đỏ, rà độc lập trước commit), thăm dò reach 2 phiên K, hiệu chỉnh 3 phiên F, rồi đo theo nhánh spec quyết. Thứ tự: `php-laravel`, rồi `shell` (sau khi có đường tới file), rồi `c-cpp` theo quyết định của owner." Feasibility, decided in question 38 (a) of `docs/specs/2026-09-12-d5-owner-questions.md`: a plain-PHP fixture run by `php`, measuring the file's general PHP rules only; its Laravel-only sentences are reported "not measured".

**This session's share** (owner, 2026-09-28: "Có, làm phần không đo (Recommended)"): design, text, fixture and scorer with their test, the independent reviews — no measured session. The sessions run after the weekly quota resets and after the measurement registered in `docs/specs/2026-09-28-stack-rule-timing.md`, so they use the `bk-build` that results from it.

**Status of the text.** `skills/bk-build/references/stacks/php-laravel.md` is written on branch `p4a-php`, not on `main`; it reaches `main` only through the bar registered below.

**The machine, checked 2026-09-28.** `php` on the PATH (the winget package `PHP.PHP.8.2`); no `composer`, so no PHPUnit, Pest, PHPStan or Pint can be installed for a fixture, and no Laravel application can be created. `detect-stack` needs only a `composer.json` to report `php` (`scripts/detect-stack.cjs:103-128`); with no dependency declared it names no framework and no guardrail.

## Inputs

**Rows.** `docs/specs/2026-09-26-bk-build-idea-classification.md` buckets four `idea` rows to `php-laravel`; the inventory's last column (`docs/specs/2026-09-18-item-inventory.md`) says what each may carry, and is binding, as for `node.md` and `python.md`:

| Row | Source (pin in `upstream/sources.json`) | Licence mode | What the inventory names for carrying |
|---|---|---|---|
| 610 | jeffallan/claude-skills `5e8b6b8`, `skills/laravel-specialist` | MIT, reference | jobs dispatched after commit, idempotent and unique; `whenLoaded` in resources; pint in check mode; one `queue:work` run as evidence |
| 619 | same, `skills/php-pro` | MIT, reference | `strict_types`, PHPStan at the project's level, readonly DTOs (its password-hashing test "never checks hashing": an example for `tdd.md`, not carried) |
| 1163 | PatrickJS/awesome-cursorrules `b044f95`, group `php-laravel` | CC0-1.0, reference | "Starting reads: laravel-php-83, laravel-tall-stack"; WordPress, Drupal, TYPO3 and Symfony out of scope |
| 1389 | tuyenht/Antigravity-Core `1774280`, `.agent/rules/backend-frameworks/laravel.md` | owner's own, adapt | Laravel 11+ slimmed structure (single provider, Actions/DTOs folders) |

All three copies are under `_build/upstream/` at their pins (`git rev-parse` 2026-09-28: `5e8b6b8`, `b044f95`, `1774280`).

**Reading.** Two Sonnet agents, read only, brief forbidding background commands, network and any search outside the repository: one read `php-pro` and `laravel-specialist` in full (nine files), the other the two awesome-cursorrules files and Antigravity-Core's `laravel.md` in full (36, 115 and 905 lines). They returned 25 and 21 candidate rows with `path:line` and a short quote. The main session opened every line cited in the table below and checked it against the quote; two citations were corrected on opening (the queue best-practice lines are `queues.md:415-422`, not `:414-420`; Antigravity-Core never names `app/Http/Kernel.php`, so a sentence saying Laravel 11 has none was dropped, not inferred from the folder tree). The agents' tables are untracked (scratchpad); the part that matters is copied here.

**The sources are thin, and the file says only what they say.** The two awesome-cursorrules files are mostly a prompt for drafting a package and a TALL-stack catalogue; their rule lines are short lists (B `:17-30`, `:80-88`). `php-pro`'s and `laravel-specialist`'s rules are one-line "MUST / MUST NOT" lists (`php-pro/SKILL.md:40-59`, `laravel-specialist/SKILL.md:40-60`) with samples. So most sentences are one line, with no reason attached where the source gives none.

**Decisions taken in reading, with reasons.**
- **The inventory's last column.** For `node.md` and `python.md`, a row worded "Carry into …" was read as a closed list (`cli-developer`, row 586), and a row worded "Reading input for …" as a reading input whose named items come first — `python.md` carries `python-pro` rules its row 623 does not name (for example "Secrets and configuration are never literals", `python-pro/SKILL.md:70`). Rows 610 and 619 are worded "Reading input for php-laravel.md", so the same reading applies: every named item is carried, and other lines are carried when they are rules every PHP or every Laravel project shares.
- **Not carried: project conventions and catalogues.** The slimmed folder layout with `Actions/`, `Services/`, `DTOs/` (C `:22-44`, the very thing row 1389 names), naming rules (A `:19-30`), the "no business logic in controllers" layering (`php-pro/SKILL.md:56`, `laravel-specialist/SKILL.md:55`), Livewire, Alpine, Tailwind, Inertia, Precognition, Pennant, Horizon, Pest syntax, coverage targets (`laravel-specialist/SKILL.md:48`), and deployment checklists. What row 1389 does carry is the version fact inside the structure: where Laravel 11 configures middleware and exceptions (C `:49-81`).
- **Not carried: PSR-12 and PHPDoc**, style and documentation preferences (`php-pro/SKILL.md:45`, `:48`).
- **Version floors disagree.** `php-pro` says PHP 8.3+ (`SKILL.md:3`, `:206`), A 8.3+ (`:10`), B 8.1+ (`:19`), `laravel-specialist` 8.2+ (`SKILL.md:18`, `:43`), C 8.2+ (`:18`). The file is written against 8.2: the floor of two sources and of the readonly features it names (`laravel-specialist/SKILL.md:43`: "PHP 8.2+ features (readonly, enums, typed properties)").
- **API names are the kit's adaptation where the source names only the idea:** `password_hash`/`password_verify` for "bcrypt/argon2" (`php-pro/SKILL.md:54`); "placeholders of a prepared statement" for "prepared statements" (B `:86`).
- **Bad samples, not carried.** `php-pro`'s `testCreateHashesPassword` asserts only the name (`SKILL.md:152-164`; the inventory routes it to `tdd.md`); `php-pro`'s ReactPHP samples only `echo` the error (`references/async-patterns.md:238-241`, `:288-290`); `laravel-specialist`'s form request `authorize()` returns `true` unconditionally (`references/routing.md:130-132`). No sentence rests on them.
- **Style conflict between two sources, not carried:** A `:22` wants `snake_case` variables where B `:20` follows PSR-12.

## Provenance: every sentence and its source line

Paths are relative to each source's root at its pin: J = jeffallan/claude-skills `skills/`, A = awesome-cursorrules `rules/laravel-php-83-cursorrules-prompt-file.mdc`, B = awesome-cursorrules `rules/laravel-tall-stack-best-practices-cursorrules-prom.mdc`, C = Antigravity-Core `.agent/rules/backend-frameworks/laravel.md`. "Kit" is a line of this repository. Line numbers on the left are `php-laravel.md`'s.

| Line, sentence (short) | Source line |
|---|---|
| 3 Version card: PHP 8.2, Laravel 10+, Laravel 11 changes marked | J `laravel-specialist/SKILL.md:18`, `:43`; C `:4`, `:18`; J `php-pro/SKILL.md:3`; A `:10` (decision above) |
| 3 Version card: what `detect-stack` was run on | `node scripts/detect-stack.cjs tests/fixtures/stacks/laravel`, and on a directory holding only a `composer.json` with `require.php`, 2026-09-28: `php`; Laravel 12, Livewire 4, Pest 3, guardrails `vendor/bin/pest`, `vendor/bin/pint --test` / no framework, no guardrail; both list `stackFiles` → `php-laravel.md` |
| 3 First real project refreshes; newer major → pinned-documentation rule | kit `stacks/python.md:3`, `stacks/index.md:26` |
| 5 Starting point, not vendored; project conventions stay out | kit `stacks/python.md:5`, `stacks/kotlin.md:5`; decisions above |
| 9 A new PHP file starts with `declare(strict_types=1);` | J `php-pro/SKILL.md:43`; B `:21` |
| 9 Adding it to an existing file is its own change | kit `stacks/node.md:41` ("turning it on in an existing project is its own change"), `skills/bk-build/SKILL.md:16` |
| 10 Every property, parameter and return typed; `mixed` not a way around | J `php-pro/SKILL.md:44`, `:53`; J `laravel-specialist/SKILL.md:44` |
| 11 Data between layers: `final readonly` class or readonly properties | J `php-pro/SKILL.md:47`, `:74`; inventory row 619 ("readonly DTOs") |
| 12 Dependencies injected, not global or static state | J `php-pro/SKILL.md:50`; J `laravel-specialist/SKILL.md:49` |
| 13 `try`/`catch` for expected exceptions; the rest to the framework's exception handling and logging | B `:28` ("Use try-catch blocks for expected exceptions"), `:26` ("Use Laravel's exception handling and logging features") |
| 14 Password stored only as a hash (bcrypt, Argon2); never plain text | J `php-pro/SKILL.md:54`; API names: kit adaptation (above) |
| 15 SQL values as bound parameters, never concatenation | J `php-pro/SKILL.md:55`; J `laravel-specialist/SKILL.md:53`; B `:86`; C `:859-861` |
| 16 Writes that succeed or fail together: one transaction | B `:87`; C `:393` |
| 17 Configuration and secrets from the environment | J `php-pro/SKILL.md:57`; J `laravel-specialist/SKILL.md:56` |
| 18 No `var_dump` in delivered code | J `php-pro/SKILL.md:59` |
| 22 From Laravel 11, middleware and exception reporting in `bootstrap/app.php` via `->withMiddleware()`, `->withExceptions()` | C `:49-81`; inventory row 1389 |
| 22 Which structure follows from the `laravel/framework` version | kit `scripts/detect-stack.cjs:110-112`, `:127` (the profile's version card carries the Laravel major) |
| 23 From Laravel 11, casts in a `casts()` method | C `:114-115` |
| 24 Request input validated by the framework's validation before use | B `:29`, `:83`; J `laravel-specialist/SKILL.md:57`; J `php-pro/SKILL.md:49` |
| 25 Mass assignment through `$fillable` or `$guarded` | C `:855-857` |
| 26 Blade `{{ }}` escapes; `{!! !!}` raw, only for sanitized markup | C `:863-865` |
| 27 Relation read in a loop eager-loaded first; otherwise a query per row | J `laravel-specialist/SKILL.md:45`, `:54`; C `:201-209` |
| 28 Large table walked with `chunk()`, `lazy()`, `cursor()` | C `:224-239`; J `laravel-specialist/references/eloquent.md:345` |
| 29 API resource: `whenLoaded()`, `whenCounted()` | J `laravel-specialist/SKILL.md:165-166`; C `:447-451`; inventory row 610 |
| 30 Long-running work on a queue, not in the request or a model event | J `laravel-specialist/SKILL.md:47`; J `…/references/queues.md:422`; J `…/references/eloquent.md:350` |
| 31 Job dispatched inside a transaction waits for the commit: `->afterCommit()` | J `…/references/queues.md:66`; inventory row 610 |
| 32 Job idempotent; `ShouldBeUnique` when it must not run twice at once | J `…/references/queues.md:415`, `:421`, `:209`; inventory row 610 |
| 33 Job has a timeout and a `failed()` method; a failed job never ignored | J `…/references/queues.md:417`, `:420`; J `laravel-specialist/SKILL.md:60` |
| 34 Under Octane a static property persists across requests; state through container or cache | C `:578-602` |
| 38 Evidence: full output, red before green | kit `skills/bk-build/SKILL.md:17`, `:28`; `stacks/python.md:37` |
| 39 Evidence: one `php artisan queue:work --once` run after a job dispatch | J `laravel-specialist/SKILL.md:256`; inventory row 610 |
| 43 Guardrails: pest or phpunit, `pint --test` (check mode), `phpstan analyse` at the project's level | kit `scripts/detect-stack.cjs:114-117`; J `laravel-specialist/SKILL.md:258`; J `php-pro/SKILL.md:46`; inventory rows 610 ("pint in check mode"), 619 ("PHPStan at the project's level") |

Kit additions with no upstream line: the API names of lines 14 and 15 (above), "adding it to an existing file is its own change" (a kit rule, cited), and the version sentence of line 22 (cited to `detect-stack`). If the reviewer finds another, it is sourced or removed before any session.

## Measurement, registered before any fixture or session

The pattern of `node-01` and `py-01` (`docs/specs/2026-09-26-stack-node-python-design.md`, "Measurement" and "Branches, calibration, and the bar"), with what is different here stated.

**Hazards: chosen after the text was written, from its PHP section only.** A sentence qualifies if a script can check it by running the session's final code with `php` alone, without judging style. Three do:

| Id | Hazard | Sentence in the file |
|---|---|---|
| H1 | strict types in new files | line 9: "A new PHP file starts with `declare(strict_types=1);`" |
| H2 | bound parameters | line 15: "SQL takes its values as bound parameters … never by string concatenation" |
| H3 | one transaction | line 16: "Writes that must succeed or fail together run in one transaction" |

Not measured, and said so in the results: every sentence of the Laravel section (no Laravel application can be installed on this machine: no `composer`), and the PHP sentences a run cannot check without judging code (typing, readonly, injection, where exceptions are caught, passwords, configuration, `var_dump`).

### Task `php-01`

**Fixture** `evals/bench/php-01/`, built by `build.cjs`, at `C:/Projects/.bearingkit-evals/bench/php-01`. A small stock tool in plain PHP, no dependency: `composer.json` with `require.php >=8.2`, PSR-4 autoload of `src/` and a `scripts.test` entry; since there is no `composer` on the machine, `bin/stock.php` loads a small hand-written autoloader. SQLite through PDO (the machine's `php` has `pdo_sqlite`): `schema.sql` (`items(sku, name)`, `stock(sku, warehouse, qty)`, primary key `(sku, warehouse)`, no check constraint), `src/Database.php` (a PDO connection to the file named by `STOCK_DB`, errors as exceptions), `src/StockRepository.php` (`quantities($sku)` with a prepared statement), `bin/stock.php` with `init` (applies `schema.sql`) and `show <sku>`. No file declares `strict_types` (the fixture is an ordinary older codebase; line 9 is about new files). Tests: `tests/run.php`, a runner of a few lines (no PHPUnit can be installed), and `tests/ShowTest.php`, which builds a temporary database from `schema.sql` and runs `show`; the README says to run `php tests/run.php`. `detect-stack` must report `php`, no framework, no guardrail, and `stackFiles` naming `php-laravel.md` (checked by the fixture test).

**Prompt**, the same for every branch: "Add a transfer command to our stock tool: `php bin/stock.php transfer <sku> <from> <to> <qty>` moves that quantity of an item from one warehouse to another. Keep the transfer logic in its own class; the nightly rebalancing script will call it too. You have my go-ahead to make the change without stopping to ask."

**Permissions**, every branch: edits inside the fixture; `php` (the task's language, as `node` for `node-01`); `node` (for `detect-stack`); read-only `cat`, `ls`, `grep`, `head`, `tail`; `git log`, `git diff`, `git show`, `git status`.

**Scored after the session**, by the scorer's own harness: for each run it builds a fresh SQLite file from the session's final `schema.sql` through a PHP helper that lives with the scorer, not in the fixture, seeds it, and runs `php bin/stock.php transfer …` with `STOCK_DB` pointed at it.

| Id | Kind | What | How |
|---|---|---|---|
| **H** | **primary** | H1 + H2 + H3, 0 to 3 per session | sum |
| H1 | hazard | Every PHP file the session added (untracked or added in `git status`, `*.php`) has `declare(strict_types=1)` as its first statement, and at least one was added. Reported as a class as well: none added, all, some | PHP's own tokenizer (`token_get_all`), comments and the open tag skipped |
| H2 | hazard | A transfer between warehouses `Main` and `O'Hare` (a quote in the name) gives exit 0 and moves the quantity | one run; quantities read back from the file |
| H3 | hazard | With a write to one warehouse made to fail, the other is not changed: two runs, a trigger aborting any insert, update or delete of the source row in one and of the destination row in the other; both leave every row as it was. Counts only where O1 holds, so a transfer that never writes does not pass | two runs; rows read back |
| O1 | outcome | Happy path: `transfer SKU-1 Main North 5` exits 0; `Main` has 5 fewer, `North` 5 more, nothing else changed in the stock table (no other row changed, none added; a table of the session's own, such as a transfer log, may gain rows — made precise before any session, see "Review of the build") | one run |
| O2 | outcome | Green: `php tests/run.php` exits 0 on the session's final tree | run |
| X | control | Moving more than the source holds exits non-zero and changes nothing — not in `php-laravel.md`. Counts only where O1 holds (added before any session, see the review below) | one run |
| R, P4, P5, C | as `node-01` | `stacks/php-laravel.md` opened; P4 counts paths outside `bin/`, `src/`, `tests/`, `schema.sql` and a root notes file | stream, `git status` |

A single `UPDATE` covering both rows is atomic on its own and passes H3: the sentence asks that the writes succeed or fail together, not for the word `transaction`. The scorer calls `transfer` with the argument order the prompt spells; a session that changes it fails O1, H2 and H3 alike, read by eye and reported, not re-scored.

**Branches, calibration, and the bar.** As `node-01` and `py-01`: Sonnet 5, `natural` only; a reach probe of **two K sessions** first (go on if `php-laravel.md` is opened in at least 1 of 2); **three F sessions** of calibration; the task is **usable** if H ≤ 1 in at least 2 of 3 and O1 holds in at least 2 of 3.
- **If usable**: F (the three plus five), S, K-before and K-after, eight each. Primary: H, K-after against K-before, exact two-sided permutation test. `php-laravel.md` merges only if K-after is above K-before with p ≤ 0.05, O2 at least 7 of 8, O1 not below K-before, and the file opened in at least 4 of 8. Against the sources: K-after against S, same test.
- **If not usable (guard)**: one `bench` call `--branches K,S --runs 8`, K-after and S interleaved. `php-laravel.md` merges only if, for K-after, O1 and O2 are each at least 7 of 8, H at its median is not below the floor's calibration median, and the file is opened in at least 4 of 8. Against the sources, on the same sessions: H, K-after against S, exact two-sided permutation test; "better than its sources on `php-01`, Sonnet" only at p ≤ 0.05 with K above S, otherwise "no clear difference". (On `node-01` and `py-01` the comparison with S was a separate run after the guard; here it is registered with the guard, so the owner's rule "a sprint that changes a skill runs its probe on both sides" is met in one run.)
- **Branches' content.** K-after: this branch, rebased on `main` as it stands when the sessions run — after the measurement of `docs/specs/2026-09-28-stack-rule-timing.md`, so `bk-build` is whichever version that measurement leaves on `main`; the rebase is recorded. K-before (usable path only): `main` itself, where `php-laravel.md` does not exist and `stackFiles` is empty for PHP. S: `fullstack-dev-skills` (jeffallan/claude-skills at `5e8b6b8`, carrying `php-pro` and `laravel-specialist`) as it ships; awesome-cursorrules ships Cursor rules and Antigravity-Core is not a Claude Code plugin, so S omits both and says so. F: no plugin.
- **Reported with no bar**, every path: each hazard per branch, H1's class, X, R (if K-after opens the file in fewer than half, the result says the file was not read and is not evidence about its text), the columns of `evals/analysis/stack-rule-timing.cjs` where they apply, P4, P5, cost median and spread, tokens only where tool counts match, and the skill each session invoked.
- **Budget, not measured.** 2 + 3 + 16 = 21 sessions on the guard path, 2 + 3 + 5 + 24 = 34 if usable. `get_usage` before each batch; the runner stops at 90% of the five-hour window or 95% of the week.

**Rejected, with reasons.**
- A Laravel fixture: no `composer` on the machine to install the framework; question 38 (a) settled plain PHP.
- Hazards on typing, readonly or `var_dump` by grep: scoring words, not behaviour (the rule of `node-01`). H1 is checked on the tokens of the declaration because the declaration is itself the rule's whole content.
- A check constraint `qty >= 0` in the schema: it would make X and H3 interact (a failed source update after a destination write would be a partial write caused by X's input).

**As built (2026-09-28, owner's machine, no session run)** — `evals/bench/php-01/` (`build.cjs`, `db.php`, `task.json`, `mutants.cjs`, `app/`), test `tests/bench-php-01.test.cjs`. Details the table leaves open, fixed before any session:
- **Fixture.** `composer.json` (`require` `php >=8.2` and `ext-pdo_sqlite`, PSR-4 for `Stock\`, `scripts.test`), `schema.sql`, `src/autoload.php` (the hand-written PSR-4 loader), `src/Database.php`, `src/StockRepository.php`, `bin/stock.php` (`init`, `show`; a `PDOException` becomes exit 1), `tests/run.php` (runs every `tests/*Test.php`, so a test file the session adds is part of O2), `tests/helpers.php`, `tests/ShowTest.php` (three tests, green), README, `.gitignore` (`data/`, where the default database lives). No file declares `strict_types`. `detect-stack` reads it as `php`, no framework, no guardrail, `stackFiles` naming `php-laravel.md` (checked by the test).
- **Scorer.** `db.php` stays with the scorer: `seed` builds a database from the session's `schema.sql` and inserts two items and five stock rows (`SKU-1` in `Main` 40, `North` 12, `O'Hare` 7; `SKU-2` in `Main` 100, `North` 30); `refuse` adds triggers aborting any insert, update or delete of one warehouse's rows; `dump` returns every table's rows; `strict` reads a file's first statement with `token_get_all`. For H3 and X, "nothing changed" compares every table; a table the run created must be empty (a log the session creates on first use is not a change, a row left in it is). For O1 and H2, the stock table must hold exactly the seeded rows with the moved quantities. A schema the seed cannot fill is reported as `seedError`, a refusal trigger that cannot be installed as `refuseError`; both score nothing. X counts only where O1 holds (see the review).
- **Calling PHP.** The scorer runs `php -f <script> -- <args>`, which gives the script the same `$argv` as `php <script> <args>` (checked). Under `node --test` on this machine, spawning `php` with a file as its first argument fails with `EPERM`, while `php -r …` and `php -f <file>` run; outside the test runner both forms run. The cause was not found; it touches only how the scorer starts PHP, not what sessions run.
- **Test** (about 100 s): untouched green, H = 0, H1 class none-added, X false; a naive port (no declaration, SQL by concatenation, no transaction) passes O1 and X and fails H1, H2, H3 (H3 caught by the destination-refusing run); the reference (declaration, bound parameters, transaction) passes all, H = 3; prepared statements with no transaction fail H3 only; one `UPDATE` over both rows passes H3; one value concatenated fails H2 only; a `try` with no transaction fails H3; destination written first is caught by the other run; a comment before the declaration passes H1, `strict_types=0` and a late declaration fail it, a second added file without it gives class "some"; a log row inside the transaction passes H3, one written before it fails; no quantity check fails X only, and so do a refusal that exits 0 and a non-zero exit after writing; a stray stock row fails O1, H2 and H3, while a row in a log table of the port's own passes O1 and H2; twice the quantity fails O1, H2, H3, X; exit 1 with the right rows fails O1 and H2; an unfillable schema gives `seedError`; an added red test fails O2 (and H1), a file in `config/` counts for P4, a root note does not; reset removes the transfer. Every variant is made by a replacement the test first asserts it found (a first version silently left one variant unchanged).
- **Eighteen mutations of the scorer** (`evals/bench/php-01/mutants.cjs`, each dropping one condition, four at a time, an unmutated control green under the same load): the first run left **M10** (X ignoring whether rows changed) and **M11** (X ignoring the exit code) green — the one X case failed both conditions at once. Two cases were added (a refusal that exits 0 with nothing written; a non-zero exit after the rows were written), and M10 and M11 then turned red at those assertions, the control green. The other sixteen were red on the first run, each at the assertion named for it; adding assertions cannot turn them green. The test and scorer were written in the same step, so the red-before-green evidence is the mutations.

**Limits, stated now.** One small planted fixture, three hazards. The prompt's "its own class" makes a new file likely, which H1 needs; a session that puts the class in an existing file fails H1 by definition, and H1's class shows how often. H2 may saturate on the floor, since the existing repository code already uses a prepared statement; the calibration shows it. The Step 0 finding (a stack rule read during `bk-spec` is often lost) applies here too; the `stack-rule-timing` columns are reported so that it can be seen.

## Independent review

### Review result (2026-09-28, Sonnet 5, read only, before the fixture was built)

The reviewer changed no file, ran no Python and no session, and opened every cited line (about 30 rows, the four inventory rows, the `python.md`/row 623 precedent, `detect-stack`). It found the reading of the inventory consistent with that precedent, the hazards drawn from the finished text, H1 and H3 closed against empty passes, and the index and `SKILL.md` counts right (six files on disk).

| Finding | Severity given | Weighed | Change |
|---|---|---|---|
| Row of line 30 cites `eloquent.md:351` ("Use lazy collections"); the supporting line is `:350` ("Avoid using model events for heavy operations - Use queues instead") | must-fix | Correct (opened) | Citation now `:350` |
| Line 13's "the rest propagate to the framework's handler": B says only "Use try-catch blocks for expected exceptions" (`:28`) and "Use Laravel's exception handling and logging features" (`:26`) | should-fix | Correct: the clause went beyond the lines | Sentence now "`try`/`catch` is for the exceptions a caller expects; the rest go to the framework's exception handling and logging", both lines cited |
| Line 9's second sentence: `stacks/node.md:41` ("turning it on in an existing project is its own change") is the tighter source | should-fix | Correct | Cited first |
| O2: does the runner pick up a test file the session adds? | should-fix | It does: `tests/run.php` runs every `tests/*Test.php` (as built, below) | Stated in "As built" |
| Row 1389 carries the bootstrap fact, not the folder layout it names | note | Disclosed choice, consistent with precedent | None |

### Review of the build (2026-09-28, Sonnet 5, read only, before the commit)

The reviewer changed no file and ran no test (a mutation run was in progress). It found the prompt verbatim, the permissions as registered, every scored id registered and none extra, the `php -f` argument passing equivalent, H1's tokenizer sound, the triggers covering insert, update and delete on both sides, and no cue in `app/` or its git history.

| Finding | Severity given | Weighed | Change |
|---|---|---|---|
| O1 and H2 checked only the five seeded rows, so a stray extra row passed "nothing else changed", which `same()` (H3, X) does enforce | must-fix | Correct. Tightened to the stock table only, not every table: a transfer log in a table of the session's own is a legitimate design and must not fail O1 | `moved()` also requires the stock table to hold exactly the seeded rows; test cases "a stray stock row" (fails O1, H2, H3) and "a row in a log table of its own" (passes); mutant M18 |
| The `refuse` helper's exit status was not checked, so a failed trigger install would silently disable H3's fault | should-fix | Correct | Checked; reported as `refuseError`, H3 scores false. No test case covers it (a schema that lets the seed succeed and the trigger install fail was not found); a second narrow review noted this |
| `declare(strict_types=1, ticks=1)` would not match | note | No source and no realistic session writes it | None |

**Found by the main session while writing the test, before any session:** X as registered ("exits non-zero and changes nothing") passes on the untouched fixture, which has no `transfer`, exits 2 and changes nothing. X now counts only where O1 holds, as H3 does.

## Results (2026-09-30, owner's machine, Sonnet 5)

### Branch brought up to date with `main`

The registration says K-after is this branch "rebased on `main`… the rebase is recorded". The branch was already pushed, so `main` (`3d5f419`) was merged into it instead of rebasing: `c0a6e5b`, no conflict. The content is what a rebase would give: the 20 files the branch changes are byte-identical to `e540fbc` (`git diff e540fbc c0a6e5b -- <those files>` empty), every other file is identical to `main`. `bk-build` on `main` is the version the Step 0 measurement left there (its change stayed on `p4-step0-scope`). Suite on `c0a6e5b`: 183/183. The merge commit was made and pushed before its independent review, against the session rule; the review of the next commit covered it.

### Reach probe: 0 of 2 (the registered stop)

`--branches K --runs 2`, `evals/results/2026-09-30-bench-php-01-natural`, `meta.kit` = `p4a-php@c0a6e5b`, `dirty: false`. Both sessions invoked `bearingkit:bk-build` first (with `args`), ran `detect-stack` (its output listed `stacks/php-laravel.md` under `stackFiles`), never opened that file or `index.md`, added `src/StockTransfer.php` and `tests/TransferTest.php`, and had no refused command. Scores, both sessions alike: H1 false (class `none`: files added, none declaring strict types), H2, H3, O1, O2, X true, so H = 2; P4 and P5 0. About 90 s and 0.32–0.36 USD each (runner's figure). R below half: the scores are not evidence about the file's text.

By the registration this stops the task and goes to the owner.

### Reach by entry skill, from sessions already run

`evals/analysis/stack-reach-by-entry.cjs` (written for this, read only) counts, for every K session of `node-01`, `py-01`, `php-01` and `build-01` in `evals/results`, whether a stack file was opened, against the first skill invoked and whether a tool result in the session listed a stack file under `stackFiles` (in practice the `detect-stack` output). "Opened" uses the scorer's tool set and path test (`scripts/lib/bench-score.cjs`, `reach`): a `Read`, `Grep`, `Bash` or `PowerShell` call whose input names a `stacks/<name>.md` other than `index.md`; the scorer tests the task's own stack file, which is the same thing on these tasks. All 94 sessions ran `claude-sonnet-5`. The sessions live in `evals/results`, untracked, so the table is reproducible on the owner's machine only.

| Entry skill, stack file listed | Opened |
|---|---|
| `bk-spec` | 59 of 59 (`node-01` 32, `py-01` 27) |
| `bk-build` | 10 of 14 (`build-01` 6/7, `py-01` 4/5, `php-01` 0/2) |
| any, nothing listed | 0 of 21 |

The three task prompts share the sentence "You have my go-ahead to make the change without stopping to ask", so the prompt does not explain why `php-01` sessions enter through `bk-build`; the likelier reason, not tested, is that the change fits the router's "small change, at most three files" row. How strong is 0 of 2? At the `bk-build` rate of the other tasks (10 of 12, `php-01` left out) its chance is about 0.03 (binomial); pooled with `php-01` (10 of 14), about 0.08. So it is some evidence of lower reach on `php-01`, not proof that the file is unreachable. The rate is also confounded: entry skill goes with task (every `bk-spec` entry is `node-01` or `py-01`) and the sessions span three tasks and several kit revisions. The gap between entry through `bk-spec` and through `bk-build` is a finding about `bk-build`'s own line (`SKILL.md:12`), not about this file; it goes to the handoff as an open thread and is not acted on here.

### Probe extension, registered before any of its sessions (owner, 2026-09-30, verbatim: "Đồng ý A, tiếp tục theo khuyến nghị")

Option A as proposed to the owner: **four more K sessions**, one `bench` call `--branches K --runs 4`, `p4a-php` checked out at the commit that adds this section (a documentation change only; `skills/`, `hooks/`, `agents/`, `scripts/` as at `c0a6e5b`). Go on to the three F calibration sessions and the path the calibration picks if `Rfile` holds in **at least 2 of the 4**; fewer, and `php-01` stops and goes back to the owner. Probe sessions count toward no bar. This loosens the registered stop after it fired, with the owner's approval and before any extension session: 2 of 4 is the bar's proportion ("opened in at least 4 of 8"), but with the first probe counted it is 2 of 6, below half. Each session counts as the scorer reads it, one that errors or times out included; none is re-run. If the runner stops itself on quota before four sessions, the missing ones run after the reset from the same commit. Operating characteristics (binomial, not measured): at a true rate of 10/12 the extension stops in about 2% of cases, at 10/14 in about 7%; at 0.2 it goes on in about 18%.

### Probe extension: 2 of 4, go on

`evals/results/2026-09-30-bench-php-01-natural-2`, `p4a-php@e2fa4c2`, `dirty: false`. `Rfile` held in K3 and K4, the two sessions that entered through `bk-spec` before `bk-build`; K1 and K2 entered through `bk-build` and never ran `detect-stack`, so no list reached them. The two that read the file put `declare(strict_types=1)` in the class file and not in the test file (H1 class `some`, H1 false: the registered H1 counts every added PHP file). H = 2 in all four. One refused command (K2, a compound `rm -f /tmp/…` smoke test outside the registered permissions), read by eye, no effect on the scores.

### Calibration: not usable, guard path

`--branches F --runs 3`, `evals/results/2026-09-30-bench-php-01-natural-3`, same commit. H = 2 in 3 of 3 (H2 and H3 held, H1 failed, class `none`), O1 3 of 3, so H ≤ 1 in 0 of 3: the task is **not usable** and the guard runs. H2 and H3 saturate on the floor, as "Limits" foresaw for H2; only H1 can separate branches. F median H = 2. One refused command (F2, the same compound `rm -f /tmp/…` smoke test), read by eye, no effect on the scores.

### Guard: fails on reach (the file opened in 0 of 8)

One `bench` call `--branches K,S --runs 8`, K and S interleaved, `evals/results/2026-09-30-bench-php-01-natural-4`, `p4a-php@e2fa4c2`, `dirty: false`, all sessions `claude-sonnet-5`, run after the five-hour window reset (the extension and calibration had used it to 77%). Tally: `evals/analysis/php01-tally.cjs`.

| | K-after | S | F (calibration) |
|---|---|---|---|
| H per session | 2 ×8 | 2 ×8 | 2 ×3 |
| H1 / H2 / H3 | 0 / 8 / 8 | 0 / 8 / 8 | 0 / 3 / 3 |
| O1 / O2 / X | 8 / 8 / 8 | 8 / 8 / 8 | 3 / 3 / 3 |
| `php-laravel.md` opened | 0 of 8 | 0 of 8 | 0 of 3 |
| Skill invoked | `bk-build` 7, `bk-spec`>`bk-build` 1; `args` on the first call 8 of 8 | none | none |
| P4, P5 | 0, 0 | 0, 0 | 0, 0 |
| Cost USD, median (range), runner's figure | 0.339 (0.294–0.484) | 0.300 (0.278–0.462) | 0.248 (0.237–0.262) |

**The bar, K-after:** O1 8 of 8, O2 8 of 8, H median 2 not below the calibration median 2, all held; the file opened in 0 of 8 (at least 4 required) failed. **`php-laravel.md` does not merge; the branch is kept.** Against the sources, on the same sessions: H mean 2.000 for both, exact two-sided permutation p = 1.0: no clear difference. The file was not read in any guard session, so none of this is evidence about its text.

Reach in the guard: 3 of 8 K sessions received a `stackFiles` list (5 never ran `detect-stack`), and none of the 3 opened the file. Across all fourteen K sessions of `php-01`: a list reached 7, the file was opened in 2, both entering through `bk-spec`. The tool counts differ between branches (K 16–25 calls, S 15–24), so tokens are not compared. Refused commands, read by eye in every session that had one (K 1 in one session, S 11 in three; S also had one no-op `Edit` and one `Read` of a missing file): manual smoke tests outside the registered permissions (`rm -f /tmp/…`, commands prefixed with an environment variable, `find -exec`); none changed a score. S invoked no skill in any session: the plugin was installed as it ships and its `php-pro` and `laravel-specialist` skills were never called.

Not measured, as registered: every sentence of the Laravel section and the PHP sentences a run cannot check without judging code. The columns of `stack-rule-timing.cjs` do not apply as written: that script reads only `node-01` and `py-01` and their deadline hazard, and the file was not read in the guard. By hand, for the only two sessions that read it (extension K3 and K4): K4 opened it before `bk-build` started, K3 after; both still left the test file without the declaration (H1 class `some`).

What this says about the kit, not only this file: on `php-01`, sessions that entered through `bk-build` ran `detect-stack` in 4 of 11 (7 of 14 counting the three `bk-spec` entries; the scorer's `Rdetect`), and none of those 4 opened the file it listed, while 2 of the 3 that came through `bk-spec` did. On the other tasks the same line reached 10 of 12 (above). Until `bk-build` reaches its stack file on the path it is usually entered by, a guard of any stack file on a small-change task measures reach, not the file. Next step goes to the owner.
