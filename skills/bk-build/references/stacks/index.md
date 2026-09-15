# Which stack file to open

`detect-stack` does not report a file name. It reports `languages` and `frameworks`, and this table maps them. Checked against the profile's real output on this repository's own fixtures (`tests/fixtures/stacks/`) on 2026-09-15, not from memory.

| Profile says | Open | Status |
|---|---|---|
| `languages: typescript` or `javascript`, **and** a framework named `react` or `next` | `typescript-react.md` | written |
| `languages: typescript` or `javascript`, no React or Next framework | `node.md` | **not written yet** — use `typescript-react.md`'s type and evidence sections, skip its rendering rules |
| `languages: kotlin` | `kotlin.md` | written |
| `languages: python` | `python.md` | **not written yet** |
| `languages: php` (framework `laravel`) | `php-laravel.md` | **not written yet** |
| `languages: c` or `cpp` | `c-cpp.md` | **not written yet** |
| shell scripts | `shell.md` | **not written yet** |

## `sql.md` is not reached this way

No manifest declares SQL, so `detect-stack` never names it and it has no row above. It is opened **by subject matter**: the change touches a query, a migration, a schema, or an index — whatever language the surrounding code is written in. A Kotlin service writing a migration reads `kotlin.md` and `sql.md` both.

## When a stack has no file

Say so rather than improvising from the nearest one. The gap is a real finding for the session's handoff, and spec §5.5 lists eight stacks as the first set — three exist today. Nothing in the kit pretends a missing file is covered.

## Adding one

Each file opens with a version card that states what it was checked against **and what it was not**; the three written so far were cross-checked only against fixtures, because no live project of those stacks exists on the machine that wrote them. The first project that uses a file refreshes that line from its own profile output (spec §16).
