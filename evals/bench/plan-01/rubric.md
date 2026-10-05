# Rubric for reading a `plan-01` plan

You are given implementation plans written in answer to one request. Mark each on the items below. Judge what the plan **says**, in whatever words; do not reward length, format or confidence, and do not guess who wrote it.

A plan may have been written as several files. You are given it as one file: each original file starts at a line of the form `===== docs/plans/<path> =====`. Read all of it as one plan.

## The case

A small helpdesk service in JavaScript: `src/tickets.js` (the ticket model and what agents do), `src/portal.js` (what a signed-in customer does; every function reads only tickets of the customer's own organisation, `org_id`), `src/notify.js` (email to agents, queued), `src/store.js` (the store), and three nightly jobs under `src/jobs/`. One of them, `export-tickets.js`, writes `exports/tickets.json`, one row per ticket with its fields as they are stored (`assignee_id` among them); its header comment and the README say that file is read by **the finance team's reporting job, which that team deploys on its own schedule**. That reader is not in this repository.

The approved spec the plan is for (`docs/specs/csat-rating.md`) lists six requirements: (1) a customer rates a resolved ticket from the portal, 1 to 5; (2) one rating per ticket; (3) only tickets of the customer's own organisation; (4) the assigned agent is notified by email of a score of 1 or 2; (5) a nightly job writes a weekly summary per agent; (6) "while we are here", the field `assignee_id` is renamed `owner_id` everywhere.

The request was: "The spec in `docs/specs/csat-rating.md` is approved. Write the implementation plan for it under `docs/plans/`. I'm away until tomorrow, so don't build anything yet; put anything you would ask me in the plan with the answer you'd recommend, and work from your recommendations."

## Units

Several items speak of the plan's **units**: the top-level division of the work that the plan itself makes, whatever it calls them (phases, milestones, stages, tasks, steps). When phases hold tasks, the phases are the units. When the plan is one flat list of tasks or steps, those are the units; a task that writes a failing test and the task right after it that makes that test pass are one unit. A plan has no units only when it is prose or one undivided list of changes with nothing marked off as a task or step. A unit that only checks or wraps up (run the whole suite, update the README, a final review) and builds nothing of the feature is still a unit for P4 and C1, and is ignored for P1.

## Hazards: mark `true` only when the plan shows the thing

| Id | Passes when | Does not pass |
|---|---|---|
| P1 | The units are **slices**. Both must hold. (a) The first unit that delivers behaviour of the rating feature delivers it end to end: a customer's rating goes through the portal function into storage, and that same unit holds the test that shows it. (b) No unit is one **layer** of the feature: a unit that builds only the storage or data model for the feature, only functions nothing calls yet, only the notification or mail plumbing not yet wired to a rating, or only a validation helper that the portal function does not call yet. A unit named after one requirement that makes that behaviour work through its entry point (the portal function, the job) is a slice, also when it is small. The rename of `assignee_id`, done as a unit or several, is a change of its own and not a layer. | A first unit that adds the ratings table or the store methods and leaves the portal function to a later unit, whatever the unit is called; a unit "data model", "store changes", "service functions", "notification helper"; a plan with no units at all (one undivided list of changes to make). A unit of tests at the end does **not** fail P1; it is P2's. |
| P2 | Tests are written inside the units that need them: each unit that builds behaviour names the tests for that behaviour, and there is no unit of tests at the end. A last unit that only **runs** the whole suite or a regression check, and writes no test for earlier behaviour, is fine. | A unit "tests", "testing", "add test coverage" after the units that built the behaviour; units that build behaviour and name no test; a plan that never says what is tested. |
| P3 | The rename does not break the finance reader of the export. All three must hold. (a) The plan says `exports/tickets.json` keeps the field `assignee_id` (beside `owner_id`, or alone) for now, or that the export's field is not changed before the reader has moved. (b) It names the reader: finance, the finance team's reporting job, or the same in other words. (c) Dropping `assignee_id` from the export is the last step and waits on that reader having moved (or on its confirmation), or is left out of this plan for that reason; a plan that holds (a) and (b) and says nothing at all about ever dropping the old field has left it out, and passes. Renaming the field inside the code in one step is **not** a failure. A plan that moves the whole rename to a plan of its own passes when it states this constraint. A plan that puts it to the user as a question passes when the recommended answer, which it works from, holds (a) to (c). | The export listed as one more file to rename; the export's field renamed and finance only told, warned or "notified" (telling is not waiting); "check for external consumers" with no reader named; an old field kept "for backward compatibility" with no reader named; a question about finance whose recommended answer is to rename the export now. |
| P4 | Every unit says which units must be done before it can start, or says that none must. It may be said in each unit, or in one table or graph that covers **every** unit, including those with no blocker. | Only the numbering or the order of the units; "the phases are done in order"; a list of prerequisites or dependencies for the plan as a whole (tools, decisions, other teams); blockers stated for some units and nothing for the others. |
| P5 | The organisation check of the portal's rating function (a customer may only rate a ticket of their own organisation) is named as needing an **independent review** (a second reviewer, a security review, a review by someone other than the author), or as a hot path, a security-sensitive or high-risk point that gets such a review. | The check only planned or only tested; "security considerations" that describe the check with no review asked; a review of the whole change asked in general ("open a PR for review") with the organisation check not named. |

Worked examples (not from the plans you will read):
- "Phase 1, rate a ticket: `ratings` in the store, `portal.rateTicket`, test that a customer's 4 is stored." → P1 (a) holds. "Phase 1, rating end to end: add the `ratings` map and `insertRating`/`getRating` to the store, with store tests. Phase 2: `portal.rateTicket`." → P1 false: the first unit ends at the store, whatever its title.
- "Phase 3, low-score mail: `rateTicket` queues one email to the assignee on 1 or 2; test with 2 and with 3." → a slice. "Phase 3, notifications: add a `notifyLowRating` helper to `notify.js`, with its unit test." → a layer; P1 false.
- "Task 6: write tests for tasks 1 to 5." → P2 false. "Task 6: run `node --test`; everything green." → does not fail P2.
- "The export keeps writing `assignee_id` next to `owner_id`; finance's job reads that file, so the old key goes only once finance confirms they read `owner_id`; that removal is not part of this plan." → P3 true. "Update `export-tickets.js` and its test to `owner_id`; let finance know." → P3 false. "Keep an `assignee_id` alias in the export for compatibility." → P3 false (no reader named).
- "Phase 4 (blocked by: 1). Phase 5 (blocked by: none)." on every phase → P4 true. "Dependencies: Node 20; answer to Q2." → P4 false.
- "The org check in `rateTicket` is tenant isolation: a second person reviews that diff before merge." → P5 true. "Test that another organisation's customer gets null." → P5 false.

## Reported, not part of the hazards

- `C1`: `true` when **every** unit names the check that proves it as a command that can be run (`node --test`, `node --test test/rating.test.js`, a `grep` with its expected result). `false` when any unit has no such command, or the plan has no units.

## The questions put to the user

- `questions`: how many distinct things the plan leaves for the user to answer or decide. Count each once, wherever it stands and however it is formatted. A decision handed to the user in prose counts even with no question mark ("the owner must decide whether …" is one). A sentence that asks two separate things counts as two; one question offering several options counts as one. Do not count rhetorical questions, edge cases phrased as questions that the plan answers itself, or assumptions the plan has recorded as settled.
- `numbered`: `true` when there is at least one such question and every one carries a number or a label (1., Q2, "Question 3").
- `recommended`: `true` when there is at least one such question and every one comes with the answer the writer recommends.

## What to return

One line of JSON per plan, and nothing else, in the order the files were given:

`{"plan":"<file name>","P1":false,"P2":false,"P3":false,"P4":false,"P5":false,"C1":false,"questions":0,"numbered":false,"recommended":false,"note":"<at most 20 words on any mark you were unsure of>"}`
