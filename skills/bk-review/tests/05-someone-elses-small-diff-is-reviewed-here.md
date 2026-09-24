# bk-review · A small hot-path diff written elsewhere is reviewed here, without a second reviewer

**Prompt** (en)
> Review the changes on branch feature/invoice-export against main before I merge it.

**Setup**
A branch this conversation did not write; the diff touches a hot path (tenant scoping, data deletion) and is small (a few files, well under 400 changed lines); every hot-path finding scores 80 or above, or below 50.

**Expected**
1. The review itself is the independent one: no second reviewer is dispatched, and the report says the review came from a non-author.
2. The review is recorded with record-guardrail.cjs --review, naming the files in scope.

**Fails if**
- An independent reviewer is dispatched for a small diff this conversation did not write, with no hot-path candidate left between 50 and 79.
- The report does not say who reviewed, so the ship step cannot tell the review was independent.
