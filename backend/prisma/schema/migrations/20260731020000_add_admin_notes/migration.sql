-- 회원·클럽 운영자 메모 + 회원 가입일 (D-030 개정 — 상태 전환 없이 조회 + 메모)
ALTER TABLE "Member"
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "adminNote" TEXT;

ALTER TABLE "Club" ADD COLUMN "adminNote" TEXT;
