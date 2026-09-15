# The coverage lens: which gaps matter, and how to rank them

Adapted from anthropics/claude-plugins-official (Apache-2.0): `plugins/pr-review-toolkit/agents/pr-test-analyzer.md`, commit `3b60051`; attribution in `NOTICE`. Kept: behavioural coverage over line coverage, the gap list, the test-quality checks, and the criticality scale with its anchors. Not kept: the pull-request framing and the output template.

This lens runs over a change that is already written — the TDD loop in `tdd.md` is what happens while writing it. Its question is narrower: given this diff, which missing test would have caught a real failure?

## Behaviour, not lines

A line-coverage number says which lines ran, not which behaviours are protected. Read the diff for what it now does, then ask which of those behaviours no test would notice breaking. A change with 90% line coverage and no test for its error path is worse covered than a change at 60% whose failure modes are all pinned.

## The gaps worth naming

- **Untested error paths.** The branch that runs when the dependency fails, and which no test enters, is where silent failures are born.
- **Boundaries.** Empty, one, maximum, past the maximum; zero and negative; the first and last element; dates in the past and the far future.
- **Business logic branches.** A condition added to a rule that decides money, permissions or deletion, with no case on either side of it.
- **Negative cases for validation.** Tests that prove the invalid input is accepted are not validation tests; the missing half is the input that must be rejected, and the reason.
- **Concurrency and async.** Two callers at once, a retry that overlaps its own previous attempt, an await whose failure nobody handles.

## Whether the existing tests are worth anything

- Do they test behaviour and contracts, or the implementation? A test that breaks on a rename it should not care about will be deleted by the next person, and its protection goes with it.
- Would this test catch a meaningful regression, or does it assert that the code does what the code does?
- Does it survive a reasonable refactor of the internals?
- Is it readable as a sentence — what it sets up, what it does, what it expects — or does the reader have to reconstruct the intent from fixtures?

## Ranking a gap

Every proposed test carries a criticality, and the number is argued from the failure it would catch, not from taste:

| Rating | What sits here |
|---|---|
| 9–10 | Data loss, a security or permission hole, a system that stops |
| 7–8 | Business logic whose failure the user sees |
| 5–6 | An edge case that confuses rather than breaks |
| 3–4 | Completeness, nice to have |
| 1–2 | Optional polish |

For each gap, name the specific failure the test would catch, in one line. A gap that cannot be written that way is not a gap yet. Check first whether an existing test already covers the scenario under another name — proposing a duplicate costs the same trust as a false finding in a review.

## Not a gap

Chasing a coverage percentage. A test written to raise a number, with no failure it protects against, is a maintenance cost with the shape of diligence.
