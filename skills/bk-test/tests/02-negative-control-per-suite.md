# bk-test · The suite proves it can fail

**Prompt** (en)
> Add tests for the upload size limit.

**Setup**
The eval fixture, src/lib/upload.ts.

**Expected**
1. One negative control is added: a case that must fail if the check stops working.
2. The control is run and its failure is shown, so a silent pass is never trusted.

**Fails if**
- The suite passes with no demonstration that any case can fail.
