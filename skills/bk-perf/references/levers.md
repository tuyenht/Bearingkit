# bk-perf · levers: where the time and bytes usually go

Read after a measurement has named the part to fix. Each lever is a hypothesis to measure, not a fix to apply everywhere; the stack files in `bk-build/references/stacks/` hold the framework-specific rules.

## Order to look in

The request chain first (redirects, the document's server time, what the first response waits on), then what ships (script, styles, images, fonts), then server work, then data fetching on the client, then re-renders. A later layer rarely pays for a slow earlier one.

## Page load

- LCP by phase: a late start of the LCP resource (loaded from script or CSS, lazy-loaded, not discoverable in the HTML) is fixed by making it discoverable and prioritized; a long download by a smaller or closer resource; a render delay by removing what blocks rendering. Fixing one phase can move the time to the next: measure all four again. When the vendor's `debug-optimize-lcp` skill is installed, it carries the full workflow.
- What ships: code for other routes or unused features, duplicate libraries, polyfills the targets do not need, a preloaded chunk that is empty or unused, fonts shipped whole instead of subset, images larger than they render. A preconnect or origin is "unused" only when the trace shows no request reached it.
- Findings with no measurable saving are listed as such and not recommended.

## Interaction and rendering

- Long tasks on input: split the work, move it off the input path, or do less of it; a re-render of a large tree for a small change is measured with the framework's profiler before any memoization, which costs memory and is kept only when the profile shows the win.

## Memory

- Usual retainers: listeners and timers never removed, detached DOM kept by a reference, closures holding large objects, module-level caches with no bound, console references. The retaining path from the snapshot names the owner; the fix goes there. When the vendor's `memory-leak-debugging` skill is installed, it carries the snapshot workflow. A detached node can be an intentional cache: ask before freeing it.

## Server and data

- N+1: a data call inside a loop. Collect the ids, fetch once, build a lookup, then loop. A per-request cache filled inside the loop is still one call per miss.
- The same data fetched twice in one request: reuse the first result.
- Work fired in the background with nothing tracking it, while the response says it is being processed: either do it in the request, or return a handle the caller can check.
- A query's plan, an index, a lock or the pool size is bk-db's, with the measurement that pointed there.

## Caching

Cache only what is expensive and read again. Name the layer (in process, shared, CDN or browser), its scope, its lifetime and its invalidation, one strategy only. Every input the response depends on is in the key: tenant, locale, user, permissions; a response that varies by user or carries a session is not shared. Guard against many requests rebuilding the same entry at once. "Do not cache" is a valid answer.

## Not slow

A streaming response or a long-lived connection is not slow because it stays open; look for work before its first byte instead.
