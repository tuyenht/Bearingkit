---
name: bk-perf
description: "Measure, then optimize page speed, memory, bundle size and API latency; every number with its method. Use when: slow page, LCP, memory leak, bundle too big, load test, p95; trang chậm, ngốn RAM, tối ưu hiệu năng. Not for: slow SQL or indexes (bk-db), errors (bk-debug), a firing alert (bk-ops)."
---

# bk-perf

## Read first
- The project's instruction files, and the stack profile (run `detect-stack` as bk-protocol's host notes say): framework, rendering model and build mode decide which measurements mean anything.
- The project's own performance budgets, earlier measurements and attempts: `docs/`, CI config, handoffs. A budget the project set wins over any number here.
- `references/method.md` before the first measurement; `references/levers.md` before proposing a change.

## Steps
Name the symptom first, as the user feels it: slow first load, sluggish interaction, layout jumping, memory growing, one endpoint slow, every endpoint slow. An error or a failing test is bk-debug's; a firing alert is bk-ops's.

1. Pick the first measurement the symptom tree of `references/method.md` names. If the time is spent in the database (queries or waiting for a connection), hand the database part to bk-db and keep the rest.
2. Find the tools before measuring: a page-load trace, heap snapshots, a profiler, a load tool (`bk-protocol/references/host-tools.md`). When the vendor's `debug-optimize-lcp` or `memory-leak-debugging` skill is installed, open it and follow it for LCP or for a leak. No tool: say what cannot be measured, and mark findings from reading source as "potential impact", never a number.
3. Take the baseline: the same command and conditions every time (cold load, production build, stated device or throttling, the same data), repeated enough to see the noise, recorded with its method.
4. Locate: follow the measurement to what it names, the file or request and its imports, not a search of the whole repository; rank candidates by their measured share of the time or memory, not by how easy the fix is.
5. Change one thing, then measure exactly as the baseline. Keep it only when it beats the noise and the tests pass; within noise, worse, or a test red: revert. Every attempt, reverted ones too, goes in the ledger of `references/method.md`.
6. Guard what was won when the project wants it: a budget checked in CI, or thresholds inside the load script that fail the run; the number is the project's.

A cause is named only when this code or a measurement shows it; one known only from experience is a question to check, labelled so. A size, a time or a count appears only beside the measurement it came from.

## Gates
- No number without its method (tool, conditions, runs) or the label "not measured"; lab, field and trace numbers are labelled by source and never swapped.
- Thresholds come from the metric's owner, cited with its page and date (web.dev for Core Web Vitals), or from the project's budget; never from memory.
- A cache is a safety question first: every input the response depends on is in the key, nothing per user or behind auth is shared, one invalidation rule. Caching authenticated responses is COUNCIL.
- Load tests run against a non-production target; one against production, or a shared staging, is COUNCIL.
- Raw heap-snapshot and trace files are read through the tools that summarize them, never opened whole.

## Evidence to paste
- The symptom, the baseline with its method and noise, what the measurement pointed at (`file:line` or request), each attempt with before and after and its verdict, what was kept, and what stayed "not measured".

## Next step
- bk-build for a kept change that still needs its tests; bk-spec when the fix is a feature or a redesign; bk-db for the database part.

Sources: no upstream text vendored - ideas only from addyosmani/agent-skills (MIT), jeffallan/claude-skills (MIT), cloudflare/skills (Apache-2.0), anthropics/claude-plugins-official (Apache-2.0), mattpocock/skills (MIT), vercel-labs/agent-skills and c0x12c/ai-toolkit (no license), tuyenht/Antigravity-Core (owner's own), claudekit/claudekit-engineer (proprietary, clean-room, from its inventory rows only); page-load traces and heap snapshots yield to ChromeDevTools/chrome-devtools-mcp (Apache-2.0) skills; tool behaviour in docs/compat/2026-09-23-bk-perf-tool-claims.md.
