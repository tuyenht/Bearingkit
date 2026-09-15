# TypeScript and React

**Written against:** React 19, Next.js 15, TypeScript 5.6 — the majors pinned in this repository's own eval fixture (`evals/fixtures/sample-app/package.json`), not a survey of what shipped since. **Cross-checked against a live project: no.** There is no reference project for this stack on the machine this file was written on, so every version claim below is at fixture level. The first real project that reads this file refreshes this line from its own `detect-stack` output, and anything newer than these majors goes through the pinned-documentation rule in `bk-protocol/references/evidence.md` before its syntax is written.

**Read as a starting point, not vendored:** PatrickJS/awesome-cursorrules (CC0-1.0) TypeScript and Next.js sets, and vercel-labs/agent-skills `react-best-practices` (no license file — read for its category structure only, no text taken). The text here is the kit's own.

## Order of attack when something is slow

The categories are not equal, and the order matters more than any single rule. Waterfalls first, bundle second, server third, client fetching fourth, re-renders last. A re-render micro-optimisation shipped while a sequential `await` chain is still in place is wasted work.

1. **Waterfalls.** Every sequential `await` costs a full round trip. Two requests that do not feed each other run in parallel or they are a bug. Check: does any `await` in the path depend on the value of the one before it? If not, they belong in one `Promise.all`.
2. **Bundle.** What ships on first load decides Time to Interactive. A dependency pulled in for one helper, an icon set imported whole, a date library where `Intl` would do — each is a finding with a number attached, from the build's own output, not an impression.
3. **Server.** Data fetched inside a component that renders on the server is a server-side waterfall of its own; hoist it and pass it down.
4. **Client fetching.** Deduplicate before caching. The same key requested twice in one render is the common case.
5. **Re-renders.** Measure first with the profiler; `memo` without a measurement is cargo.

## Rules that hold regardless of version

- **The type is the contract.** A value that cannot be invalid is better than a check that runs. Prefer a narrowed union to a `string` plus a comment, and make impossible states unrepresentable rather than guarded.
- **No `any` in a diff.** `unknown` plus a narrowing at the boundary is the honest version. An `any` that survives review is a hole the type-checker will never mention again.
- **Effects are for synchronising with something outside React**, not for deriving state. A `useEffect` whose only job is to set state from props is a render-time computation wearing a costume.
- **Keys are identity, not position.** An array index as a key is correct only for a list that never reorders, never filters and never grows in the middle.
- **Boundaries need both.** A component that can suspend needs a suspense boundary, and a component that can throw needs an error boundary. Neither is optional on a route that users reach.
- **Server and client code look alike and are not.** Anything reading a secret, a filesystem or a database belongs where the client cannot import it; the compiler will not always tell you.

## Evidence this stack can produce

- Type-check output (`tsc --noEmit`) pasted, not summarised.
- The build's bundle report before and after, when a change claims a size win.
- For a rendered check: the page opened, a screenshot, and the network panel's request count — class names in the markup are not evidence that a page works.

## Guardrails `detect-stack` will name

`tsc --noEmit` when a `tsconfig.json` exists; the project's `test` and `lint` scripts; `biome check --error-on-warnings .` instead of the lint script when the project has Biome. Run what the profile names, in full, and paste it.
