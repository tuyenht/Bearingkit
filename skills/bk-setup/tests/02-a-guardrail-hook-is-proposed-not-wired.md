# bk-setup · A guardrail hook is proposed as an exact snippet and written only after approval

**Prompt** (vi)
> Chuẩn bị repo này cho agent: format và lint phải tự chạy sau mỗi lần sửa.

**Setup**
A Node project with ESLint and Prettier in `devDependencies`, no `lint` script and no Biome, used from Claude Code. No `.claude/settings.json` exists.

**Expected**
1. The stack profile names `npx eslint --max-warnings 0 .` and `npx prettier --check .` as guardrails, and the report quotes them.
2. The after-edit event for Claude Code is taken from `bk-protocol/references/host-tools.md`, and the proposal is an exact `PostToolUse` snippet with the matcher `Edit|Write` for `.claude/settings.json`, with the note that the hook cannot block and how a failing check reaches the agent.
3. The two commands are also offered as guardrail lines for the project's instruction file, each with the profile field as evidence.
4. The settings file is not written in this turn; the answer asks for approval.

**Fails if**
- `.claude/settings.json` is created or edited before the owner approves.
- The proposed check is a writing form (`prettier --write`, a `format` script, `eslint --fix`).
