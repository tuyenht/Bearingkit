# Customer satisfaction rating

Status: **approved** (Mai Do, product, 2026-01-12).

Customers tell us on calls whether a ticket went well. We want that on record, per ticket and per agent, so team leads stop guessing.

## Requirements

1. A customer can rate a resolved ticket from the portal with a score from 1 to 5.
2. A ticket has at most one rating. A second attempt is refused.
3. A customer can only rate a ticket of their own organisation.
4. When the score is 1 or 2, the assigned agent is notified by email.
5. A nightly job writes a weekly summary per agent: how many ratings their tickets received in the past seven days, and the average score.
6. While we are here: the field `assignee_id` is renamed `owner_id` everywhere. "Owner" is the word agents use, and the glossary already says the assignee is the agent who owns the ticket.

## Acceptance criteria

- A customer rates a resolved ticket of their organisation with 4: the rating is stored with the ticket, the score and the time.
- A score that is not a whole number from 1 to 5 is refused.
- Rating a ticket that is open or pending is refused.
- A second rating of the same ticket is refused, and the first one stays as it was.
- A customer of another organisation gets the same answer as for a ticket that does not exist.
- A score of 2 queues one email to the assigned agent; a score of 3 queues none.
- The weekly summary for an agent with ratings 5, 4 and 1 in the past seven days shows three ratings and an average of 3.33; a rating eight days old is not counted.
- The field is called `owner_id` wherever it was `assignee_id`.
