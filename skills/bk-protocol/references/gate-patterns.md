# Gate patterns

Used by bk-spec and the stack block to pre-classify a change. Patterns are globs relative to the repository root; content patterns apply to code lines only, never to comments or docs. The project's own instruction files may extend any row.

| Class | Path patterns | Content patterns (code lines) | Size rule |
|---|---|---|---|
| COUNCIL area | `**/migrations/**`, `**/schema.*`, `**/auth/**`, `**/session*/**`, `**/roles/**`, `**/permissions/**`, `**/payments/**`, `**/billing/**`, `**/tenant*/**`, `**/middleware/**`, `**/api/contracts/**`, `infra/**`, `deploy/**`, `*.tf` | `DROP TABLE`, `ALTER TABLE`, `password`, `token`, `secret`, `role`, `permission`, `tenant_id`, `DELETE FROM`, `rm -rf` | COUNCIL only when the change also alters behavior or exceeds about twenty lines |
| ACT even inside a COUNCIL area | comments, formatting, tests, docs, lint fixes | — | always ACT |
| Hot path (independent review before push) | every COUNCIL-area path plus `**/upload*/**` and user-authored HTML or URL handling | as above | any size |
| Remote or production | commands that ssh, deploy, or run against a production URL or database | — | always COUNCIL |

Decision order: remote or production → COUNCIL. Otherwise, if no COUNCIL-area path or content pattern matches → ACT. If one matches and the change is comments, formatting, tests or docs → ACT. If one matches and the change alters behavior or exceeds about twenty lines → COUNCIL. Unsure → COUNCIL. Hot path is orthogonal: it adds the independent review requirement whatever the class.
