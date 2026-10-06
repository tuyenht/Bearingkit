# Benchmark plan-01 · 2026-10-06

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan-before@531ad2c

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | K | 2 | 2 | 3 (3–3) | 0 (0–0) | – | 802700.5 (649013–956388) | 80118.5 (59403–100834) | 0.581 (0.477–0.685) | 26 (25–27) | 320.5 (224–417) |

## Each defect and decoy, sessions that found or flagged it

- natural K: O1 2/2 · O2 2/2 · Rskill 2/2 · Rwriting 0/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | K | 1 | O1 O2 Rskill | Rwriting Rslices | – | – | yes | 956388 | 0.685 | 25 | 417 | success | 2 |  | agent:Explore, skill:bearingkit:bk-plan | 01-natural-K1.answer.md |
| 2 | natural | K | 2 | O1 O2 Rskill | Rwriting Rslices | – | – | yes | 649013 | 0.477 | 27 | 224 | success | 1 |  | skill:bearingkit:bk-plan | 02-natural-K2.answer.md |
