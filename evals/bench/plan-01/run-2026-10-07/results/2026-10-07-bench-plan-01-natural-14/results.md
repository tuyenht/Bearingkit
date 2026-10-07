# Benchmark plan-01 · 2026-10-07

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@00a5276

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | K | 2 | 2 | 5 (5–5) | 0 (0–0) | – | 692786.5 (587868–797705) | 72139 (69805–74473) | 0.561 (0.557–0.565) | 22.5 (20–25) | 164.5 (162–167) |

## Each defect and decoy, sessions that found or flagged it

- natural K: O1 2/2 · O2 2/2 · Rskill 2/2 · Rwriting 2/2 · Rslices 2/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | K | 1 | O1 O2 Rskill Rwriting Rslices | – | – | – | yes | 797705 | 0.565 | 25 | 167 | success | 1 |  | skill:bearingkit:bk-plan | 01-natural-K1.answer.md |
| 2 | natural | K | 2 | O1 O2 Rskill Rwriting Rslices | – | – | – | yes | 587868 | 0.557 | 20 | 162 | success | 1 |  | skill:bearingkit:bk-plan | 02-natural-K2.answer.md |
