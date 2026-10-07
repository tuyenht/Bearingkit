# Benchmark node-01 · 2026-10-07

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/node-01 · limits 900s, 60 turns · 8 sessions · kit p5b-bk-plan@a469cda

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | K | 8 | 8 | 6 (5–8) | 0 (0–0) | – | 425732.5 (299008–533787) | 26343 (21784–35490) | 0.219 (0.17–0.28) | 14.5 (10–19) | 51.5 (41–69) |

## Each defect and decoy, sessions that found or flagged it

- natural K: N1 8/8 · N2 8/8 · N3 4/8 · O1 8/8 · O2 8/8 · X 8/8 · Rskill 1/8 · Rfile 4/8 · Rindex 0/8 · P4 0/8 · P5 0/8

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | K | 1 | N1 N2 N3 O1 O2 X Rskill Rfile | Rindex P4 P5 | – | – | yes | 480288 | 0.28 | 18 | 69 | success | 1 |  | skill:bearingkit:bk-spec, skill:bearingkit:bk-build | 01-natural-K1.answer.md |
| 2 | natural | K | 2 | N1 N2 N3 O1 O2 X Rfile | Rskill Rindex P4 P5 | – | – | yes | 504759 | 0.244 | 16 | 54 | success | 1 |  | skill:bearingkit:bk-spec | 02-natural-K2.answer.md |
| 3 | natural | K | 3 | N1 N2 O1 O2 X | N3 Rskill Rfile Rindex P4 P5 | – | – | yes | 353607 | 0.208 | 13 | 49 | success | 1 |  | skill:bearingkit:bk-spec | 03-natural-K3.answer.md |
| 4 | natural | K | 4 | N1 N2 O1 O2 X | N3 Rskill Rfile Rindex P4 P5 | – | – | yes | 401687 | 0.215 | 14 | 46 | success | 1 |  | skill:bearingkit:bk-spec | 04-natural-K4.answer.md |
| 5 | natural | K | 5 | N1 N2 N3 O1 O2 X Rfile | Rskill Rindex P4 P5 | – | – | yes | 533787 | 0.277 | 19 | 62 | success | 1 |  | skill:bearingkit:bk-spec | 05-natural-K5.answer.md |
| 6 | natural | K | 6 | N1 N2 N3 O1 O2 X Rfile | Rskill Rindex P4 P5 | – | – | yes | 448303 | 0.218 | 15 | 46 | success | 1 |  | skill:bearingkit:bk-spec | 06-natural-K6.answer.md |
| 7 | natural | K | 7 | N1 N2 O1 O2 X | N3 Rskill Rfile Rindex P4 P5 | – | – | yes | 403162 | 0.22 | 14 | 62 | success | 1 |  | skill:bearingkit:bk-spec | 07-natural-K7.answer.md |
| 8 | natural | K | 8 | N1 N2 O1 O2 X | N3 Rskill Rfile Rindex P4 P5 | – | – | yes | 299008 | 0.17 | 10 | 41 | success | 1 |  | skill:bearingkit:bk-spec | 08-natural-K8.answer.md |
