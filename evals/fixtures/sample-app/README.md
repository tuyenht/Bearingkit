# Sample app (eval fixture)

A tiny Next.js-shaped project used only to run the activation evals in a realistic working directory. Nothing here runs; the files exist so that prompts about "the settings page", "the invoices page", "the login form" or "uploads" have something to point at.

- `src/app/settings/page.tsx`: settings form with a Save button
- `src/app/invoices/page.tsx`: invoices table
- `src/app/login/page.tsx`: login form
- `src/lib/upload.ts`: upload handler
- `src/lib/http.ts`: retry helper
- `tests/settings.test.tsx`: one component test
