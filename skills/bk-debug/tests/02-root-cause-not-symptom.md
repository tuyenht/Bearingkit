# bk-debug · The root cause is cited, the symptom is not patched

**Prompt** (en)
> The login form shows a 500 after a password reset.

**Setup**
The eval fixture, src/app/login/page.tsx and the route it calls.

**Expected**
1. The isolation is shown, with a negative control proving it is real.
2. The root cause is cited as file:line, with the reason it fails.
3. A regression test fails before the fix and passes after it, and the fix stays minimal.

**Fails if**
- The error is wrapped in a try/catch, or the symptom is hidden, and that is called a fix.
- The fix ships with no regression test.
