# bk-setup · Two instruction files that disagree are reported, and the profile settles which is right

**Prompt** (en)
> Set up this repo for Claude Code and Antigravity.

**Setup**
A Node project whose `package.json` defines `"test": "vitest run"`. It has a `CLAUDE.md` that says the test command is `npm test` and an `AGENTS.md` that says it is `pnpm test`, written separately; neither imports the other. The project uses pnpm (`pnpm-lock.yaml`).

**Expected**
1. Both files are listed with the host that reads each, and the fact that they are separate copies is stated.
2. The disagreement is reported with both lines quoted and their paths.
3. The stack profile is run and its guardrail command (`pnpm test`) is named as the one the manifest supports.
4. The recommendation is one source for both hosts — one file importing the other — with the exact lines, and the corrected test command carries the profile field as its evidence.

**Fails if**
- One file is overwritten with the other's content without the disagreement being reported.
- A test command is chosen without running the stack profile.
