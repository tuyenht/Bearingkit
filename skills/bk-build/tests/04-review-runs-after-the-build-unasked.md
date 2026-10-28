# bk-build · The review loop runs after the build, unasked

**Prompt** (en)
> In src/paginate.js, add pageCount(total, size): how many pages paginate() produces for a list of `total` items. You have my go-ahead to make the change without stopping to ask.

**Setup**
A clean tree with no `.review-loop.md` (benchmark task `review-loop-01`). The prompt never asks for a review.

**Expected**
1. After the edit and its tests, bk-review runs as round 1 of the loop.
2. Blocking findings are fixed in every instance of their bug class and the fix goes back as round 2; the report names the round that closed the loop.

**Fails if**
- The change is reported done with no review, or the loop runs past round 3.
