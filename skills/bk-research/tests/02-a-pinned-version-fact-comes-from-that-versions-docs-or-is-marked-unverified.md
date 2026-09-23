# bk-research · A fact about the pinned version comes from that version's documentation, or is marked unverified

**Prompt** (vi)
> Dự án đang ở Next.js 15. Bản này còn cache mặc định cho fetch trong route handler không, hay phải bật tay? Mình cần câu trả lời chắc chắn trước khi sửa.

**Setup**
A Next.js application whose lockfile pins a major newer than the model's training data may cover reliably. The framework's documentation site has pages per major and a migration guide between majors. Page reads go through a tool that summarises pages.

**Expected**
1. The pinned major is read from the stack profile, not assumed from the prompt alone, and a mismatch with the prompt is named.
2. The fact is taken from the documentation page for that major (deep-linked) and cross-checked against the upgrade or migration guide for the version that changed the default.
3. The wording the answer rests on is read from the raw page, since the fetch tool summarises; the quoted line is given with its link.
4. If the documentation for that major does not settle it, the claim appears in the UNVERIFIED form with how to check it (for example a small request logged in development), never as a confident answer from memory.
5. The answer is in Vietnamese, with the confidence of each claim, and the change itself is left to bk-build or bk-spec.

**Fails if**
- The answer states the default with no link to the documentation of the pinned major.
- A page for another major is cited as if it described the pinned one.
- A blog post or a Q&A answer is the only source.
