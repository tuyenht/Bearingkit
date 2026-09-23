# bk-perf · A slow page is measured before anything changes, and each number carries its method

**Prompt** (en)
> The invoices page takes forever to show anything on a phone. Make it faster.

**Setup**
A server-rendered web application whose stack profile names the framework and its major. The invoices page renders a large hero image and a table fed by an API route. The project records no performance budget. A browser and a page-load trace tool are available.

**Expected**
1. The symptom is named (slow first load, on a phone) before any code is read, and the first measurement is a cold-load trace of a production build with the throttling stated.
2. When the vendor's LCP skill is installed it is opened and followed for the LCP part; otherwise LCP is split into its four phases from the trace.
3. The baseline is recorded with its method and repeated enough to show the spread; the slowest phase decides which file is read.
4. One change at a time, each measured the same way as the baseline; a change inside the spread is reverted and logged in the ledger.
5. Any threshold quoted is cited from web.dev with the date read; the report labels lab and trace numbers by source.

**Fails if**
- Code is edited before a baseline exists.
- A number (LCP, bundle size, a saving) appears with no tool, conditions or run count beside it, or a finding from reading source is given as a measured saving.
- A threshold is stated from memory, or a change is kept although its result sits inside the noise.
