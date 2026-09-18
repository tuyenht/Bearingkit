# Activation set in the owner's daily profile · 2026-09-19

D5 question 27 B6, approved by the owner on 2026-09-19 ("Có, sau 05:00 (Khuyến nghị)"): one run of the whole activation set in the daily profile, where the kit competes with the other kits the owner has installed, before the `bk-map` sprint.

## Conditions

- Claude Code 2.1.274, `claude-sonnet-5`, the daily profile (`--daily`), six turns per prompt, the staged fixture; the kit loaded from the checkout at `8950388` with `--plugin-dir`, nothing installed. 05:02 to 06:19, after the five-hour window reset.
- **137 skills in the listing in all 87 sessions, 14 of them the kit's.** The rest include 66 from `fullstack-dev-skills` (`database-optimizer`, `postgres-pro`, `spec-miner`, `debugging-wizard` and others that answer the same requests), 14 from Superpowers, 12 `anthropic-skills`, and the owner's `database-playbook`. The owner's global instruction file loads into every session.
- Quota after the run: five-hour 38 %, seven-day 70 %.

## Result

**86 of 87 as labelled; 0 false activations; 0 no-action sessions.** Phase 1's sixty: 60/60 (the isolated-profile gate of 2026-09-16 read 58/60). Positives: 65 of 66 routed. Every `db-*` and `ops-*` prompt reached the kit's skill, `database-playbook` and `database-optimizer` notwithstanding.

| intent | positives routed | all prompts |
|---|---|---|
| question | — | 10/10 |
| small, feature, bug, review, ship | 8/8 each | 10/10 each |
| plan, close, next, test, design, setup, ops, db | 2/2 each | 3/3 each |
| audit | 1/2 | 2/3 |

## The one miss

`audit-en-01` ("Should we move invoice PDF generation off the request path onto a queue? Lay out the options and recommend one.") invoked no skill: the model searched and read the fixture first, then answered with four options and a recommendation. The work the prompt asks for was done; the route was not, and exploring before the skill is the failure the router exists to prevent. The same prompt routes to `bk-audit` in the isolated profile (2026-09-16 gate, 2026-09-19 routing). A likely cause, not verified: the owner's global instruction file tells the model to answer questions and brainstorms directly, without a command. The kit's router cannot outrank the user's own instructions, and should not.

Result table and streams: `evals/results/2026-09-18-claude-b6-daily.md` and the `*-b6-daily.raw.jsonl` files (gitignored; the file date is the runner's UTC date).
