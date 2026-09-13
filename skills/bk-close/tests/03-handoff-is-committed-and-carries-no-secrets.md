# bk-close · A handoff that lives only in chat does not exist

**Prompt** (vi)
> Kết phiên giúp tôi, ghi bàn giao để phiên sau đọc.

**Setup**
Any session, inside a repository.

**Expected**
1. The handoff carries no secrets, credentials or private hostnames.
2. The handoff is committed before the session ends, and the git status after the final commit is pasted.

**Fails if**
- The handoff is printed in the conversation and never committed.
- A token, password or private hostname appears in the file.
