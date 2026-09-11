# Activation evals

`phase-1.jsonl` holds sixty prompts: six intents (question, small change, feature, bug, review, ship), ten each, eight positives (four English, four Vietnamese) and two negatives whose expected answer is `none` or a neighbouring skill. A run passes the Phase 1 gate when every positive routes to its skill and no negative routes to the intent's skill.

Format, one JSON object per line: `id`, `intent`, `lang`, `prompt`, `expect` (a skill name or `none`). `acceptance.jsonl` holds the two-prompt acceptance test of spec v2 §11 (the autonomy-gate question, then "Let's make a react todo list" expecting `bk-spec`); run it with `--file evals/activation/acceptance.jsonl` on either host, and read the first answer by hand for ACT and COUNCIL.

## Claude Code

```
node bin/bearingkit.cjs evals --config-dir <isolated profile> [--plugin-dir <checkout>|none] [--model sonnet] [--intent bug] [--limit 5] [--cwd <sample project>]
```

The kit is loaded straight from the checkout with `claude --plugin-dir` (the default; nothing is installed into the profile); `--plugin-dir none` runs a baseline against whatever the profile already carries. Each prompt runs in a fresh non-interactive session (`claude -p`, streamed JSON, at most six turns, `--turns` to change) inside `evals/fixtures/sample-app` unless `--cwd` says otherwise, so prompts about the settings page or the invoices page have real files to find. The runner records the first skill the model invoked, or `none`, and writes `evals/results/<date>-claude.md` with a table and per-intent scores. `--tag <name>` suffixes the result file; `--equivalents <json>` makes a baseline run against another setup meaningful; `--id a,b` reruns specific prompts; `--per-intent N` keeps the first N prompts of each intent (a cheaper baseline). Measure in an isolated profile that contains nothing but the kit; the host caps the skill listing and drops least-used descriptions on overflow, so a crowded profile measures the crowd, not the kit.

Baseline: run the same file once against the current daily profile (no `--config-dir`) before the old kits are removed; that table is what later claims compare to.

## Antigravity

```
node bin/bearingkit.cjs evals --host antigravity
```

Without flags this prints the prompts as a checklist (`evals/results/<date>-antigravity-checklist.md`) for a run by hand. On this host `--plugin-dir` names the live plugin copy (default `~/.gemini/config/plugins/bearingkit`), not the checkout.

The automated run on Antigravity 2.0 (the desktop app must be running with `--remote-debugging-port=1405`; it opens no DevTools port by default) goes: `--arm --id <ids> --tag <tag>` installs a driver hook into the live plugin and queues the prompts; `--drive <projectId> --count N` starts a detached script that opens one conversation per prompt in the eval project (a JSON under `~/.gemini/config/projects/` pointing at the staged fixture), types a hold phrase, and lets the hook inject the real prompt after resetting the fixture; `--score` reads the transcripts (the first `SKILL.md` opened after the injected prompt) and writes the table; `--disarm` removes the hook. Progress lives in `~/.bearingkit/antigravity-eval/queue.json` and the drive log under `evals/results/`. About 90 seconds per prompt on Opus 4.6. Tokens on this host are read from the app’s Customizations panel, not measured by the runner.
