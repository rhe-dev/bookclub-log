-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "statusChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Order_statusChangedAt_idx" ON "Order"("statusChangedAt");
