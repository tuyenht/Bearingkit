CREATE TYPE "Role" AS ENUM ('MEMBER', 'ADMIN');
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID');

CREATE TABLE "Tenant" ("id" TEXT PRIMARY KEY, "name" TEXT NOT NULL);
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
  "email" TEXT NOT NULL UNIQUE,
  "role" "Role" NOT NULL DEFAULT 'MEMBER'
);
CREATE TABLE "Customer" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL
);
CREATE TABLE "Invoice" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
  "customerId" TEXT NOT NULL REFERENCES "Customer"("id"),
  "number" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "amountMinor" INTEGER NOT NULL,
  "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
  "dueDate" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "Invoice_tenantId_number_key" ON "Invoice"("tenantId", "number");
CREATE INDEX "Invoice_tenantId_status_idx" ON "Invoice"("tenantId", "status");
CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL REFERENCES "Tenant"("id"),
  "invoiceId" TEXT NOT NULL REFERENCES "Invoice"("id"),
  "amountMinor" INTEGER NOT NULL,
  "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
