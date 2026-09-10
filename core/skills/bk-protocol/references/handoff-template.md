# Handoff template (two blocks)

Written by bk-close to `docs/handoff/<date>.md`. Every line in Block 2 is checked against `git status` and `git log` before it is written. No secrets, no credentials, no private hostnames.

```markdown
# Handoff · <date>

Branch `<branch>` · working tree <clean | N uncommitted files> · <pushed | not pushed>.
Read this first when resuming on any machine. Rewrite it before the last commit of a session.

## Block 1 · Durable knowledge

### Facts established (do not re-derive)
- <fact, with how it was verified>

### Decisions taken
- <decision, with the reason and where it is recorded>

### Rejected options (do not re-propose)
- <option>: <why not>

### Lessons (candidate lines for the lessons log)
- RULE | <scope> | WHEN … THEN … NOT … | <evidence> | <date>

## Block 2 · Resume payload

### State
- <what exists, what is half-done, what is untested>

### Decisions waiting on the owner
1. <decision, with the recommended answer>

### Open threads
- <thread and where it lives>

### Live temporary bypasses
- <file:line marked TEMPORARY or REMOVE, and its expiry> (or "none")

### Next work
1. <the single next step and the evidence that proves it done>

### Resume prompt
"Read the project's instruction file and the newest file in docs/handoff/, then continue."
```
