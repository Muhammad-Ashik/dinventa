-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "realUnitCost" INTEGER,
ADD COLUMN     "sourceOrderedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PendingProduct" ADD COLUMN     "isSubstitute" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "realPrice" INTEGER,
ADD COLUMN     "sourceDomain" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isSubstitute" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastVerifiedAt" TIMESTAMP(3),
ADD COLUMN     "realPrice" INTEGER,
ADD COLUMN     "sourceCheckStatus" TEXT,
ADD COLUMN     "sourceDomain" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- CreateTable
CREATE TABLE "VettedRetailer" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "VettedRetailer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "VettedRetailer_domain_key" ON "VettedRetailer"("domain");

-- CreateIndex
CREATE INDEX "VettedRetailer_categoryId_idx" ON "VettedRetailer"("categoryId");

-- AddForeignKey
ALTER TABLE "VettedRetailer" ADD CONSTRAINT "VettedRetailer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
