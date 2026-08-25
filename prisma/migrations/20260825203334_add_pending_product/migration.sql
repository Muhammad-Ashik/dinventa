-- CreateEnum
CREATE TYPE "PendingProductStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "PendingProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "status" "PendingProductStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "PendingProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PendingProduct_slug_key" ON "PendingProduct"("slug");

-- CreateIndex
CREATE INDEX "PendingProduct_categoryId_idx" ON "PendingProduct"("categoryId");

-- CreateIndex
CREATE INDEX "PendingProduct_status_idx" ON "PendingProduct"("status");

-- AddForeignKey
ALTER TABLE "PendingProduct" ADD CONSTRAINT "PendingProduct_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
