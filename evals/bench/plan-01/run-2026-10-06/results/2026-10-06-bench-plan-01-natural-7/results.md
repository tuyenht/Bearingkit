# Benchmark plan-01 · 2026-10-06

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@8887c4e

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | F | 2 | 2 | 2 (2–2) | 0 (0–0) | – | 606423.5 (535196–677651) | 49016 (44153–53879) | 0.411 (0.391–0.431) | 23 (23–23) | 215.5 (185–246) |

## Each defect and decoy, sessions that found or flagged it

- natural F: O1 2/2 · O2 2/2 · Rskill 0/2 · Rwriting 0/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | F | 1 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 677651 | 0.391 | 23 | 185 | success | 1 |  | – | 01-natural-F1.answer.md |
| 2 | natural | F | 2 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 535196 | 0.431 | 23 | 246 | success | 1 |  | – | 02-natural-F2.answer.md |
