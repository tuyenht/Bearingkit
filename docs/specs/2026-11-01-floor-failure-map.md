# Map: where the floor (no skill) actually fails

A read-only tally of the records, made on 2026-11-01 to choose the next pilot. It changes no bar and no rule, and no line here says the kit beats a source.
Sources: the stored `.check.json` files, tallied by a throwaway script that was not kept (F rows spot-checked 2026-11-01), and the specs named below. "Benchmark spec" is `docs/specs/2026-09-24-benchmark-kit-vs-sources-design.md`; a bare number is a line of the spec the row names.
Floor n is 3 on most tasks; shell-01 has 8, debug-01 has 11 on the default model. All one model family per row.

## Floor already passes: a kit gain cannot show here
- review-01 Sonnet: F, K, S all 3/3 (benchmark spec 474-476, 482). Owner stopped outcome benchmarking of review on Sonnet (454).
- review-02 Sonnet F 3/3; review-04 F 3/3.
- ship-01 and ship-02: floor 3/3 on the outcome. test-01: no floor failure.
- close-01: C1 true, G1 true (bk-ship-close spec 122).
- cpp-01: floor not run; K-before, K-after and S all pass H1, H2, H3, H5, X (stack-c-cpp spec 297).

## Floor fails: pilot candidates
| Task | Point | Floor | Note |
|---|---|---|---|
| debug-01 | regression test kept | 0/11 default model | K 40/40, S 22/32, mixed text versions, no registered claim |
| node-01 | N3 | 0/3 | hazard from the kit's own text |
| py-01 | Y2 | 0/3 | hazard from the stack file itself |
| shell-01 | H1, H3 | 1/8 each | hazards chosen from the file by its author (stack-shell spec 172) |
| close-01 | G2, V1 | 0/3 each | process, one agent each |
| build-01 | P1 | 1/3 | process |
| review-03 | false outcome | 1/3 | Sonnet |
| Haiku only | review-01 F 0/3, review-02 H2 F 5 K 1 S 4 of 8, debug-01 root 0/11 | | a weaker model, not the owner's main one |

## Weak evidence that must stay marked
- review-loop-01..04: no floor branch; checks written from the kit's own text (spec 98-102, 138-142).
- shell-01-src: the source was read in 0 of 8 sessions, so it says nothing about its text (spec 221).
- Most hazards were planted by the kit's author. Real-work defects should supply the next pilot points.

## Real-work defects not yet a measured point (v1 spec section 18)
- 362 bypass outliving its purpose; 363 guardrails not wired into CI; 364 class-string tests hid unstyled UI;
  365 auth and tenancy found late; 370 syntax of older majors; 371 wrong package manager in CI;
  379 no transaction, past-time and test-state leaks; 380 test-first not enforced.

## Gap
No handoff in docs/handoff has a lesson-candidates section (search on 2026-11-01: 0 hits), so field lessons
since v1 have no feed into this list.
