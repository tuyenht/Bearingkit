# Review lenses, the confidence rubric, and what is not a finding

Adapted from anthropics/claude-plugins-official (Apache-2.0): `plugins/code-review/commands/code-review.md` and `plugins/pr-review-toolkit/agents/{code-reviewer,silent-failure-hunter,type-design-analyzer,code-simplifier,comment-analyzer}.md`, commit `3b60051`; attribution in `NOTICE`. Kept: the independent passes, the confidence rubric and its anchors, the false-positive list, and the per-lens checklists. Not kept: the GitHub comment format and its link rules, the model-and-agent orchestration (which host a lens runs on is `bk-protocol/references/host-tools.md`'s business), the pull-request eligibility check, and one project's own style rules, which belong to that project's instruction files rather than to the kit. The smells lens is adapted from mattpocock/skills (MIT): `skills/engineering/code-review/SKILL.md`, commit `3cca18b`, its smell baseline and the two rules that bind it; its parallel sub-agents and its spec axis are not carried (the spec check is `bk-build`'s). The weakened-bar lens carries an idea of addyosmani/agent-skills (MIT), in the kit's words.

## Passes

Each pass reads something different. A review that runs only the first is a skim.

1. **Project rules.** Read the project's own instruction files — the root one and any in the directories the diff touches — and check the change against them. Their guidance is written for whoever writes the code, so not every line applies at review time; a rule cited as violated is quoted, with its file.
2. **The diff alone.** Read only the changed lines and look for real bugs: logic errors, null and undefined handling, races, leaks, unbounded input, security. Resist reading the whole codebase on this pass; breadth here produces nitpicks, not findings.
3. **History.** Read `git blame` and the history of the lines touched. Code that was changed three times in a month is telling you something, and a bug that was fixed once and is now being reintroduced is only visible here.
4. **Earlier review comments.** Look at what was said on previous changes to these same files. A comment that applied then usually still applies, and repeating a reviewer's earlier point is cheaper than rediscovering it.
5. **The comments in the code.** Read the comments in and around the changed lines, and check the change against the guidance they carry. A change that contradicts a nearby comment either needs the comment updated or is wrong.

## Confidence rubric

Every finding is scored 0–100 before it is reported, and the score is defended against the code, not against a feeling. The anchors:

| Score | What it means |
|---|---|
| 0 | Does not survive light scrutiny, or is a pre-existing issue the change did not introduce. |
| 25 | Might be real; could not be verified. If it is stylistic, no project rule calls it out. |
| 50 | Verified as real, but it is a nitpick or rare in practice, and unimportant next to the rest of the change. |
| 75 | Verified, likely to be hit in practice, and the change's current approach is insufficient — or a project rule names it directly. |
| 100 | Confirmed by direct evidence, and it will happen often. |

**Report at 80 and above.** Below that the finding is noise dressed as diligence. When nothing reaches 80, say so plainly and list what was checked.

## Not a finding

These are the recurring false positives. Each one costs the reader trust, so they are filtered before the report, not after:

- A pre-existing issue on a line the change did not touch.
- Something that looks like a bug and is not, once the surrounding code is read.
- A pedantic nitpick a senior engineer would not raise.
- Anything a linter, type-checker or compiler catches by itself — missing imports, type errors, formatting. Those have their own gate at ship time.
- A general quality complaint (coverage, documentation, "security" in the abstract) that no project rule asks for.
- An issue a project rule names but the code deliberately silences, with the silencing visible.
- A functional change that is obviously part of what the change set out to do.
- A real issue on lines the author did not modify — worth a note, never a blocking finding.

## Lens: silent failures

The lens with the highest yield, because its defects are invisible until production. For every catch block, error callback, error branch, fallback value, and optional-chain that can hide a failure:

- **Logging.** Is the failure logged at a severity someone will see, with enough context — the operation, the identifiers, the state — that it can be debugged six months later?
- **Feedback.** Does the person using the software learn what went wrong and what they can do? A generic message is not feedback.
- **Catch width.** Does the block catch only what it expects? Name every unrelated error it would also swallow. Two narrow catches beat one broad one.
- **Fallbacks.** Is the fallback asked for by the spec, or is it hiding the problem? Would the person be confused about why they are seeing it instead of an error?
- **Mocks and stubs** belong in tests. Production code falling back to one is an architecture finding, not an error-handling finding.

## Lens: type design

For each type the change introduces, name its invariants — the consistency rules, the valid transitions, the relationships between fields — and then judge four things, each on its own:

- **Encapsulation.** Can an invariant be broken from outside? Is the interface minimal and complete?
- **Expression.** Are the invariants visible in the type's shape, and enforced by the compiler where the language allows?
- **Usefulness.** Do they prevent bugs that actually happen, without being so strict that legitimate states cannot be represented?
- **Enforcement.** Are they checked at construction, and at every mutation point? Is an invalid instance impossible to build, or merely discouraged?

## Lens: comments

A wrong comment is worse than no comment, because it is trusted. For every comment added or changed:

- Check each claim against the code: signatures, described behaviour, referenced symbols, edge cases said to be handled.
- Prefer the comment that says why. A comment restating what the line does is removed, not improved.
- Flag comments that describe a temporary state, or that will rot at the next likely change.

## Lens: smells

A fixed baseline of Fowler's code smells (*Refactoring*, chapter 3), checked on the lines the change touched; it applies even when the project documents no standard. Two rules bind it. The project's documented standard wins: a smell it endorses is not raised. And a smell is a judgement call, named as one ("possible Feature Envy"), never a violation; what tooling already enforces is skipped. Each is scored with the rubric like any finding, so most stay below 80; one reaches the report when it will cost this change, such as logic duplicated in two places the change just wrote. Name the move with the smell:

- **Mysterious name**: a name that does not say what the thing does or holds. Rename it; when no honest name comes, the design is unclear.
- **Duplicated code**: the same shape in two hunks or files of the change. Extract it once and call it from both.
- **Feature envy**: a function that works on another object's data more than on its own. Move it to that data.
- **Data clumps**: the same few fields or parameters travelling together. Give them one type.
- **Primitive obsession**: a string or number standing for a domain concept. Give the concept a small type.
- **Repeated switches**: the same branching on the same type in several places. One map both sites share, or polymorphism.
- **Shotgun surgery**: one logical change scattered across many files. Gather what changes together into one module.
- **Divergent change**: one module edited for unrelated reasons. Split it so each part changes for one reason.
- **Speculative generality**: parameters, hooks or layers no requirement asks for. Remove them until a need appears.
- **Message chains**: `a.b().c().d()` navigation the caller should not depend on. Hide the walk behind one method.
- **Middle man**: a class or function that mostly forwards. Call the real target.
- **Refused bequest**: a subclass that ignores most of what it inherits. Use composition instead.

## Lens: a weakened bar

A change can pass every check by lowering the check. Look for a threshold or budget moved; a test skipped, deleted or stripped of assertions; a checker silenced by a new suppression (type, lint, coverage or secret-scan ignores); work left unfinished (a stub that throws, an empty catch, a note standing where a branch should be); an exception to a project rule that the change does not discuss. Each is reported with the rule it relaxes. One the change explains in its own text is a decision, not a finding (see "Not a finding").

## Lens: simplification

Functionality is preserved exactly; only the shape changes. Reduce nesting, drop redundant abstraction, consolidate related logic, and delete comments that restate the code. Two limits: clarity beats brevity — a nested ternary or a dense one-liner is not a simplification — and an abstraction that organises the code stays. The scope is what the change touched, never the whole file.
