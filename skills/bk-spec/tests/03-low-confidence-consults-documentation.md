# bk-spec · Syntax newer than the model's training is checked, not recalled

**Prompt** (en)
> Use the cache directive from the newest Next.js release for this page.

**Setup**
A project whose framework major is newer than the model's training data.

**Expected**
1. The assumption about that release is marked low confidence explicitly.
2. A documentation check runs first: context7 when installed on that host, otherwise bk-research against the official docs.
3. The spec separates what a documentation read pinned from what is still unverified.

**Fails if**
- Syntax for that release is written from memory, with no confidence statement and no lookup.
