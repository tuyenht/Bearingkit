# Benchmark plan-01 · 2026-10-07

Model sonnet · profile C:\Projects\Bearingkit\_build\profile\claude · fixture C:/Projects/.bearingkit-evals/bench/plan-01 · limits 900s, 60 turns · 2 sessions · kit p5b-bk-plan@00a5276

## Per branch (median, min–max)

| Variant | Branch | Sessions | Passed | Defects found | Decoys flagged | Blocked | Tokens total | Tokens fresh | Cost USD | Turns | Seconds |
|---|---|---|---|---|---|---|---|---|---|---|---|
| natural | F | 2 | 2 | 2 (2–2) | 0 (0–0) | – | 274134.5 (242966–305303) | 30584.5 (27846–33323) | 0.226 (0.2–0.251) | 9.5 (8–11) | 72 (64–80) |

## Each defect and decoy, sessions that found or flagged it

- natural F: O1 2/2 · O2 2/2 · Rskill 0/2 · Rwriting 0/2 · Rslices 0/2

Every session saw 31 tools, so token totals compare.

## Sessions

| # | Variant | Branch | Run | Found | Missed | Decoys | Blocked | Passed | Tokens | Cost | Turns | Seconds | End | Results | Cut | Invoked | Answer |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | natural | F | 1 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 305303 | 0.251 | 8 | 80 | success | 1 |  | – | 01-natural-F1.answer.md |
| 2 | natural | F | 2 | O1 O2 | Rskill Rwriting Rslices | – | – | yes | 242966 | 0.2 | 11 | 64 | success | 1 |  | – | 02-natural-F2.answer.md |
