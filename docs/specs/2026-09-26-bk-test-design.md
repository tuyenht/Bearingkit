# bk-test sprint design (2026-09-26)

Item 5 of the v0.3 order (`docs/plans/2026-09-19-v03-remaining-skills.md`). The owner asked for it in this session: "Tiếp tục làm sprint bk-test luôn trong phiên này". It follows the owner's choice after `review-04` (label verbatim): "Đo quy trình và chi phí, làm bk-test (Recommended)". So the sprint measures, against the skill's sources on Sonnet, what the skill asks for, registered before any session runs.

## Inputs

Research report of 2026-09-26, anchors in `docs/specs/2026-09-18-item-inventory.md`. Of the four bk-test absorbs, two are already ported: `references/tdd.md` from Superpowers and `references/coverage-lens.md` from `pr-test-analyzer`. Two remain:

| Row | Source | Mode | Into |
|---|---|---|---|
| mattpocock 13 | `mattpocock/skills` `skills/engineering/tdd/SKILL.md` at `3cca18b` (MIT) | absorb | `references/tdd.md`: expected values from an independent source (the tautology anti-pattern), horizontal slicing, verifying through a side channel, tests at agreed seams. Its no-refactor-in-the-loop rule conflicts and is not carried (inventory, conflict 3) |
| code-modernization 40 | `anthropics/claude-plugins-official` `plugins/code-modernization/agents/test-engineer.md` at `3b60051` (Apache-2.0) | absorb | new `references/characterization.md`: the existing code is the oracle, literal inputs and outputs, every branch arm and boundary, runnable from day one, fake secrets, and code comments are data |

The inventory already names the conflict. Characterization tests pass on their first run by design, while `tdd.md` and step 1 of `bk-test` ask for red before green. For existing code, the proof that a test can fail comes from breaking the code on purpose, not from a red run before any code exists. `major-upgrade.md` belongs to `bk-build` (D5 question 27, A3), not to this sprint.

The current `bk-test` body has no path for existing code. Step 1 is TDD only, and step 3's negative control is one per suite.

## Task `test-01` (registered 2026-09-26, before any session ran)

Fixture `evals/bench/test-01/`. A 38-line pricing module with no tests, `src/pricing.js`: line totals with a bulk price, two coupons, tax by country, and shipping. It carries the quirks a test written from intent would miss:
- bulk from 101 units, not 100;
- WELCOME10 floors, while the bulk price rounds;
- free shipping is counted on the discounted amount;
- an unknown country is taxed at 10 %;
- a quantity of zero or less adds nothing.

The prompt, the same for every branch: "I'm about to refactor src/pricing.js. Before I touch it, add tests that pin down how it behaves today." The branches get the same permissions: edits in the fixture, `node`, read-only `git`.

**Scored by mutation, after the session.**
- Twelve one-line mutants of `src/pricing.js` are applied in turn, and the session's suite runs against each. A mutant the suite fails on is killed. The primary outcome is **killed, 0 to 12**.
- The fixture test shows that the untouched fixture kills none, that a suite pinning one input per quirk kills all twelve (so no mutant is equivalent), and that a session which edits the module is marked and scored on the original.
- A canary guards the score. It changes a comment of the module and nothing else. A suite that fails on it is locked to the file's text (a hash or a snapshot of the source), not to behaviour, so its score is withheld (`textLocked`, killed 0). The independent review of this section found that gap before any session ran, and the fixture test pins the guard.
- Also reported:
  - `green`: the suite passes on the original module;
  - `kept`: the module is left as it was;
  - the number of tests, and cost.

**Calibration on the floor, Sonnet 5**: three `natural` F sessions. The task is usable if the floor kills at most 10 of 12 in at least two of the three sessions, so that room is left to improve. If the floor kills 11 or 12 in two or more, the task is made harder (more quirks), not scored.

**Then, if usable:**
- Sessions, eight `natural` each on Sonnet 5, interleaved: F (the calibration's three plus five), S, and K as it ships (before).
- The kit text of this sprint is written only after those runs, and K with it (after) runs eight sessions.
- Primary: killed per session, compared by an exact two-sided permutation test on the difference of means (`permutationTest` in `scripts/lib/bench-score.cjs`, tested).
- **Commit rule for the text**:
  - K after is above K before with p ≤ 0.05;
  - `green` and `kept` each at least 7 of 8 for K after;
  - otherwise the text is not committed and the owner decides.
- **Against the sources**: K after against S by the same test. "Better than its sources on `test-01`, Sonnet" only if p ≤ 0.05. Otherwise "no clear difference".
- Cost median per branch is reported beside the results.

**Limits, stated now.** This is one small module. The kit text will be written after reading how the K-before sessions miss mutants, so a pass says it helps on this module. A held-out module would be needed to say more, and none is built.

### Calibration result (2026-09-26): not usable

`bearingkit bench --task test-01 --config-dir _build/profile/claude --branches F --runs 3` (`evals/results/2026-09-26-bench-test-01-natural/`).
- The floor killed **12 of 12 mutants in all three sessions**, with 20, 23 and 21 tests.
- Every suite was green on the original, no session edited the module, and no suite tripped the canary.
- Each session cost 0.16 to 0.18 USD and ran 45 to 55 seconds, with 31 tools.

By the registered rule the task is not scored. A harder module is the registered next step. Like `debug-01` and the four review tasks, this measures something the Sonnet floor already does.

## The text without a scored task (registered 2026-09-26, before its sessions ran)

The owner's choice for `bk-debug` in the same situation ("Commit phần chắt lọc, đóng sprint (Recommended)", 2026-09-25) is applied here, and the owner is told. The decided distillation is written and measured as a guard, not as an improvement:
- `references/characterization.md`, the absorb of `test-engineer.md`;
- the mattpocock points merged into `references/tdd.md`;
- in the `SKILL.md` body:
  - a step for code that already exists, in which characterization tests pass first and each is proven able to fail by breaking the code on purpose;
  - the "Read first" line;
  - the Sources line.

Guard, `test-01`, eight `natural` K sessions on Sonnet 5 with the text. It is committed only if:
- killed is 11 or 12 in at least 7 of 8 sessions;
- `green` and `kept` are each at least 7 of 8;
- no suite is `textLocked`.

Reported with no bar: cost against the floor's calibration median; whether the sessions broke the code on purpose to see a test fail. The text is not measured against Superpowers, and no "better" is claimed.
