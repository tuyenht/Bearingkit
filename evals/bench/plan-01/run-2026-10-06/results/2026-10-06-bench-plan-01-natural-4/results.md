# Benchmark plan-01 · 2026-10-06

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@8887c4e

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | F | 2 | 2 | 2 (2–2) | 0 (0–0) | – | 460604.5 (346415–574794) | 72547.5 (49806–95289) | 0.477 (0.369–0.585) | 18 (17–19) | 267 (216–318) |

## Each defect and decoy, sessions that found or flagged it

- natural F: O1 2/2 · O2 2/2 · Rskill 0/2 · Rwriting 0/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | F | 1 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 574794 | 0.585 | 17 | 318 | success | 1 |  | agent:Explore | 01-natural-F1.answer.md |
| 2 | natural | F | 2 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 346415 | 0.369 | 19 | 216 | success | 1 |  | – | 02-natural-F2.answer.md |
