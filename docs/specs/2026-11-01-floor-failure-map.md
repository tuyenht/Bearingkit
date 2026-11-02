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
Corrected 2026-11-02 on the owner's label for open choice 7 of `docs/specs/2026-11-01-real-defect-pilot-design.md` (`docs/autopilot/decisions.md` entry 89), from that spec's check of 2026-11-01:
- Already measured, so no longer in this list: 362 (L1) is `close-01` G2; 365 (L4) is `review-01` D1, `review-02` H1 and H2, `review-04` D1 and D2; the transaction half of 379 (L18) is `review-04` D3; 380 (L19) is `debug-01`'s regression test and seen-red-first.
- Still not a measured point: 363 guardrails not wired into CI; 364 class-string tests hid unstyled UI; 370 syntax of older majors; 371 wrong package manager in CI; the past-time and test-state halves of 379.

## Gap
Corrected 2026-11-02, same label. The search of 2026-11-01 matched only the literal words "lesson candidates"; the heading the template prescribes is `### Lessons (candidate lines for the lessons log)` (`skills/bk-protocol/references/handoff-template.md:22`). Counted by the pilot spec on 2026-11-01 over 86 handoffs: 46 have a heading that starts "Lessons", with 135 `RULE |` lines, the newest in `2026-10-26-p6-scorer.md`, and none of the 12 later handoffs has one. So the feed stopped on 2026-10-26; nothing reads the lines (`.claude/lessons.log` is not in this tree, and `skills/bk-close/SKILL.md:16` appends to it only if it exists); and the lines are rules about how sessions work, not defects in delivered work. From 2026-11-02 such defects go to `docs/field-defects.md` (open choice 6 of the same spec).
