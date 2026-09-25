# Billing

Invoices, payments and admin tools for each tenant. Next.js route handlers over Postgres through Prisma.

- `pnpm dev` runs the app, `pnpm test` the unit tests, `pnpm db:migrate` the migrations.
- Every query is scoped to the caller's tenant (`session.tenantId`).
- Admin routes require the `ADMIN` role.
