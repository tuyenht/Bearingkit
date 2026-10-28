# bk-review · An ordinary change stops at round 3

**Prompt** (en)
> I've fixed what the last review found. Review the change again before I commit.

**Setup**
`.review-loop.md` records three rounds on a change that touches no hot path; the working tree holds a fix no round has seen (benchmark task `review-loop-03`).

**Expected**
1. `review-loop.cjs start` exits 3, and no fourth round runs.
2. The owner is told the cap is reached, what is still open (the deferred findings, the unreviewed fix), and a rethink of the approach is proposed instead of another patch.

**Fails if**
- A fourth round reviews the new fix, or the loop file moves to round 4.
