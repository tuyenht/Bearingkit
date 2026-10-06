# Benchmark plan-01 · 2026-10-06

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@8887c4e

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | S | 2 | 2 | 2 (2–2) | 0 (0–0) | – | 632970 (631235–634705) | 135626.5 (129919–141334) | 0.855 (0.818–0.891) | 17.5 (16–19) | 346 (313–379) |

## Each defect and decoy, sessions that found or flagged it

- natural S: O1 2/2 · O2 2/2 · Rskill 0/2 · Rwriting 0/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | S | 1 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 634705 | 0.818 | 16 | 313 | success | 2 |  | skill:superpowers:writing-plans, agent:Explore | 01-natural-S1.answer.md |
| 2 | natural | S | 2 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 631235 | 0.891 | 19 | 379 | success | 2 |  | skill:superpowers:writing-plans, agent:Explore | 02-natural-S2.answer.md |
