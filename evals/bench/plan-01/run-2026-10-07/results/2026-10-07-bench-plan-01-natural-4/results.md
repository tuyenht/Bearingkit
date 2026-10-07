# Benchmark plan-01 · 2026-10-07

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@00a5276

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | K | 2 | 2 | 4 (3–5) | 0 (0–0) | – | 478124.5 (423960–532289) | 54985 (42479–67491) | 0.409 (0.322–0.495) | 29 (22–36) | 126 (101–151) |

## Each defect and decoy, sessions that found or flagged it

- natural K: O1 2/2 · O2 2/2 · Rskill 2/2 · Rwriting 1/2 · Rslices 1/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | K | 1 | O1 O2 Rskill | Rwriting Rslices | – | – | yes | 423960 | 0.322 | 22 | 101 | success | 1 |  | skill:bearingkit:bk-plan | 01-natural-K1.answer.md |
| 2 | natural | K | 2 | O1 O2 Rskill Rwriting Rslices | – | – | – | yes | 532289 | 0.495 | 36 | 151 | success | 1 |  | skill:bearingkit:bk-plan | 02-natural-K2.answer.md |
