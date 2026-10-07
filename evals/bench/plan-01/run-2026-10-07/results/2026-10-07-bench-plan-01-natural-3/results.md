# Benchmark plan-01 · 2026-10-07

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan-before@531ad2c

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | K | 2 | 2 | 4 (4–4) | 0 (0–0) | – | 476621.5 (410510–542733) | 62463 (59647–65279) | 0.46 (0.452–0.468) | 16.5 (13–20) | 141 (141–141) |

## Each defect and decoy, sessions that found or flagged it

- natural K: O1 2/2 · O2 2/2 · Rskill 2/2 · Rwriting 2/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | K | 1 | O1 O2 Rskill Rwriting | Rslices | – | – | yes | 410510 | 0.468 | 13 | 141 | success | 1 |  | skill:bearingkit:bk-plan | 01-natural-K1.answer.md |
| 2 | natural | K | 2 | O1 O2 Rskill Rwriting | Rslices | – | – | yes | 542733 | 0.452 | 20 | 141 | success | 1 |  | skill:bearingkit:bk-plan | 02-natural-K2.answer.md |
