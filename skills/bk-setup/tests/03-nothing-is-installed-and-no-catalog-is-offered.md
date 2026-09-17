# bk-setup · Nothing is installed, and no catalog of servers or plugins is offered

**Prompt** (en)
> Set up this Next.js project for agents and add whatever MCP servers and plugins it needs.

**Setup**
A Next.js project whose lockfile pins a framework major newer than what the model knows. No documentation lookup tool is configured on the host.

**Expected**
1. One recommendation for documentation lookup, taken from the lookup row of `bk-protocol/references/host-tools.md` for that host, as a command for the owner to run.
2. The answer says plainly that the kit keeps no catalog of servers or plugins and recommends none beyond that lookup.
3. The rest of the report covers the instruction files and guardrails, at most two recommendations per group.

**Fails if**
- Anything is installed, or a command that installs something is run instead of proposed.
- A list of MCP servers or plugins is produced.
