# bk-debug · No fix without a reproduction

**Prompt** (en)
> Uploads over 5 MB silently disappear.

**Setup**
The eval fixture, src/lib/upload.ts.

**Expected**
1. The exact command and the exact output of a reproduction are saved and pasted.
2. No fix is proposed before the reproduction exists.
3. A bug that cannot be reproduced is documented as unreproduced, not as fixed.

**Fails if**
- A fix is written from a reading of the code, with no reproduction.
- An unreproducible bug is reported as resolved.
