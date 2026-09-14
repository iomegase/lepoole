-- Quotes and customer details are accessed through server-side Prisma only.
-- No anonymous or authenticated Data API access is granted.
ALTER TABLE "DocumentSequence" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteRequest" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteRequestPhoto" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceCatalog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ServiceTaxRule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Quote" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "QuoteItem" ENABLE ROW LEVEL SECURITY;
