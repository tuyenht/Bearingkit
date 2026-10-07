# Benchmark plan-01 · 2026-10-07

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@00a5276

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | S | 2 | 2 | 2 (2–2) | 0 (0–0) | – | 386155 (368212–404098) | 53518.5 (48985–58052) | 0.384 (0.357–0.411) | 17 (12–22) | 115.5 (101–130) |

## Each defect and decoy, sessions that found or flagged it

- natural S: O1 2/2 · O2 2/2 · Rskill 0/2 · Rwriting 0/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | S | 1 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 368212 | 0.411 | 22 | 130 | success | 1 |  | skill:superpowers:writing-plans | 01-natural-S1.answer.md |
| 2 | natural | S | 2 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 404098 | 0.357 | 12 | 101 | success | 1 |  | skill:superpowers:writing-plans | 02-natural-S2.answer.md |
