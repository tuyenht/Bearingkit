# First contact with a repository

Adapted from anthropics/claude-plugins-official (Apache-2.0): `plugins/code-modernization/commands/modernize-preflight.md`, commit `3b60051`; attribution in `NOTICE`. Kept: the questions only the owner can answer, asked without blocking and recorded verbatim; the build definition as the ground truth; the checks for missing sources; the scope boundary in both directions. Changed: the fourth question asks which documents are trusted, where the source asked about earlier modernization attempts. Not kept: the modernization framing, the analysis-tool table, the per-command readiness verdicts, and the build smoke test as a default step (an unfamiliar project's restore and build run its own scripts, so here they run only when the user asks).

## Ask the owner, then keep reading

Some facts are not in the source, and a person who knows the system gives them in seconds. Ask these five once, before reading; add none, and accept "don't know". A refresh asks only the ones still open.

1. **Scope**: is this the whole system or one part of a larger codebase? If a part, what outside depends on it?
2. **Build and test here**: can this machine build it and run its tests, and how long does the full pipeline take?
3. **Unusual build machinery**: an internal package feed, a code generator, a wrapper around the build tool, anything a newcomer would not guess; where is it written down?
4. **Documents**: which existing documents are trusted, and which are known to be stale?
5. **Off limits**: anything not to be read or mapped this time, such as another team's component or generated or vendored code?

Nothing below waits for the answers. Each answer goes into the map verbatim, with who gave it and when; a question still open goes in verbatim as an open item for the owner. A caveat the owner gave is never paraphrased away.

## Read how it really builds

The build definition is the most honest document a repository has: the toolchain it pins, where dependencies really come from, the steps a plain build command skips. Find and read, before guessing:

- the CI pipeline: `.github/workflows/`, `.gitlab-ci.yml`, `azure-pipelines.yml` (the default name, which a project can change), `Jenkinsfile`, `bitbucket-pipelines.yml`, or the `Makefile` it calls;
- build configuration above or beside the source: a parent build file, a private registry setting (`.npmrc`, `pip.conf` or `pip.ini`), a root `scripts/`, `tools/` or `build/` directory.

Report what was found, or that nothing was; quote the pinned toolchain version and where dependencies come from; name anything bespoke.

A restore or a build runs the project's own scripts, so it is not reading. Prove the build on one real unit (one project or module, built the way CI builds it) only when the user asks. A failure is reported with its error and a diagnosis; a build that cannot run on this machine is recorded as a fact, not a failure.

## Check what the tree is missing

The map is only as good as what is in the tree:

- imports and includes that resolve nowhere: count them and list the top names;
- deployment and configuration descriptors (routes, scheduler and queue definitions, container and process files): without them, entry points are guesswork;
- data definitions: schemas, migrations, ORM models;
- binary-only artifacts with no source (a vendored jar or DLL, a minified bundle): black boxes, flagged now;
- history: whether version control holds a meaningful history, which the hot-spot ranking needs.

## Find the boundary

When a repository, workspace or solution root sits above the directory, or files inside it reference paths outside it, the directory is a slice. Report both directions:

- **Outbound**: what inside depends on source outside. The map cannot see those edges; list them.
- **Inbound**: what outside depends on things inside. That is the blast radius of any change here, and each needs its own decision before an in-place change.

A standalone repository gets one line saying so.

## Record it first

The map opens with the owner's answers, verbatim, and the boundary finding, because every later reader needs them unparaphrased; then one line per check: what was found, what is missing, and what that costs the map.
