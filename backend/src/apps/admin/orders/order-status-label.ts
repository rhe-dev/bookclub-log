import { OrderIssueReason, OrderStatus } from '@prisma/client';

/** 주문 상태의 사용자 언어 라벨 — 운영자 CSV 출력용 (admin 전용이라 이 앱에 둔다, D-023) */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: '주문 접수',
  CONFIRMED: '주문 확인',
  IN_PRODUCTION: '문집 제작 중',
  PRODUCED: '제작 완료',
  SHIPPED: '배송 시작',
  DELIVERED: '배송 완료',
  PURCHASE_CONFIRMED: '구매 확정',
  CANCELED: '주문 취소',
  REFUND_REQUESTED: '환불 요청',
  REFUNDED: '환불 완료',
  REMAKE_REQUESTED: '재제작 요청',
};

/** 환불·재제작 요청 사유 라벨 — CSV 출력용 (D-025) */
export const ORDER_ISSUE_REASON_LABEL: Record<OrderIssueReason, string> = {
  PRINT_DEFECT: '인쇄 불량',
  BINDING_DEFECT: '제본 불량',
  DAMAGED_IN_TRANSIT: '배송 중 파손',
  WRONG_CONTENT: '주문과 다른 제작',
  OTHER: '기타',
};
