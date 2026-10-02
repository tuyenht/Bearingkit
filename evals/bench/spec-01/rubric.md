# Rubric for reading a `spec-01` spec

You are given specifications written in answer to one feature request. Mark each on the items below. Judge what the spec **says**, in whatever words; do not reward length, format or confidence, and do not guess who wrote it.

## The case

A small helpdesk service. Its glossary says a ticket is `open`, `pending`, `resolved` or `closed`; a **resolved** ticket can still be reopened (by an agent, or by the customer answering it); a **closed** ticket is final and is never changed again. A nightly job closes a resolved ticket after three quiet days. Another nightly job deletes a closed ticket's messages **7 days** after it was closed. An agent-side function `reopenTicket` in `src/tickets.js` already takes a resolved ticket back to open and notifies the assignee. A ticket may have no assignee. Every portal query is limited to the customer's own organisation (`org_id`). The SLA due time is set once, when the ticket is created.

The request was: "let a customer reopen a closed ticket from the portal within 14 days of it being closed, and notify the assigned agent when they do." The user was away and asked for a spec, with anything the writer would ask put in the spec together with a recommended answer.

## Hazards: mark `true` only when the spec says the thing

| Id | Passes when the spec says | Does not pass |
|---|---|---|
| H1 | That reopening a **closed** ticket goes against the project's own rule (closed is final; only resolved tickets can be reopened), whichever way it then resolves it: reading the request as "resolved", proposing to change the rule, or asking which is meant | Repeating the glossary's definitions without saying the request conflicts with them; using "closed" and "resolved" loosely with no remark |
| H2 | That the 14-day window cannot work as asked because a closed ticket's messages are deleted after 7 days (or an equivalent statement that the purge comes before the window ends) | Mentioning 14 days alone; mentioning the purge job with no link to the window |
| H3 | What happens to the notification when the ticket has no assignee | Mentioning the unassigned queue with nothing about the notification |
| H4 | That the reopen must be refused, or is limited, for tickets outside the customer's own organisation | A success case that happens to mention the customer's organisation; a general remark about security |
| H5 | That a reopen already exists in the code (the agent-side `reopenTicket`, or the customer's answer reopening a resolved ticket), shown by naming it | Planning to add a reopen function or route with no sign the existing one was found |
| H6 | Whether the SLA due time is reset on reopen, **settled in one of two ways**: put as a question to the user with a recommended answer, or written down as what the spec will do (a decision, an assumption, or a plain requirement such as "the due time is reset on reopen") | The SLA described as it is today with no position on what a reopen does to it; "to be decided" with no recommendation; a question that only asks when to decide it, or a recommendation to decide it later |
| H7 | At least one concrete thing that is out of scope | A heading or label with nothing concrete behind it ("TBD", "none", "anything else") |

Worked examples (not from the specs you will read):
- "A closed ticket is final per the glossary; this feature changes that." → H1 true. "Closed tickets are final and resolved tickets are not." → H1 false.
- "A fortnight outlasts the purge, which deletes messages after a week." → H2 true. "Reopening is possible for 14 days." → H2 false.
- "The route checks the ticket's org_id and answers 404 otherwise." → H4 true. "A customer reopens a ticket of their organisation and it becomes open." → H4 false.
- "Tickets nobody owns: the mail is skipped." → H3 true. "Notify the assignee." → H3 false.
- "`reopenTicket` only accepts resolved tickets." → H5 true. "Add a reopen route to portal.js." → H5 false.
- "SLA: restart? Assume yes." → H6 true. "SLA handling: still to be decided." → H6 false.
- "Not covered here: reopening by email." → H7 true. "Out of scope: anything not listed above." → H7 false.

## Decoys: mark `true` when the spec **asks the user** for a fact the code or the glossary already answers

| Id | The fact asked |
|---|---|
| D1 | Which statuses a ticket can have |
| D2 | How agents are notified today (whether a notification mechanism exists) |
| D3 | Whether agents can already reopen a ticket |

A question that puts a **decision** is not a decoy even when it uses these words ("Should a reopened ticket go to open or pending?", "Should the portal reuse `reopenTicket`?"). A fact merely stated is not a decoy.

## The questions put to the user

- `questions`: how many distinct things the spec leaves for the user to answer or decide. Count each once, wherever it stands and however it is formatted. A decision handed to the user in prose counts even with no question mark ("the owner must decide whether …" is one). A sentence that asks two separate things counts as two; one question offering several options counts as one. Do not count rhetorical questions, edge cases phrased as questions that the spec answers itself, or assumptions the spec has recorded as settled.
- `numbered`: `true` when there is at least one such question and every one carries a number or a label (1., Q2, "Question 3").
- `recommended`: `true` when there is at least one such question and every one comes with the answer the writer recommends.

## What to return

One line of JSON per spec, and nothing else, in the order the files were given:

`{"spec":"<file name>","H1":false,"H2":false,"H3":false,"H4":false,"H5":false,"H6":false,"H7":false,"D1":false,"D2":false,"D3":false,"questions":0,"numbered":false,"recommended":false,"note":"<at most 20 words on any mark you were unsure of>"}`
