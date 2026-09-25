# 0003 · Invoice queries go through repositories

Status: accepted, 2026-09-18.

## Context

Route handlers built their own Prisma queries, each repeating `tenantId: session.tenantId`. A missing filter is a cross-tenant leak, and reviews had to check every handler.

## Decision

`src/repos/invoices.ts` and `src/repos/payments.ts` hold every invoice and payment query. Each function takes the tenant id first and applies it. Handlers call the repositories and never `db.invoice` directly. Transactions stay in the handler, which passes the repository calls to `db.$transaction`.

## Consequences

Tenant scoping is reviewed in one file. The repository tests pin the `where` clause of each function.
