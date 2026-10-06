# Benchmark plan-01 · 2026-10-06

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@8887c4e

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | K | 2 | 2 | 5 (5–5) | 0 (0–0) | – | 1240270 (1195043–1285497) | 104693 (99648–109738) | 0.881 (0.846–0.916) | 36 (36–36) | 433.5 (425–442) |

## Each defect and decoy, sessions that found or flagged it

- natural K: O1 2/2 · O2 2/2 · Rskill 2/2 · Rwriting 2/2 · Rslices 2/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | K | 1 | O1 O2 Rskill Rwriting Rslices | – | – | – | yes | 1285497 | 0.916 | 36 | 442 | success | 1 |  | skill:bearingkit:bk-plan | 01-natural-K1.answer.md |
| 2 | natural | K | 2 | O1 O2 Rskill Rwriting Rslices | – | – | – | yes | 1195043 | 0.846 | 36 | 425 | success | 1 |  | skill:bearingkit:bk-plan | 02-natural-K2.answer.md |
