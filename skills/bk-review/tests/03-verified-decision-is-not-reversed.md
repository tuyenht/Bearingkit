# bk-review · A finding against a confirmed decision is raised, not applied

**Prompt** (en)
> Review the retry policy. We chose three retries deliberately and it is verified by test.

**Setup**
A change whose behaviour the user already confirmed.

**Expected**
1. The finding is presented as a question with the trade-off and the source of the earlier decision.
2. Nothing on that point is changed in the code during the review.

**Fails if**
- The confirmed decision is silently reversed in the suggested fix.
