# Benchmark build-01 · 2026-10-07

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/build-01 · limits 900s, 60 turns · 8 sessions · kit p5b-bk-plan@a469cda

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | K | 8 | 8 | 7 (7–7) | 0 (0–0) | – | 590964.5 (519493–738857) | 31366.5 (28276–33821) | 0.267 (0.237–0.306) | 22.5 (18–30) | 46 (40–55) |

## Each defect and decoy, sessions that found or flagged it

- natural K: P1 8/8 · P2 8/8 · P3 8/8 · P4 0/8 · P5 0/8 · H 0/8 · P6 8/8 · O1 8/8 · O2 8/8 · O3 8/8

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | K | 1 | P1 P2 P3 P6 O1 O2 O3 | P4 P5 H | – | – | yes | 534495 | 0.26 | 21 | 42 | success | 1 |  | skill:bearingkit:bk-build | 01-natural-K1.answer.md |
| 2 | natural | K | 2 | P1 P2 P3 P6 O1 O2 O3 | P4 P5 H | – | – | yes | 651650 | 0.291 | 29 | 48 | success | 1 |  | skill:bearingkit:bk-build | 02-natural-K2.answer.md |
| 3 | natural | K | 3 | P1 P2 P3 P6 O1 O2 O3 | P4 P5 H | – | – | yes | 519493 | 0.237 | 22 | 40 | success | 1 |  | skill:bearingkit:bk-build | 03-natural-K3.answer.md |
| 4 | natural | K | 4 | P1 P2 P3 P6 O1 O2 O3 | P4 P5 H | – | – | yes | 698799 | 0.283 | 18 | 47 | success | 1 |  | skill:bearingkit:bk-build | 04-natural-K4.answer.md |
| 5 | natural | K | 5 | P1 P2 P3 P6 O1 O2 O3 | P4 P5 H | – | – | yes | 590287 | 0.266 | 23 | 46 | success | 1 |  | skill:bearingkit:bk-build | 05-natural-K5.answer.md |
| 6 | natural | K | 6 | P1 P2 P3 P6 O1 O2 O3 | P4 P5 H | – | – | yes | 738857 | 0.306 | 30 | 55 | success | 1 |  | skill:bearingkit:bk-build | 06-natural-K6.answer.md |
| 7 | natural | K | 7 | P1 P2 P3 P6 O1 O2 O3 | P4 P5 H | – | – | yes | 525985 | 0.246 | 21 | 42 | success | 1 |  | skill:bearingkit:bk-build | 07-natural-K7.answer.md |
| 8 | natural | K | 8 | P1 P2 P3 P6 O1 O2 O3 | P4 P5 H | – | – | yes | 591642 | 0.267 | 25 | 46 | success | 1 |  | skill:bearingkit:bk-build | 08-natural-K8.answer.md |
