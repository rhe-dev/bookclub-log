-- 북프린트 판형·견적·연동 필드 추가 (D-033·D-034)

-- 1) 배송중 단계 제거 — 벤더는 SHIPPED → DELIVERED뿐이라 대응이 없다
UPDATE "Order" SET "status" = 'DELIVERED' WHERE "status" = 'IN_TRANSIT';
UPDATE "OrderStatusHistory" SET "toStatus" = 'DELIVERED' WHERE "toStatus" = 'IN_TRANSIT';
UPDATE "OrderStatusHistory" SET "fromStatus" = 'DELIVERED' WHERE "fromStatus" = 'IN_TRANSIT';

ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'CONFIRMED', 'IN_PRODUCTION', 'PRODUCED', 'SHIPPED', 'DELIVERED', 'PURCHASE_CONFIRMED', 'CANCELED', 'REFUND_REQUESTED', 'REFUNDED', 'REMAKE_REQUESTED');
ALTER TABLE "Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus" USING ("status"::text::"OrderStatus");
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'RECEIVED';
ALTER TABLE "OrderStatusHistory" ALTER COLUMN "toStatus" TYPE "OrderStatus" USING ("toStatus"::text::"OrderStatus");
ALTER TABLE "OrderStatusHistory" ALTER COLUMN "fromStatus" TYPE "OrderStatus" USING ("fromStatus"::text::"OrderStatus");
DROP TYPE "OrderStatus_old";

-- 2) 제작·배송 단계는 제작처 웹훅으로 들어온다
ALTER TYPE "ActorType" ADD VALUE 'VENDOR';

-- 3) 제작 사양·견적 스냅샷 — 기존 행은 기본 판형으로 채운 뒤 기본값을 뗀다
ALTER TABLE "Order"
  ADD COLUMN "bookSpecUid" TEXT NOT NULL DEFAULT 'SQUAREBOOK_HC',
  ADD COLUMN "coverColor" TEXT NOT NULL DEFAULT '#4A6FA5',
  ADD COLUMN "coverEmoji" TEXT NOT NULL DEFAULT '📚',
  ADD COLUMN "pageCount" INTEGER NOT NULL DEFAULT 24,
  ADD COLUMN "unitPrice" INTEGER NOT NULL DEFAULT 19800,
  ADD COLUMN "productAmount" INTEGER NOT NULL DEFAULT 19800,
  ADD COLUMN "shippingFee" INTEGER NOT NULL DEFAULT 3000;

ALTER TABLE "Order"
  ALTER COLUMN "bookSpecUid" DROP DEFAULT,
  ALTER COLUMN "coverColor" DROP DEFAULT,
  ALTER COLUMN "coverEmoji" DROP DEFAULT,
  ALTER COLUMN "pageCount" DROP DEFAULT,
  ALTER COLUMN "unitPrice" DROP DEFAULT,
  ALTER COLUMN "productAmount" DROP DEFAULT,
  ALTER COLUMN "shippingFee" DROP DEFAULT;

-- 4) 북프린트 연동 — 발주 이후에만 채워진다
ALTER TABLE "Order"
  ADD COLUMN "vendorOrderUid" TEXT,
  ADD COLUMN "vendorStatus" TEXT,
  ADD COLUMN "vendorStatusAt" TIMESTAMP(3),
  ADD COLUMN "trackingCarrier" TEXT,
  ADD COLUMN "trackingNumber" TEXT;

CREATE UNIQUE INDEX "Order_vendorOrderUid_key" ON "Order"("vendorOrderUid");
