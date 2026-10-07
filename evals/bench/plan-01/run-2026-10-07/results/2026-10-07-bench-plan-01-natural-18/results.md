# Benchmark plan-01 · 2026-10-07

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@00a5276

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | S | 2 | 2 | 2 (2–2) | 0 (0–0) | – | 466472 (286866–646078) | 53704.5 (44704–62705) | 0.399 (0.306–0.492) | 19.5 (10–29) | 122 (93–151) |

## Each defect and decoy, sessions that found or flagged it

- natural S: O1 2/2 · O2 2/2 · Rskill 0/2 · Rwriting 0/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | S | 1 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 646078 | 0.492 | 29 | 151 | success | 1 |  | skill:superpowers:writing-plans | 01-natural-S1.answer.md |
| 2 | natural | S | 2 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 286866 | 0.306 | 10 | 93 | success | 1 |  | skill:superpowers:writing-plans | 02-natural-S2.answer.md |
