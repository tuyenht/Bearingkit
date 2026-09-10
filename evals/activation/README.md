# Activation evals

`phase-1.jsonl` holds sixty prompts: six intents (question, small change, feature, bug, review, ship), ten each, eight positives (four English, four Vietnamese) and two negatives whose expected answer is `none` or a neighbouring skill. A run passes the Phase 1 gate when every positive routes to its skill and no negative routes to the intent's skill.

Format, one JSON object per line: `id`, `intent`, `lang`, `prompt`, `expect` (a skill name or `none`).

## Claude Code

```
node bin/bearingkit.cjs evals --config-dir <isolated profile> [--model sonnet] [--intent bug] [--limit 5] [--cwd <sample project>]
```

Each prompt runs in a fresh non-interactive session (`claude -p`, streamed JSON, at most two turns). The runner records the first skill the model invoked, or `none`, and writes `evals/results/<date>-claude.md` with a table and per-intent scores. Measure in an isolated profile that contains nothing but the kit; the host caps the skill listing and drops least-used descriptions on overflow, so a crowded profile measures the crowd, not the kit.

Baseline: run the same file once against the current daily profile (no `--config-dir`) before the old kits are removed; that table is what later claims compare to.

## Antigravity

```
node bin/bearingkit.cjs evals --host antigravity
```

Prints the prompts as a checklist and writes `evals/results/<date>-antigravity-checklist.md`. Run each prompt in a fresh conversation, note which skill activated, fill in the table by hand. Tokens are not measured on this host and are recorded as such.
