-- CreateEnum
CREATE TYPE "QuoteRequestStatus" AS ENUM ('NEW', 'REVIEWING', 'QUOTED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuoteUrgency" AS ENUM ('NORMAL', 'SOON', 'URGENT');

-- CreateEnum
CREATE TYPE "QuoteRequestWorkType" AS ENUM ('TROUBLESHOOTING', 'RENOVATION', 'NEW_CONSTRUCTION', 'ENERGY_RENOVATION', 'EXTENSION', 'OTHER');

-- CreateEnum
CREATE TYPE "BuildingAge" AS ENUM ('UNKNOWN', 'UNDER_2_YEARS', 'OVER_2_YEARS');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ServiceUnit" AS ENUM ('UNIT', 'HOUR', 'METER', 'M2', 'FORFAIT', 'DAY');

-- CreateEnum
CREATE TYPE "TaxContext" AS ENUM ('NEW_CONSTRUCTION', 'RENOVATION_OVER_2_YEARS', 'RENOVATION_UNDER_2_YEARS', 'ENERGY_RENOVATION', 'OTHER');

-- CreateTable
CREATE TABLE "DocumentSequence" (
    "id" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "DocumentSequence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "postalCode" TEXT,
    "city" TEXT,
    "workType" "QuoteRequestWorkType" NOT NULL,
    "buildingAge" "BuildingAge" NOT NULL DEFAULT 'UNKNOWN',
    "description" TEXT NOT NULL,
    "urgency" "QuoteUrgency" NOT NULL DEFAULT 'NORMAL',
    "availability" TEXT,
    "status" "QuoteRequestStatus" NOT NULL DEFAULT 'NEW',
    "rgpdConsentAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequestPhoto" (
    "id" TEXT NOT NULL,
    "requestId" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QuoteRequestPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCatalog" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "unit" "ServiceUnit" NOT NULL DEFAULT 'UNIT',
    "unitPriceHT" DECIMAL(10,2) NOT NULL,
    "costPriceHT" DECIMAL(10,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServiceCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceTaxRule" (
    "id" SERIAL NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "context" "TaxContext" NOT NULL,
    "taxRate" DECIMAL(5,2) NOT NULL,
    CONSTRAINT "ServiceTaxRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "requestId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT,
    "workAddress" TEXT NOT NULL,
    "postalCode" TEXT,
    "city" TEXT,
    "taxContext" "TaxContext" NOT NULL DEFAULT 'OTHER',
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "paymentTerms" TEXT,
    "depositPercent" DECIMAL(5,2),
    "subtotalHT" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "totalTTC" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "token" TEXT NOT NULL,
    "taxCertificationRequired" BOOLEAN NOT NULL DEFAULT false,
    "taxCertificationAcceptedAt" TIMESTAMP(3),
    "taxCertificationName" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteItem" (
    "id" TEXT NOT NULL,
    "quoteId" TEXT NOT NULL,
    "serviceId" INTEGER,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL DEFAULT 1,
    "unit" "ServiceUnit" NOT NULL DEFAULT 'UNIT',
    "unitPriceHT" DECIMAL(10,2) NOT NULL,
    "costPriceHT" DECIMAL(10,2),
    "taxRate" DECIMAL(5,2) NOT NULL,
    "totalHT" DECIMAL(12,2) NOT NULL,
    "totalTax" DECIMAL(12,2) NOT NULL,
    "totalTTC" DECIMAL(12,2) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequest_number_key" ON "QuoteRequest"("number");
CREATE INDEX "QuoteRequest_status_createdAt_idx" ON "QuoteRequest"("status", "createdAt");
CREATE INDEX "QuoteRequestPhoto_requestId_idx" ON "QuoteRequestPhoto"("requestId");
CREATE INDEX "ServiceCatalog_active_category_sortOrder_idx" ON "ServiceCatalog"("active", "category", "sortOrder");
CREATE UNIQUE INDEX "ServiceTaxRule_serviceId_context_key" ON "ServiceTaxRule"("serviceId", "context");
CREATE UNIQUE INDEX "Quote_number_key" ON "Quote"("number");
CREATE UNIQUE INDEX "Quote_token_key" ON "Quote"("token");
CREATE INDEX "Quote_status_createdAt_idx" ON "Quote"("status", "createdAt");
CREATE INDEX "Quote_requestId_idx" ON "Quote"("requestId");
CREATE INDEX "QuoteItem_quoteId_position_idx" ON "QuoteItem"("quoteId", "position");

-- AddForeignKey
ALTER TABLE "QuoteRequestPhoto" ADD CONSTRAINT "QuoteRequestPhoto_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ServiceTaxRule" ADD CONSTRAINT "ServiceTaxRule_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "QuoteRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "QuoteItem" ADD CONSTRAINT "QuoteItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "ServiceCatalog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
