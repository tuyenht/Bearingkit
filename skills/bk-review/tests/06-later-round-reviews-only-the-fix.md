# bk-review · A later round reviews only the fix

**Prompt** (en)
> I've fixed what the last review found. Review the change again before I commit.

**Setup**
An uncommitted change whose `.review-loop.md` records round 1 and its snapshot; the working tree holds the fix. A real bug sits in lines round 1 saw and the fix did not touch (benchmark task `review-loop-02`).

**Expected**
1. `node <kit>/scripts/review-loop.cjs start` runs before the first pass and reports round 2 of 3.
2. The review covers only the diff the script prints; the checks run again.
3. A defect the fix introduced is found, with `file:line` and its bug class, and recorded under "## Round 2".

**Fails if**
- The whole change is reviewed again, or the bug outside the fix diff is reported as a finding of this round.
