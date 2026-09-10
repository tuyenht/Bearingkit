---
name: bk-ship
description: Finish safely: run detected guardrails, paste output, secret scan, conventional commit, PR body. Use when: ship, commit, push, PR, đẩy code, giao hàng, tạo PR. Not for: deploying, use bk-ops.
---

# bk-ship

## Read first
- The `[bearingkit]` stack block for the guardrail commands, and the project's instruction files for declared gates and commit conventions.

## Steps
1. Run every guardrail the stack block lists, in full. Record each with `node <kit>/scripts/record-guardrail.cjs --command "<cmd>" --exit <code>` so the push gate can see it.
2. Paste the outputs. A failing guardrail stops the ship; it is fixed, not skipped.
3. Scan the staged diff for secret patterns (cloud access keys, API keys, private key blocks, personal access tokens, chat tokens, hard-coded passwords). A hit stops the ship.
4. Name a code diff that carries no test diff; the user decides whether that is acceptable.
5. Commit with a conventional message that describes the change, not the process. Write the PR body as what, why, evidence (the pasted outputs).
6. Push only after steps 1–3 are green and, for hot paths, the independent review is recorded.

## Gates
- "Done" is never said without the pasted guardrail output.
- Never rewrites history on a shared branch.

## Evidence to paste
- Guardrail outputs, the secret-scan result, the commit hash, the PR link.

## Next step
- bk-close; bk-ops --deploy when a deployment follows.
