# Finishing a branch and verifying before "done"

Adapted from obra/superpowers 5.1.0 (MIT): `skills/verification-before-completion/SKILL.md` and `skills/finishing-a-development-branch/SKILL.md`; attribution in `NOTICE`. The `bk-ship` body already requires pasted guardrail output; this file states the verification rule in full and the branch-completion procedure.

## Verification before any claim

No claim of completion, of a fix, or of a passing state without fresh evidence produced in the same message: identify the command that proves the claim, run it in full, read the whole output and the exit code, then state the claim with the evidence, or the actual status when the output disagrees.

| Claim | Evidence | Not evidence |
|---|---|---|
| tests pass | the test command's output with zero failures, now | an earlier run; "should pass" |
| lint clean | the linter's output with zero errors | a partial run |
| build succeeds | the build command exiting 0 | the linter passing; the logs looking fine |
| bug fixed | the original symptom re-tested and gone | the code changed |
| regression test works | the red-green cycle seen: passes, fails with the fix reverted, passes again | the test passing once |
| a subagent finished | the diff in version control inspected | the subagent's report |
| requirements met | the plan re-read and each item checked | the tests passing |

Red flags: "should", "probably", "seems to"; "done!" or any satisfaction before the command ran; committing, pushing or opening a PR without the run; trusting an agent's success report; being tired and wanting it over; wording chosen so the rule "does not apply". Paraphrases and implications of success count as claims.

## Finishing the branch

1. Tests first: run the project's suite in full. Failures stop everything; nothing below is offered until they are fixed.
2. Environment: compare the resolved paths of `git rev-parse --git-dir` and `git rev-parse --git-common-dir`. Equal means a normal checkout. Different with a named branch means a linked worktree. Different with a detached HEAD means an externally managed workspace (no local merge, no cleanup).
3. Base branch: `git merge-base HEAD main` (or `master`), or confirm with the user.
4. The way forward follows the project's declared flow (instruction files, branch protection, CI). When none is declared, offer exactly four options and no explanation: merge into the base locally; push and open a PR; keep the branch as is; discard. Detached HEAD offers three: push as a new branch and open a PR; keep; discard.
5. Execute:
   - Merge locally: from the main checkout, check out the base, pull, merge, run the tests on the merged result; only then remove the worktree (step 6) and delete the branch with `-d`.
   - PR: push with the upstream set; the PR body is what, why, evidence (the pasted outputs); the worktree stays for follow-up.
   - Keep: report the branch and the worktree path; nothing removed.
   - Discard: list the branch, its commits and the worktree path, require the typed word `discard`, then remove the worktree and force-delete the branch.
6. Cleanup (merge and discard only): a worktree is removed only when the kit created it (under the ignored directory the project names, or `.worktrees/`); a workspace the host created stays, or is left through the host's own exit tool. Run `git worktree remove <path>` from the main checkout, never from inside the worktree, then `git worktree prune`.

Never: proceed with failing tests; merge without testing the merged result; delete work without the typed confirmation; force-push unless asked; remove a worktree before the merge is confirmed; remove a worktree the kit did not create; rewrite history on a shared branch.
