-- CreateEnum
CREATE TYPE "OrderIssueReason" AS ENUM ('PRINT_DEFECT', 'BINDING_DEFECT', 'DAMAGED_IN_TRANSIT', 'WRONG_CONTENT', 'OTHER');

-- AlterTable
ALTER TABLE "OrderStatusHistory" ADD COLUMN     "reason" "OrderIssueReason",
ADD COLUMN     "reasonDetail" TEXT;
