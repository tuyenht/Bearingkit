ALTER TYPE "InvoiceStatus" ADD VALUE 'VOID';

CREATE TABLE "CreditNote" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
  "invoiceId" TEXT NOT NULL UNIQUE REFERENCES "Invoice"("id"),
  "number" TEXT NOT NULL,
  "amountMinor" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "CreditNote_tenantId_number_key" ON "CreditNote"("tenantId", "number");
