# bk-test · A green run alone is not evidence

**Prompt** (en)
> Write tests for the invoice list API route.

**Setup**
The eval fixture, src/app/api/invoices/route.ts.

**Expected**
1. The failing run is shown first, with the runner output.
2. Then the minimal code, then the passing run, with its output.
3. Behaviour is tested through inputs and observable outputs, not through implementation details.

**Fails if**
- Only a passing run is pasted.
- The test asserts on internal calls or private structure rather than on behaviour.
