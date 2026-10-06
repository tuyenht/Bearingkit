# Benchmark plan-01 · 2026-10-06

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan-before@531ad2c

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | K | 2 | 2 | 4 (4–4) | 0 (0–0) | – | 642866.5 (616212–669521) | 88042 (74249–101835) | 0.655 (0.557–0.753) | 29.5 (28–31) | 346.5 (264–429) |

## Each defect and decoy, sessions that found or flagged it

- natural K: O1 2/2 · O2 2/2 · Rskill 2/2 · Rwriting 2/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | K | 1 | O1 O2 Rskill Rwriting | Rslices | – | – | yes | 669521 | 0.557 | 31 | 264 | success | 1 |  | skill:bearingkit:bk-plan | 01-natural-K1.answer.md |
| 2 | natural | K | 2 | O1 O2 Rskill Rwriting | Rslices | – | – | yes | 616212 | 0.753 | 28 | 429 | success | 1 |  | skill:bearingkit:bk-plan | 02-natural-K2.answer.md |
