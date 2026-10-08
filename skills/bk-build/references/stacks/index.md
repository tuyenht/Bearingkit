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
| no language: a `.sh`, `.bash` or `.ps1` file in the tree, like `sql.md` below | `shell.md` | written |
| `languages: java`, `go`, `rust`, `csharp` or `terraform` | — | **no file, none planned yet**: spec §5.5's first eight do not include them. The profile still carries their guardrail commands; say the file is missing rather than borrowing another stack's |

## `sql.md` and `shell.md` are reached by what the tree holds

No manifest declares SQL or shell, so neither has a language row above. `detect-stack` lists `sql.md` under `stackFiles` when the tree holds a `.sql` file or a migrations directory (`migrations/`, `db/migrate/`, `alembic/`), and `shell.md` when it holds a script, skipping dependency, build and hidden directories, down to four levels and a bounded number of entries. A tree with no manifest at all still gets a profile when one of the two is listed. A large or deep tree can hide the signal, so `sql.md` is also opened **by subject matter**: the change touches a query, a migration, a schema, or an index — whatever language the surrounding code is written in. A Kotlin service writing a migration reads `kotlin.md` and `sql.md` both; a change that writes or edits a script opens `shell.md` the same way.

## When a stack has no file

Say so rather than improvising from the nearest one. The gap is a real finding for the session's handoff, and spec §5.5 lists eight stacks as the first set — seven exist today. Nothing in the kit pretends a missing file is covered.

## Adding one

Each file opens with a version card that states what it was checked against **and what it was not**; `typescript-react.md`, `kotlin.md`, `sql.md`, `python.md` and `php-laravel.md` were cross-checked only against fixtures, because no live project of those stacks exists on the machine that wrote them; `shell.md` had its PowerShell lines run on that machine and its Bash lines not; `node.md` was checked against this repository, a plain Node project. The first project that uses a file refreshes that line from its own profile output (spec §16).
