-- CreateIndex
CREATE INDEX "Book_clubId_status_idx" ON "Book"("clubId", "status");

-- CreateIndex
CREATE INDEX "Comment_memberId_createdAt_idx" ON "Comment"("memberId", "createdAt");

-- CreateIndex
CREATE INDEX "Comment_bookId_parentId_idx" ON "Comment"("bookId", "parentId");

-- CreateIndex
CREATE INDEX "Order_memberId_idx" ON "Order"("memberId");
