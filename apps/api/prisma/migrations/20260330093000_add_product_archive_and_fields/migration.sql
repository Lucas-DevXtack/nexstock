ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "lowStockThreshold" DECIMAL(14,3),
  ADD COLUMN IF NOT EXISTS "sellPrice" DECIMAL(14,4),
  ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "archivedAt" TIMESTAMP(3);

UPDATE "Product"
SET "lowStockThreshold" = COALESCE("lowStockThreshold", "lowStock")
WHERE "lowStock" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "Product_tenantId_isActive_idx" ON "Product"("tenantId", "isActive");
