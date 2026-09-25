# Billing

Invoices, payments, credit notes and reports for each tenant. Next.js route handlers over Postgres through Prisma.

- `pnpm dev` runs the app, `pnpm test` the unit tests, `pnpm lint` the linter, `pnpm db:migrate` the migrations.
- Every invoice query goes through `src/repos/`, which scopes it to the caller's tenant (`docs/adr/0003-repositories.md`).
- Admin routes check the `ADMIN` role with `requireRole` and answer 403 themselves.
- Amounts are integers in minor units; `src/lib/money.ts` knows each currency's digits.
- The API is described in `docs/api.md`.

Set `FX_API_URL` for the revenue report's currency conversion.
