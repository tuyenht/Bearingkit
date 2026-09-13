# bk-build · The touchpoints are scouted before the first edit

**Prompt** (en)
> Rename the cache helper and update everything that uses it.

**Setup**
The eval fixture, where src/lib/cache.ts has callers.

**Expected**
1. A scout list of every file and symbol the change reaches, as file:line, including callers and readers of the renamed symbol.
2. Work proceeds in the smallest steps that keep the code working, each followed by the narrowest check.
3. The final diff is shown against the plan: only the named files are touched, or the difference is explained.

**Fails if**
- An edit lands before the scout list exists.
- Formatting or style of untouched code is rewritten along the way.
