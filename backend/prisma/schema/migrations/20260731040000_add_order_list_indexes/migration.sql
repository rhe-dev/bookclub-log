-- 운영자 주문 목록의 실제 조회 형태에 맞춘 인덱스
CREATE INDEX "Order_createdAt_idx" ON "Order"("createdAt");
CREATE INDEX "Order_clubId_status_idx" ON "Order"("clubId", "status");
