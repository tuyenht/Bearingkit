# Benchmark plan-01 · 2026-10-06

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@8887c4e

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | F | 2 | 1 | 1.5 (1–2) | 0 (0–0) | – | 486760 (486760–486760) | 52330 (52330–52330) | 0.407 (0.407–0.407) | 20 (20–20) | 464 (464–464) |

## Each defect and decoy, sessions that found or flagged it

- natural F: O1 1/2 · O2 2/2 · Rskill 0/2 · Rwriting 0/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | F | 1 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 486760 | 0.407 | 20 | 464 | success | 1 |  | – | 01-natural-F1.answer.md |
| 2 | natural | F | 2 | O2 | O1 Rskill Rwriting Rslices | – | – | no | – | – | – | – | – | 0 | yes | – | 02-natural-F2.answer.md |
