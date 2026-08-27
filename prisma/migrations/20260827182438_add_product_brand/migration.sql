-- AlterTable
ALTER TABLE "PendingProduct" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'Generic';

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "brand" TEXT NOT NULL DEFAULT 'Generic';

-- CreateIndex
CREATE INDEX "Product_brand_idx" ON "Product"("brand");
