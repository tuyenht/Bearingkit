# bk-perf · method: from a symptom to a kept change

## The symptom tree: what to measure first

| The user feels | First measurement | Usually points at |
|---|---|---|
| slow first load of a page | a cold-load trace with reload, production build; its LCP split into server response, resource load delay, resource load duration and render delay | the slowest phase: the document (server), a late-discovered or lazy LCP resource, a large resource, render-blocking CSS or script |
| sluggish clicks or typing | a trace of the interaction; long tasks on the main thread | script run on input, re-renders, layout work |
| content jumping | a trace's layout-shift entries, with the element that moved | media without size, late-injected content, web fonts swapping |
| memory growing over use | heap snapshots: baseline, after repeating one action several times, after undoing it | what still retains the objects that should have been freed |
| one endpoint slow | server timing for that request split into its parts: queries, calls out, own compute | the part with the largest share; queries go to bk-db |
| every endpoint slow at once | time waiting for a database connection against time in queries; the database's active and idle sessions | pool exhaustion when requests wait for a connection while the database sits idle; a bigger pool is rarely the fix, and the connection work is bk-db's |
| slow under load only | a load test of the kind the question asks (below) | the first resource to saturate: CPU, connections, a lock, memory |

Logs rarely locate a performance problem; a timing, a profile or a plan does. When the tree gives no branch, profile the running code with the runtime's own profiler and let the profile name the branch.

## The baseline

- Same command, same conditions, every time: cold or warm cache stated, production build, the device or network throttling stated, the same data volume, nothing else running on the machine.
- Runs: enough to see the spread, and the spread is written down with the median. A difference inside the spread is noise, not a result.
- Field data (real users), lab data (a scripted run) and trace data (one recorded load) are labelled by source; they answer different questions and are never compared as one series.
- Numbers read from source code alone are not measurements: write "potential impact".

## Thresholds and budgets

- A metric's thresholds come from its owner, cited with the page and the date read: web.dev for Core Web Vitals; the tool's own documentation for a tool's score. Sources restate these numbers and disagree with each other; the owner's page is the only one cited.
- A budget (bundle size per route, image weight, font files, API p95) is the project's decision, written where CI can check it. Propose one from the baseline when the project has none; do not invent it from a rule of thumb.

## Deciding

A change stays only when its result beats the baseline by more than the spread and every test still passes; its commit then records both numbers and the method. Everything else is reverted: a result inside the spread (the change measured nothing, and code that measured nothing still has to be maintained), a worse result, and a better one reached by breaking a test or by skipping work the product needs.

## The ledger

Record every attempt, the reverted ones too: what was tried, the numbers before and after with how they were taken, and whether it stayed and why. It lives with the work (the handoff, or a note the project already keeps), so a dead idea is not tried again. An attempt is its own commit when the project allows, so a revert is one command.

## Tail latency

With production percentiles available, compare p99 with p50 per endpoint or job: a high ratio marks the unpredictable part, often a better target than the highest p99. Without telemetry, say so instead of estimating.

## Load tests

Choose the kind by the question: load (expected traffic holds), stress (where it breaks), spike (a sudden jump), soak (hours at steady load, which surfaces leaks). For an API, drive a fixed arrival rate, so a slowing server does not lower the load it is offered. Thresholds live in the script and fail the run. Never against production without a council.
