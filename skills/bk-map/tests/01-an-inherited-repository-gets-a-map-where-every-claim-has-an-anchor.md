# bk-map · An inherited repository gets a map where every claim has an anchor, and what only the owner knows is asked, not guessed

**Prompt** (en)
> I just inherited this repository and there are no docs beyond the README. Map the codebase for me before I start changing things.

**Setup**
A web application with API route handlers, a queue worker started from its own process file, a database schema with migrations, and a CI workflow that pins its runtime version and installs from a private registry named in the package manager's configuration. There is no `docs/architecture-map.md` and no agent instruction file. One job handler is registered only through a string in the worker's configuration file.

**Expected**
1. The five first-contact questions are asked once, and reading goes on without waiting for the answers.
2. The CI workflow is read before anything is said about the build: the pinned runtime version and the private registry are quoted with their files.
3. The data is mapped first (schema and migrations), then the entry points from where they are declared: the route files, the worker's process file, the workflow.
4. The handler registered through configuration appears as a dispatch edge, never as dead code.
5. `docs/architecture-map.md` is written with the sections of `references/codebase-map.md`: every claim with `path:line` or marked inferred, the unanswered questions as open items, the commit it was drawn at.
6. The project has no instruction file, so what the map found for one is handed to `bk-setup`; nothing is written outside the map.

**Fails if**
- A module is called unused or dead while a configuration-driven dispatch could reach it.
- An install, a build or any project script runs without the user asking.
- An instruction file (`AGENTS.md`, `CLAUDE.md`) is created or edited.
