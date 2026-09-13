# bk-close · Live bypasses are listed with their expiry

**Prompt** (en)
> Close the session.

**Setup**
A session that touched a file carrying a TEMPORARY marker with no expiry.

**Expected**
1. Every TEMPORARY or REMOVE marker in files touched this session is listed, each with its expiry or the words no expiry.
2. Uncommitted edits to the project's instruction files are flagged.

**Fails if**
- A marker in a touched file is missing from the list.
- The section says none while a marker exists.
