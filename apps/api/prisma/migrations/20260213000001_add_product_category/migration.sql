-- Add ProductCategory and optional relation from Product

CREATE TABLE "ProductCategory" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,

  CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductCategory_tenantId_idx" ON "ProductCategory"("tenantId");
CREATE UNIQUE INDEX "ProductCategory_tenantId_name_key" ON "ProductCategory"("tenantId","name");

ALTER TABLE "Product"
ADD COLUMN "productCategoryId" TEXT;

CREATE INDEX "Product_tenantId_productCategoryId_idx" ON "Product"("tenantId","productCategoryId");

ALTER TABLE "ProductCategory"
ADD CONSTRAINT "ProductCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Product"
ADD CONSTRAINT "Product_productCategoryId_fkey" FOREIGN KEY ("productCategoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
