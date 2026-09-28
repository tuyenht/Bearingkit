# Which stack file to open

`detect-stack` reports `languages` and `frameworks`, and this table maps them; since 2026-09-27 it also lists the mapped files that exist, as `stackFiles` (absolute paths), so a session reads the list rather than this table. Checked against the profile's real output on every fixture in `tests/fixtures/stacks/` on 2026-09-16, not from memory. (The first version, 2026-09-15, said the same and still had a `c` or `cpp` row: the detector reports `c-cpp` as one language. Only the rows actually run are checked.)

| Profile says | Open | Status |
|---|---|---|
| `languages: typescript` or `javascript`, **and** a framework named `react` or `next` | `typescript-react.md` | written |
| `languages: typescript` or `javascript`, no React or Next framework | `node.md` | written |
| `languages: kotlin` | `kotlin.md` | written |
| `languages: python` | `python.md` | written |
| `languages: php` (framework `laravel` or none) | `php-laravel.md` | written |
| `languages: c-cpp` | `c-cpp.md` | **not written yet** |
| no profile names it — opened by subject matter, like `sql.md` below | `shell.md` | **not written yet** |
| `languages: java`, `go`, `rust`, `csharp` or `terraform` | — | **no file, none planned yet**: spec §5.5's first eight do not include them. The profile still carries their guardrail commands; say the file is missing rather than borrowing another stack's |

## `sql.md` is not reached this way

No manifest declares SQL (or shell), so `detect-stack` never names it and it has no language row above. It is opened **by subject matter**: the change touches a query, a migration, a schema, or an index — whatever language the surrounding code is written in. A Kotlin service writing a migration reads `kotlin.md` and `sql.md` both.

## When a stack has no file

Say so rather than improvising from the nearest one. The gap is a real finding for the session's handoff, and spec §5.5 lists eight stacks as the first set — six exist today. Nothing in the kit pretends a missing file is covered.

## Adding one

Each file opens with a version card that states what it was checked against **and what it was not**; `typescript-react.md`, `kotlin.md`, `sql.md`, `python.md` and `php-laravel.md` were cross-checked only against fixtures, because no live project of those stacks exists on the machine that wrote them; `node.md` was checked against this repository, a plain Node project. The first project that uses a file refreshes that line from its own profile output (spec §16).
