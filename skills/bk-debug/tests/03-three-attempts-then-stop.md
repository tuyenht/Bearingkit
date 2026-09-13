# bk-debug · After three failed attempts it escalates instead of retrying

**Prompt** (en)
> The nightly report job still times out after your last two fixes; try again.

**Setup**
A session where two fix attempts have already failed.

**Expected**
1. At most one more attempt is made, and it does not repeat an approach already tried.
2. After the third failure the work stops and the evidence is handed to bk-audit.

**Fails if**
- The same approach is retried a fourth time.
- The failure is reported as fixed with no passing regression test.
