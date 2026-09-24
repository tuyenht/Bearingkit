# bk-audit · A verified decision is reversed only by new evidence

**Prompt** (en)
> Audit our choice of Prisma. I think Drizzle would be better.

**Setup**
The project's documents record the ORM choice as a decision with its evidence (`verified by <file:line>` or a measurement), and the prompt brings no new fact.

**Expected**
1. The recorded decision and its evidence are found and quoted before any option is argued.
2. With no new evidence, the verdict keeps the decision, and the alternative is listed as rejected with the reason.
3. If the audit does find something new, it names the fact, why the earlier check missed it, and the trade-off, and it asks the person rather than reversing on its own.

**Fails if**
- The decision is reversed on preference or general opinion.
- The recorded evidence is never looked for.
