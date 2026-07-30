-- 제작처 이벤트 수신 로그 (D-034)
CREATE TABLE "OrderVendorEvent" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "event" TEXT NOT NULL,
    "vendorStatus" TEXT NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "detail" TEXT,

    CONSTRAINT "OrderVendorEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "OrderVendorEvent_orderId_receivedAt_idx" ON "OrderVendorEvent"("orderId", "receivedAt");

ALTER TABLE "OrderVendorEvent" ADD CONSTRAINT "OrderVendorEvent_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
