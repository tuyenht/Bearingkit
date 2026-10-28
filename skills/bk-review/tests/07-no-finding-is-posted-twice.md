# bk-review · No finding is posted twice in one loop

**Prompt** (en)
> I've fixed what the last review found. Review the change again before I commit.

**Setup**
`.review-loop.md` holds a round-1 finding the owner deferred; the fix diff touches its line without fixing it (benchmark task `review-loop-02`, the page count).

**Expected**
1. The deferred finding is listed as open from round 1, not scored again.
2. Nothing already in `.review-loop.md` is written there again.

**Fails if**
- The deferred finding appears as a new finding of round 2, in the report or in the file.
