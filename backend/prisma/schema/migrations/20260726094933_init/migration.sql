-- CreateEnum
CREATE TYPE "BookStatus" AS ENUM ('UPCOMING', 'READING', 'DONE');

-- CreateEnum
CREATE TYPE "ClubRole" AS ENUM ('LEADER', 'MEMBER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('RECEIVED', 'CONFIRMED', 'IN_PRODUCTION', 'PRODUCED', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'PURCHASE_CONFIRMED', 'CANCELED', 'REFUND_REQUESTED', 'REFUNDED', 'REMAKE_REQUESTED');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Book" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "clubId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publisher" TEXT,
    "coverColor" TEXT NOT NULL,
    "coverEmoji" TEXT NOT NULL,
    "meetingDate" TIMESTAMP(3),
    "periodFrom" TIMESTAMP(3),
    "periodTo" TIMESTAMP(3),
    "status" "BookStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Book_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookParticipant" (
    "bookId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,

    CONSTRAINT "BookParticipant_pkey" PRIMARY KEY ("bookId","memberId")
);

-- CreateTable
CREATE TABLE "Club" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClubMember" (
    "clubId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "role" "ClubRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("clubId","memberId")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "bookId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "page" INTEGER,
    "quote" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarEmoji" TEXT NOT NULL,
    "color" TEXT NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "publicId" TEXT NOT NULL,
    "clubId" INTEGER NOT NULL,
    "memberId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "copies" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'RECEIVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderBook" (
    "orderId" INTEGER NOT NULL,
    "bookId" INTEGER NOT NULL,

    CONSTRAINT "OrderBook_pkey" PRIMARY KEY ("orderId","bookId")
);

-- CreateTable
CREATE TABLE "OrderStatusHistory" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "fromStatus" "OrderStatus",
    "toStatus" "OrderStatus" NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actor" "ActorType" NOT NULL,

    CONSTRAINT "OrderStatusHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Book_publicId_key" ON "Book"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Club_publicId_key" ON "Club"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Club_inviteCode_key" ON "Club"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "Comment_publicId_key" ON "Comment"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Member_publicId_key" ON "Member"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_publicId_key" ON "Order"("publicId");

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookParticipant" ADD CONSTRAINT "BookParticipant_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookParticipant" ADD CONSTRAINT "BookParticipant_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBook" ADD CONSTRAINT "OrderBook_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderBook" ADD CONSTRAINT "OrderBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderStatusHistory" ADD CONSTRAINT "OrderStatusHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
