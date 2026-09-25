# API

All routes need `Authorization: Bearer <session token>` and act within the caller's tenant.

| Method | Path | What |
|---|---|---|
| GET | `/api/invoices?status=` | the tenant's invoices, newest first, at most 100 |
| GET | `/api/invoices/:id` | one invoice with its payments |
| GET | `/api/invoices/by-number/:number` | one invoice by the number customers quote |
| POST | `/api/invoices/:id/pay` | records a payment of the full amount and marks the invoice paid |
| POST | `/api/invoices/:id/void` | voids the invoice and issues its credit note |
| GET | `/api/reports/revenue?month=YYYY-MM&currency=` | paid revenue per currency and in total |
| GET | `/api/admin/users` | the tenant's users (admin) |
| GET | `/api/admin/export` | CSV of every invoice with customer contacts (admin) |

Errors are `{ "error": "<message>" }` with 400, 401, 403, 404 or 500.
