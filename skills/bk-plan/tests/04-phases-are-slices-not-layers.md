# bk-plan · Phases are end-to-end slices, each naming what blocks it

**Prompt** (en)
> Plan the saved-searches feature: a user saves a search from the results page, sees their saved searches in the sidebar, and gets a weekly email of new matches.

**Setup**
A spec produced by bk-spec for that feature, in a project with a database, an API and a web interface, so that the natural first draft is "schema, then API, then UI, then tests".

**Expected**
1. The first phase delivers one behaviour end to end (a search saved from the results page is stored and listed), with its test in the same phase.
2. No phase is one layer of the feature: there is no phase "schema", "API", "UI" or "tests".
3. Every phase file says what it makes work, the check that demonstrates it, and which phases block it, or "none".

**Fails if**
- The plan is a sequence of layers with the tests in a last phase.
- Blockers are given only as the order of the phases, or as one list of dependencies for the whole plan.
