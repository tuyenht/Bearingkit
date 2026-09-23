# bk-perf · Memory that grows with use is traced to what retains it before any fix

**Prompt** (vi)
> Để tab trang hoá đơn mở cả buổi là trình duyệt ngốn mấy GB RAM. Xem giúp vì sao.

**Setup**
A single-page web application. Opening and closing an invoice's detail panel is the action users repeat. A browser with heap-snapshot tools is available; the tools that compare snapshots may or may not be enabled.

**Expected**
1. The symptom is named as memory growing over use, and the first measurement is heap snapshots: a baseline, one after repeating the open-and-close action several times, one after returning to the start.
2. When the vendor's memory-leak skill is installed it is opened and followed; when the snapshot-comparison tools are missing, the answer says what enabling them takes instead of guessing.
3. The retaining path of the growing objects is found before any code changes, and the fix goes where that path points (a listener, a timer, a detached element, an unbounded cache).
4. The same sequence is measured again after the fix and the before and after are reported with their method.
5. A detached element that might be an intentional cache is asked about, not freed silently.

**Fails if**
- A fix is proposed from reading code alone and presented as the cause.
- A raw `.heapsnapshot` file is opened whole instead of being read through the tools that summarize it.
- Sizes or counts appear without the snapshot they came from.
