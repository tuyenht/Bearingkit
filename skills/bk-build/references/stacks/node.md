# Node (JavaScript and TypeScript without React)

**Written against:** Node 20 and later, CommonJS, `node --test`, no dependencies — the shape of this repository itself (`package.json` declares `engines.node >=20`; the code is `scripts/*.cjs` and `bin/`). **Cross-checked against a live project: this repository only.** `detect-stack` run on it reports `languages: javascript`, no framework, `npm`, and one guardrail, `npm test`. Nothing here was checked against a TypeScript, ESM or framework project, so the TypeScript section below is at source level. The first such project that reads this file refreshes this line from its own `detect-stack` output; a major newer than the project's own goes through the pinned-documentation rule in `bk-protocol/references/evidence.md` first.

**Read as a starting point, not vendored:** jeffallan/claude-skills (MIT) `cli-developer`, `javascript-pro` and `typescript-pro`; cloudflare/skills (Apache-2.0) `workers-best-practices`, only the rules any Node host shares; PatrickJS/awesome-cursorrules (CC0-1.0) Node set. The text here is the kit's own. A project's framework conventions — Express, NestJS, its error type, its layout — come from that project's instruction files, never from this file. With React or Next in the profile, `typescript-react.md` is the file; its type rules hold here too.

## Async work is where the bugs are

- **No floating promise.** A promise that is neither awaited, returned, nor handed to something that owns its lifetime drops its result, swallows its error and may never finish. Where the project already has a floating-promise lint rule, run it; adding one is a separate change.
- **Concurrency has a bound.** Work over a list of unknown length runs through a queue with a maximum in flight, not every call started at once.
- **Every network call has a deadline.** Pass the call an `AbortController`'s signal, and abort it from a timer or when the caller gives up.
- **An async failure is not logged and turned into `null`.** The caller can no longer tell "not found" from "failed"; the error propagates, or is returned as an error the caller has to handle.

## State, bodies and secrets

- **Module scope is shared by every request the process serves.** A mutable `let` at the top of a file, assigned inside a handler, leaks one request's data into the next; request state travels through arguments.
- **A body of unbounded size is streamed, not buffered.** `await res.text()`, `.json()` or `.arrayBuffer()` on data that can be large holds all of it in memory; a small payload of known size is fine to buffer.
- **Secrets and signatures are compared in constant time**, never with `===`: in Node, `crypto.timingSafeEqual` on two values hashed to the same length first, so a length mismatch does not return early.

## Modules and packages

- **One module system per file.** `require` and `import` are not mixed in one module; `package.json`'s `type` and the `.cjs`/`.mjs` extensions say which the project uses, and a change follows them rather than converting.
- **A package is not imported on the assumption it exists.** If it is not in `package.json`, check before writing the import.

## Command-line programs

- **Data to stdout, everything else to stderr.** Logs, progress and warnings on stdout corrupt the output of anything piped into another program.
- **Colour only on a terminal:** check `process.stdout.isTTY` before colouring.
- **Every prompt has a non-interactive path** — a flag or an environment variable — so the command runs in CI.
- **A renamed flag or subcommand is a breaking change** for every script that calls it, not a cleanup.

## TypeScript, when the project uses it

`typescript-react.md`'s rules on types (the type is the contract; no `any` in a diff) apply unchanged. In addition:
- A `switch` over a discriminated union ends in a `default` that passes the value to a function taking `never`, so a new variant is a compile error.
- IDs of different kinds are branded types, so one cannot be passed where the other is expected.
- `satisfies` over `as` when a literal is checked against a type.
- `noUncheckedIndexedAccess` belongs to a strict configuration; turning it on in an existing project is its own change, not part of a feature's diff.

## Evidence

The test run's output pasted in full, and for a behaviour change the failing run before the passing one.

## Guardrails `detect-stack` will name

The project's `test` script through its package manager (`npm test`, `pnpm test`); `tsc --noEmit` when a `tsconfig.json` exists; the project's `lint` script, or `biome check --error-on-warnings .` when the project has Biome; with neither, `eslint --max-warnings 0 .` directly, and `prettier --check .` when Prettier is present without Biome. Run what the profile names, in full, and paste it.
