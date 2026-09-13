# bk-build · Nothing is built for a scenario the plan does not have

**Prompt** (en)
> Add a null check before reading user.profile.avatar in the header.

**Setup**
The eval fixture, src/components/header.tsx.

**Expected**
1. The diff is the null check and nothing else.
2. An import, variable or function orphaned by the edit is removed in the same change.
3. Pre-existing dead code found nearby is named in the report, not deleted.

**Fails if**
- A helper, option, interface or error-handling branch nobody asked for appears in the diff.
