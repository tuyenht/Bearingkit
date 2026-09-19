# bk-map sprint: tool behaviour checked against documentation · 2026-09-19

Two things the sprint relies on that are not the kit's own code: the permission rule that lets the measurement harness read the kit's references (`docs/status.md` §7 (dd)), and the tool behaviour the new references state. Each row names the page that settles it. The permission passages were read by the main session; the git rows were also run on this machine; the CI and registry rows were read by a research agent (Sonnet) on the vendors' own sites, quotes as it returned them (its pages go through a summarising fetch, so a quote is checked for sense, not byte for byte).

## The isolated profile may read `skills/` (status §7 (dd))

Source: Claude Code docs, "Configure permissions", `https://code.claude.com/docs/en/permissions`, read 2026-09-19.

- Read-only tools need no approval "within the working directory and additional directories"; outside them a read needs a permission, and in `claude -p` nobody can grant one, which is why the bk-db behaviour runs saw only `SKILL.md` bodies.
- Rule syntax: `//path` is "Absolute path from filesystem root", example `Read(//Users/alice/secrets/**)`.
- Windows: "paths are normalized to POSIX form before matching. `C:\Users\alice` becomes `/c/Users/alice`".
- Where: user settings, `$CLAUDE_CONFIG_DIR/settings.json` when `CLAUDE_CONFIG_DIR` is set; a `//` rule there applies in every project.
- Read rules reach Grep and Glob on a best-effort basis ("Claude makes a best-effort attempt to apply `Read` rules to all built-in tools that read files like Grep and Glob").
- Rejected: `permissions.additionalDirectories`. It would grant edits under the permission mode as well as reads, and it names the whole checkout; the narrower rule is enough.

Applied: one entry in `permissions.allow` of `_build/profile/claude/settings.json`, `Read(//c/Projects/Bearingkit/skills/**)`, by a script that parses the file, adds the entry if absent, writes it back and checks that every other key is unchanged; it prints no content of the file and never opens the profile's credentials file. The rule covers `skills/` only: the checkout root also holds `_build/`, where that credentials file lives. `_build/` is not tracked, so a rebuilt profile needs the entry again, like the two sync keys of §7 (t).

Checked both ways, 2026-09-19, Claude Code 2.1.274, one session each: `skills/bk-db/references/diagnose.md` opened (`is_error` false, 0 permission denials); `AGENTS.md` at the checkout root was refused ("you haven't granted it yet", 1 denial). Not covered: `detect-stack`, which runs through Bash and still needs a Bash permission in `claude -p`; and a worktree under `_build/`, whose `skills/` sits outside the rule, so behaviour runs use the main checkout.

## Tool behaviour in `skills/bk-map/references/`

| # | Claim in the reference | Page | What settles it | Result |
|---|---|---|---|---|
| 1 | `git log --name-only` lists the files each commit changed | git-scm.com/docs/diff-options (included by git-log) | "Show only the name of each changed file in the post-image tree." | holds; run here on git 2.55.0 |
| 2 | `--format=` with an empty format prints no header, leaving the file names | git-scm.com/docs/pretty-formats | `tformat:` gives "terminator" semantics instead of "separator" semantics | holds: blank lines separate commits; run here |
| 3 | `--since=<date>` limits to commits after the date | git-scm.com/docs/git-log | "Show commits more recent than <date>." | holds |
| 4 | `git log --name-status` names each file with its status | git-scm.com/docs/diff-options, diff-config | "Show only the name(s) and status of each changed file." | holds with a correction: `diff.renames` defaults to true for `git log`, so renames show as `R`; the reference now says "added, modified, deleted or renamed" |
| 5 | `<commit>..HEAD` is what HEAD has and `<commit>` does not | git-scm.com/docs/gitrevisions | "commits that are reachable from r2 excluding those that are reachable from r1" | holds; run here |
| 6 | GitHub Actions workflows live in `.github/workflows/` | docs.github.com, Actions quickstart | "save the workflow files in a directory called .github/workflows" | holds |
| 7 | GitLab CI is configured in `.gitlab-ci.yml` | docs.gitlab.com/ci/quick_start | "Create a .gitlab-ci.yml file at the root of your repository." | holds |
| 8 | Azure Pipelines' file is `azure-pipelines.yml` | learn.microsoft.com, create your first pipeline | "commit a new azure-pipelines.yml file to your repository" | holds as the generated default; the name can be changed, and the reference now says so (added after the independent review) |
| 9 | A Jenkins pipeline is a `Jenkinsfile` in source control | jenkins.io/doc/book/pipeline | "written into a text file (called a Jenkinsfile)" | holds |
| 10 | Bitbucket Pipelines is `bitbucket-pipelines.yml` | support.atlassian.com, get started with Bitbucket Pipelines | "a YAML file called bitbucket-pipelines.yml, which is located at the root" | holds |
| 11 | `.npmrc` configures npm, including its registry | docs.npmjs.com, npmrc and registry pages | npm reads its config from "npmrc files"; the registry is configurable | holds |
| 12 | `pip.conf` configures pip's index | pip.pypa.io, configuration | Unix and macOS use `pip.conf`, Windows `%APPDATA%\pip\pip.ini`; `index-url` under `[global]` | holds with a correction: the reference now names `pip.conf` or `pip.ini` |

The references name no other tool behaviour: entry points, dispatch and storage are described by kind (route declarations, the container's start command, the scheduler's task list), not by a framework's file layout, so no framework claim needs a page.
