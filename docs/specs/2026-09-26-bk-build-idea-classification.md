<!-- Produced 2026-09-26 by a Sonnet research agent (session P1 of docs/plans/2026-09-26-v03-roadmap.md) from docs/specs/2026-09-18-item-inventory.md; copied here unchanged apart from this line. Spot-checked: 103 rows, buckets sum to 103, anchors skills/bk-protocol/SKILL.md:76 and modernize-uplift.md:51-63 read. Line numbers are those of the inventory at d3030e4. -->

# bk-build `idea` rows — classification

Source: `node _build/bk-build-sprint/count-rows.cjs --list` (142 rows target bk-build: `{ absorb: 7, drop: 32, idea: 103 }`). This file classifies the 103 `idea` rows. "Inventory line" below is the line number in `docs/specs/2026-09-18-item-inventory.md` (verified with `grep -n "| bk-build | idea |" docs/specs/2026-09-18-item-inventory.md`, 103 hits, matching the script's count).

Five stack files are not written yet: `node.md`, `python.md`, `php-laravel.md`, `shell.md`, `c-cpp.md` (`skills/bk-build/references/stacks/index.md:8,10,11,12,13`). Rows bucketed to those names are reading input for future authoring, not text that exists to check today; their "covered" column is "not yet — file unwritten" unless noted otherwise.

## Bucket counts (sum = 103)

| Bucket | Count |
|---|---|
| typescript-react | 28 |
| node | 26 |
| python | 22 |
| generic-build | 9 |
| kotlin | 6 |
| php-laravel | 4 |
| c-cpp | 3 |
| shell | 2 |
| sql | 2 |
| major-upgrade | 1 |
| other-stack | 0 |
| not-build | 0 |

## Table

| Line | Item | Bucket | Reason (≤25 words) | Covered already? |
|---|---|---|---|---|
| 417 | `addyosmani:.claude/commands/build.md` | generic-build | Uncommitted-work check, stage only task's files, hedged replies ≠ approval — execution discipline, not stack-specific. | No hit for "uncommitted"/"stage" in `skills/bk-build/references/executing.md`. |
| 442 | `addyosmani:skills/frontend-ui-engineering` | typescript-react | State-placement ladder, loading/empty/error per view, dialog focus — UI-specific, explicitly "carry into typescript-react.md". | No — no match for "state-placement"/"loading/empty/error"/"focus" in `stacks/typescript-react.md`. |
| 445 | `addyosmani:skills/incremental-implementation` | generic-build | Contract-first slicing, off-by-default flags, separately-revertable increments — stack-independent execution rule. | Not verified; scope/minimal-touch already in `skills/bk-build/SKILL.md:15`, this slice is new. |
| 586 | `jeffallan:skills/cli-developer` | node | Stdout/stderr split, TTY-aware colour, non-interactive path — reason names both node.md and shell.md; JS-flavored parts land here. | Not yet — `node.md` unwritten. |
| 590 | `jeffallan:skills/cpp-pro` | c-cpp | Sanitizer runs as evidence, warnings-as-findings, RAII over raw new/delete — C++-specific. | Not yet — `c-cpp.md` unwritten. |
| 607 | `jeffallan:skills/javascript-pro` | node | AbortController cancellation, bounded concurrency, one module system per file — Node/JS-specific. | Not yet — `node.md` unwritten. |
| 608 | `jeffallan:skills/kotlin-specialist` | kotlin | runTest virtual time, NonCancellable-for-cleanup-only, runBlocking-in-prod as a finding — Kotlin coroutine rules. | Not checked line-by-line against `stacks/kotlin.md`; reason implies new content. |
| 610 | `jeffallan:skills/laravel-specialist` | php-laravel | Post-commit idempotent jobs, whenLoaded in resources, pint check mode — Laravel-specific. | Not yet — `php-laravel.md` unwritten. |
| 617 | `jeffallan:skills/nextjs-developer` | typescript-react | Client components at interactive leaves only, explicit per-fetch caching — Next.js/React-specific. | Not verified against `stacks/typescript-react.md`; reason frames it as an addition. |
| 619 | `jeffallan:skills/php-pro` | php-laravel | strict_types, project-level PHPStan, readonly DTOs — PHP-specific. | Not yet — `php-laravel.md` unwritten. |
| 623 | `jeffallan:skills/python-pro` | python | Mutable defaults and bare except as findings, project-strictness mypy — Python-specific. | Not yet — `python.md` unwritten. |
| 626 | `jeffallan:skills/react-expert` | typescript-react | Effect cleanup for subscriptions/listeners — React-specific; its re-render rule is explicitly rejected as contradicting an existing rule. | No — no "optimistic"/cleanup match in `stacks/typescript-react.md`; contradicted rule (measure-before-memo) already there per reason. |
| 636 | `jeffallan:skills/sql-pro` | sql | Plans matter only at production scale, EXISTS for existence, explicit NULL handling — SQL-specific. | Not checked line-by-line against `stacks/sql.md`. |
| 642 | `jeffallan:skills/typescript-pro` | node | Exhaustive `never`-checked switches, branded IDs, `noUncheckedIndexedAccess` — generic TS, not React-UI-only, so node per the routing rule. | Not yet — `node.md` unwritten. |
| 699 | `vercel-agent-skills:skills/composition-patterns` | typescript-react | Explicit variants over boolean mode props, state behind a provider — React component-API rule, explicitly targets `stacks/typescript-react.md`. | Not verified; no licence file per reason, still an idea not absorb. |
| 701 | `vercel-agent-skills:skills/react-best-practices` | typescript-react | Priority order already landed 2026-09-15 (D3); server-action auth, module-scope state, nested component defs still to re-derive. | Partially — priority order landed per reason; the three named rules are not yet re-derived. |
| 769 | `cloudflare:skills/workers-best-practices` | node | Floating promises, module-scope request state, unbounded buffering, constant-time secret compare — generic Node-host rules (Workers config itself dropped). | Not yet — `node.md` unwritten. |
| 838 | `spartan:toolkit/commands/spartan/build.md` | generic-build | Commit-batching by logical layer (2-5 commits), skip redundant git status/diff/log — token-efficiency tactic, stack-independent. | No — no "batch"/"logical layer" commit guidance in `executing.md`. |
| 907 | `spartan:toolkit/rules/backend-micronaut/BATCH_PROCESSING.md` | kotlin | Chunk-with-safety-cap, don't abort the whole batch for one item's failure — general robustness pattern routed to the Kotlin file. | Not checked line-by-line against `stacks/kotlin.md`. |
| 909 | `spartan:toolkit/rules/backend-micronaut/KOTLIN.md` | kotlin | Most content already matches `kotlin.md`; the one addition is banning `@Suppress`/placeholder params as a root-cause-discipline rule. | Mostly yes per reason ("already match kotlin.md almost verbatim"); the `@Suppress` ban is new. |
| 920 | `spartan:toolkit/rules/frontend-react/FRONTEND.md` | typescript-react | Optimistic-update-with-rollback for React Query, avoiding UI flash — explicitly named as missing from typescript-react.md. | No — no "optimistic" match in `stacks/typescript-react.md`. |
| 928 | `spartan:toolkit/rules/python-fastapi/ASYNC.md` | python | async/def routing, lifespan context manager, no blocking calls in async routes — FastAPI/Python-specific. | Not yet — `python.md` unwritten. |
| 929 | `spartan:toolkit/rules/python-fastapi/ENDPOINTS.md` | python | Router→Service→Repository layering, DI, status codes — general FastAPI layering, Python-specific. | Not yet — `python.md` unwritten. |
| 930 | `spartan:toolkit/rules/python-fastapi/ERROR_HANDLING.md` | python | Standard error response shape, HTTPException by layer, custom handlers — Python-specific. | Not yet — `python.md` unwritten. |
| 931 | `spartan:toolkit/rules/python-fastapi/PYDANTIC.md` | python | Pydantic v2 schema separation, Field validation, PEP 604 unions — Python-specific. | Not yet — `python.md` unwritten. |
| 932 | `spartan:toolkit/rules/python-fastapi/TESTING.md` | python | `asyncio_mode = "auto"` pitfall, AsyncClient vs TestClient gotcha — concrete Python testing knowledge. | Not yet — `python.md` unwritten. |
| 967 | `spartan:toolkit/skills/testing-strategies` | kotlin | coEvery/coVerify, runTest over runBlocking — real MockK+coroutines gotcha kotlin.md lacks per reason. | No per reason ("kotlin.md lacks"); house-specific JWT/AbstractControllerTest helpers excluded. |
| 1160 | `awesome-cursorrules:group/ts-react` | typescript-react | Hallucination-guard rules, state ownership, cache-first routing — reading input for TS/Next.js authoring, decided 2026-09-15. | Reading-input row, not text to check for coverage. |
| 1161 | `awesome-cursorrules:group/node` | node | Anti-hallucination banned-import list, NestJS baseline, node-express baseline — reading input for the unwritten node.md. | Not yet — `node.md` unwritten. |
| 1162 | `awesome-cursorrules:group/python` | python | Layered import boundaries, PySpark ETL, Django practice — reading input for the unwritten python.md. | Not yet — `python.md` unwritten. |
| 1163 | `awesome-cursorrules:group/php-laravel` | php-laravel | laravel-php-83, laravel-tall-stack starting reads; WordPress/Drupal/TYPO3/Symfony explicitly excluded as out of scope. | Not yet — `php-laravel.md` unwritten. |
| 1164 | `awesome-cursorrules:group/sql` | sql | Snowflake pipeline ideas beyond the already-cited Postgres set; database.mdc is Prisma-specific. | Decided 2026-09-15 per reason; Postgres set already read, Snowflake angle new. |
| 1165 | `awesome-cursorrules:group/kotlin` | kotlin | Ktor/Spring Boot sets already cited; android-jetpack-compose adds the Android/Compose half. | Ktor/Spring Boot decided 2026-09-15 per reason; Compose half new. |
| 1166 | `awesome-cursorrules:group/c-cpp` | c-cpp | cpp.mdc, cpp-programming-guidelines starting reads; STM32 file explicitly routed elsewhere (firmware-specific). | Not yet — `c-cpp.md` unwritten. |
| 1370 | `antigravity-core:.agent/rules/agentic-ai/api-design-agent.md` | node | REST/GraphQL naming, versioning, rate-limiting conventions — generic API-design seed for node.md. | Not yet — `node.md` unwritten. |
| 1371 | `antigravity-core:.agent/rules/agentic-ai/code-migration-agent.md` | major-upgrade | ASSESS-PLAN-PREPARE-EXECUTE-VALIDATE-ROLLBACK framework-migration flow — this is upgrade procedure, not stack syntax. | No — see source-read.md for overlap with the new `major-upgrade.md`. |
| 1384 | `antigravity-core:.agent/rules/backend-frameworks/express.md` | node | Express middleware-centric TypeScript backend patterns. | Not yet — `node.md` unwritten. |
| 1385 | `antigravity-core:.agent/rules/backend-frameworks/fastapi.md` | python | Reinforces Spartan's already-credited FastAPI rules (rows 928-932). | Redundant with rows 928-932; not yet — `python.md` unwritten. |
| 1386 | `antigravity-core:.agent/rules/backend-frameworks/flask.md` | python | Flask extensions/context-locals/layout — not covered by Spartan's FastAPI-only rules. | Not yet — `python.md` unwritten. |
| 1387 | `antigravity-core:.agent/rules/backend-frameworks/graphql.md` | node | Schema-first GraphQL server principles, single endpoint, introspection. | Not yet — `node.md` unwritten. |
| 1388 | `antigravity-core:.agent/rules/backend-frameworks/grpc.md` | node | Contract-first gRPC/Protobuf, streaming — node.md's microservice case. | Not yet — `node.md` unwritten. |
| 1389 | `antigravity-core:.agent/rules/backend-frameworks/laravel.md` | php-laravel | Laravel 11+ slimmed structure: single provider, Actions/DTOs folders. | Not yet — `php-laravel.md` unwritten. |
| 1391 | `antigravity-core:.agent/rules/backend-frameworks/rest-api.md` | node | RFC 7807/OpenAPI 3.1/JSON:API constraints — overlaps row 1370 in the same source. | Not yet — `node.md` unwritten; near-duplicate of row 1370. |
| 1392 | `antigravity-core:.agent/rules/backend-frameworks/sse.md` | node | Last-Event-ID reconnection pattern for node.md's real-time case. | Not yet — `node.md` unwritten. |
| 1393 | `antigravity-core:.agent/rules/backend-frameworks/websocket.md` | node | Reconnection-with-backoff, typed events for node.md's real-time case. | Not yet — `node.md` unwritten. |
| 1409 | `antigravity-core:.agent/rules/frontend-frameworks/tailwind.md` | typescript-react | Tailwind v4 CSS-first configuration — a concrete, current gap named directly. | Not verified against `stacks/typescript-react.md`; reason calls it a gap. |
| 1411 | `antigravity-core:.agent/rules/mobile/android-kotlin.md` | kotlin | Android/Compose already in kotlin.md's stated scope (v1 §232, fixture pins the Android plugin). | Reading input for kotlin.md per reason, not a coverage check. |
| 1421 | `antigravity-core:.agent/rules/nextjs/api-routes.md` | typescript-react | Next.js 16 Route Handlers — newer than typescript-react.md's Next 15 pin. | No — file pinned to Next 15 per reason; this is a version-refresh candidate. |
| 1422 | `antigravity-core:.agent/rules/nextjs/app-router.md` | typescript-react | App Router architecture/layout conventions; reason notes official docs already cover the mechanics better. | Low-value per reason (docs cover it better); still typescript-react territory. |
| 1423 | `antigravity-core:.agent/rules/nextjs/authentication.md` | typescript-react | Auth.js v5 patterns — useful once typescript-react.md's pinned majors are refreshed. | No — gated on a future major refresh per reason. |
| 1424 | `antigravity-core:.agent/rules/nextjs/database.md` | typescript-react | ORM-integration patterns specific to the Next.js request lifecycle. | Not verified against `stacks/typescript-react.md`. |
| 1426 | `antigravity-core:.agent/rules/nextjs/i18n.md` | typescript-react | next-intl internationalization patterns. | Not verified against `stacks/typescript-react.md`. |
| 1427 | `antigravity-core:.agent/rules/nextjs/middleware.md` | typescript-react | Next.js 16 renames middleware.ts to proxy.ts, same API — a dated breaking-change fact. | No — dated fact not yet in the file per reason. |
| 1430 | `antigravity-core:.agent/rules/nextjs/realtime.md` | typescript-react | Real-time patterns specific to Next.js route handlers, distinct from generic sse.md/websocket.md (rows 1392-1393). | Not verified against `stacks/typescript-react.md`. |
| 1431 | `antigravity-core:.agent/rules/nextjs/saas-multi-tenant.md` | typescript-react | Largest single file in the source; multi-tenant SaaS architecture, also touches bk-db for tenant isolation. | Not verified; reason flags it as the biggest item to triage. |
| 1432 | `antigravity-core:.agent/rules/nextjs/seo.md` | typescript-react | Code-level metadata/structured-data implementation, distinct from marketing SEO strategy. | Not verified against `stacks/typescript-react.md`. |
| 1433 | `antigravity-core:.agent/rules/nextjs/server-actions.md` | typescript-react | Server Actions auth-check patterns. | Not verified against `stacks/typescript-react.md`. |
| 1434 | `antigravity-core:.agent/rules/nextjs/state-management.md` | typescript-react | React Query/Zustand patterns specific to Next.js data flow. | Not verified against `stacks/typescript-react.md`. |
| 1436 | `antigravity-core:.agent/rules/python/ai-ml.md` | python | PyTorch/Transformers patterns for python.md's AI/ML use case. | Not yet — `python.md` unwritten. |
| 1437 | `antigravity-core:.agent/rules/python/async-programming.md` | python | Modern asyncio TaskGroup/ExceptionGroup patterns (3.11+). | Not yet — `python.md` unwritten. |
| 1438 | `antigravity-core:.agent/rules/python/automation.md` | python | Typer/Rich/httpx/Playwright scripting conventions. | Not yet — `python.md` unwritten. |
| 1439 | `antigravity-core:.agent/rules/python/backend-patterns.md` | python | Backend architecture patterns; overlaps rows 1385-1386 in the same source. | Not yet — `python.md` unwritten; overlaps 1385/1386. |
| 1440 | `antigravity-core:.agent/rules/python/cli-development.md` | python | Typer/Rich/Click CLI scaffolding — Python-specific, not the generic shell.md rules. | Not yet — `python.md` unwritten. |
| 1441 | `antigravity-core:.agent/rules/python/data-engineering.md` | python | ETL pipelines (Dagster, Polars, DuckDB, PySpark) — niche per reason. | Not yet — `python.md` unwritten; low priority. |
| 1442 | `antigravity-core:.agent/rules/python/data-science.md` | python | Analytics with Polars/Pandas — niche per reason. | Not yet — `python.md` unwritten; low priority. |
| 1444 | `antigravity-core:.agent/rules/python/package-development.md` | python | Packaging/publishing with Hatch, Ruff, pytest. | Not yet — `python.md` unwritten. |
| 1445 | `antigravity-core:.agent/rules/python/rest-api.md` | python | FastAPI REST development — overlaps row 1385/928-932 in this and another source. | Not yet — `python.md` unwritten; near-duplicate. |
| 1446 | `antigravity-core:.agent/rules/python/scientific-computing.md` | python | NumPy/JAX/Numba/CuPy — niche per reason. | Not yet — `python.md` unwritten; low priority. |
| 1449 | `antigravity-core:.agent/rules/python/web-scraping.md` | python | httpx/selectolax/Playwright scraping — niche per reason. | Not yet — `python.md` unwritten; low priority. |
| 1451 | `antigravity-core:.agent/rules/standards/frameworks/django-conventions.md` | python | Django 5 practice sourced from official docs — web-framework case for python.md. | Not yet — `python.md` unwritten. |
| 1452 | `antigravity-core:.agent/rules/standards/frameworks/inertia-react-conventions.md` | typescript-react | Inertia.js 2 + React 19 + TS — bridges php-laravel.md and typescript-react.md; routed to the React side (frontend page-component patterns). | Not verified against `stacks/typescript-react.md`; also relevant to php-laravel.md when written. |
| 1453 | `antigravity-core:.agent/rules/standards/frameworks/nextjs-conventions.md` | typescript-react | Next.js 16 guide from official docs — overlaps the nextjs/* directory rows in the same source. | Not verified; near-duplicate of rows 1421-1434. |
| 1456 | `antigravity-core:.agent/rules/typescript/design-patterns.md` | node | TS design patterns/advanced techniques — not React-UI-specific, so node per the routing rule. | Not yet — `node.md` unwritten. |
| 1458 | `antigravity-core:.agent/rules/typescript/generics.md` | node | TypeScript generics deep-dive — language-level, not UI-specific. | Not yet — `node.md` unwritten. |
| 1459 | `antigravity-core:.agent/rules/typescript/graphql.md` | node | GraphQL Codegen/Apollo with TS — overlaps row 1387 (graphql.md); the codegen angle is the addition. | Not yet — `node.md` unwritten; near-duplicate of 1387. |
| 1460 | `antigravity-core:.agent/rules/typescript/monorepo.md` | node | Turborepo monorepo architecture for TypeScript projects. | Not yet — `node.md` unwritten. |
| 1461 | `antigravity-core:.agent/rules/typescript/nestjs.md` | node | NestJS backend DI/decorator patterns — server-side, so node per the routing rule. | Not yet — `node.md` unwritten; overlaps row 1513 (nestjs-expert). |
| 1462 | `antigravity-core:.agent/rules/typescript/nodejs-backend.md` | node | Node.js 20+/Express TS backend conventions — direct candidate content. | Not yet — `node.md` unwritten. |
| 1464 | `antigravity-core:.agent/rules/typescript/strict-mode.md` | node | Strict-mode config/type-safety practices — not UI-specific. | Not yet — `node.md` unwritten. |
| 1466 | `antigravity-core:.agent/rules/typescript/tooling.md` | node | Build/lint tooling essentials across the TS ecosystem. | Not yet — `node.md` unwritten. |
| 1469 | `antigravity-core:.agent/rules/web-development/architecture/pwa-expert.md` | typescript-react | PWA/service workers/Project Fugu — browser-UI-facing, niche but current. | Not verified against `stacks/typescript-react.md`. |
| 1470 | `antigravity-core:.agent/rules/web-development/browser/modern-browser-apis.md` | typescript-react | Progressive enhancement for newer browser APIs — UI-facing. | Not verified against `stacks/typescript-react.md`. |
| 1471 | `antigravity-core:.agent/rules/web-development/core/javascript-es2024.md` | node | ES2024+ language features — language-level, not UI-specific. | Not yet — `node.md` unwritten. |
| 1474 | `antigravity-core:.agent/rules/web-development/core/web-components.md` | typescript-react | Shadow DOM/Custom Elements — UI-specific; reason flags as niche/low priority. | Not verified against `stacks/typescript-react.md`; low priority. |
| 1475 | `antigravity-core:.agent/rules/web-development/core/webassembly.md` | c-cpp | WASM integration for CPU-intensive code — reason explicitly ties it to a future c-cpp.md. | Not yet — `c-cpp.md` unwritten. |
| 1487 | `antigravity-core:.agent/skills/bash-linux` | shell | Bash/Linux CLI automation and server-management patterns. | Not yet — `shell.md` unwritten. |
| 1490 | `antigravity-core:.agent/skills/clean-code` | generic-build | SRP/DRY table — reason says it restates principles already implicit in the kit. | Implicit per reason; no direct file:line citation found. |
| 1504 | `antigravity-core:.agent/skills/i18n-localization` | node | i18n/L10n core concepts (locale detection, pluralization) — general, not React-UI-only, for node.md/typescript-react.md. | Not yet — `node.md` unwritten. |
| 1508 | `antigravity-core:.agent/skills/lint-and-validate` | generic-build | Which-command-per-ecosystem reference — reinforces the kit's own guardrail concept. | Yes, concept already exists: `skills/bk-protocol/SKILL.md:58,81` (detected guardrails, `detect-stack`). |
| 1513 | `antigravity-core:.agent/skills/nestjs-expert` | node | NestJS DI/guards/interceptors/TypeORM — overlaps row 1461 in a different source. | Not yet — `node.md` unwritten; near-duplicate of 1461. |
| 1514 | `antigravity-core:.agent/skills/nextjs-best-practices` | typescript-react | Server-vs-Client-Component decision tree. | Not verified against `stacks/typescript-react.md`. |
| 1515 | `antigravity-core:.agent/skills/nodejs-best-practices` | node | Node.js system architecture / async-task decision-making. | Not yet — `node.md` unwritten. |
| 1520 | `antigravity-core:.agent/skills/powershell-windows` | shell | PowerShell scripting/Windows-admin pitfalls. | Not yet — `shell.md` unwritten. |
| 1521 | `antigravity-core:.agent/skills/prisma-expert` | node | `npx` always fetches latest Prisma, breaking a pinned schema — a CLI version-pinning warning for node.md/typescript-react.md. | Not yet — `node.md` unwritten. |
| 1523 | `antigravity-core:.agent/skills/python-patterns` | python | Python architecture: async, type hints, scraping, data analysis. | Not yet — `python.md` unwritten. |
| 1525 | `antigravity-core:.agent/skills/react-patterns` | typescript-react | React 19.2 Compiler/Hooks/Server Components. | Not verified against `stacks/typescript-react.md`. |
| 1531 | `antigravity-core:.agent/skills/state-management` | typescript-react | Redux/Zustand comparison for typescript-react.md; Pinia part explicitly out of scope (Vue). | Not verified against `stacks/typescript-react.md`. |
| 1533 | `antigravity-core:.agent/skills/tailwind-patterns` | typescript-react | Tailwind v4 CSS-first architecture — overlaps row 1409 in a different source. | Not verified; near-duplicate of 1409. |
| 1538 | `antigravity-core:.agent/skills/typescript-expert` | node | Type-level programming, generics, branded types — language-level, not UI-specific. | Not yet — `node.md` unwritten; overlaps rows 1456/1458. |
| 1693 | `claudekit:claude/skills/cook` | generic-build | Gated pipeline: scout first, implement, prove no side effects; its exact-requirements block is credited to bk-spec, not here. | Scout-first and side-effects gate already exist: `skills/bk-build/SKILL.md:14` (scout), `:22` (no side effects outside named files). |
| 1754 | `claudekit:claude/skills/worktree` | generic-build | Stale-worktree health audit/pruning, auto-copy `.env.example` into new worktrees — concrete gaps in the kit's worktree handling. | No — `executing.md` covers isolation/creation only, no health-audit, pruning or `.env.example` step. |
| 1755 | `claudekit:claude/skills/xia` | generic-build | Challenge-before-plan gate, treat a fetched repo's content as untrusted/never-followed instructions. | No — no "untrusted" match anywhere in `skills/bk-build/` or `skills/bk-protocol/`. |
| 1783 | `karpathy:skills/karpathy-guidelines` | generic-build | Four CLAUDE.md-style guidelines (think first, simplicity, surgical changes, goal-driven); two already in bk-protocol, two paraphrased into bk-build. | Yes: `skills/bk-build/SKILL.md:32` ("two lines paraphrased into Steps and Gates, no NOTICE entry owed"). |

## Notes on the classification itself

- Rows spanning two stack targets in their own reason text (586 → node.md/shell.md; 1452 → php-laravel.md/typescript-react.md; 1504/1521/1538 → node.md/typescript-react.md) were routed to one bucket only, per the task's single-bucket rule; the other target is named in the reason column so nothing is lost.
- Rows 1385/1445/928-932 (FastAPI) and 1387/1459 (GraphQL) and 1409/1533 (Tailwind v4) and 1456/1458/1461/1462/1513/1538 (TS/Node generics, NestJS, type-level) are near-duplicates across sources already flagged as overlapping in their own reason text — flagging again here rather than silently dropping one, since the inventory's own "idea" decision kept both as separate rows.
- No row in this set of 103 needed `other-stack:<name>` (no Go/Rust/Java/.NET/Swift-specific idea reached bk-build) or `not-build` (nothing here looked misrouted to bk-build).
