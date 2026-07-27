import { OrderStatus } from '@prisma/client';

/** 주문 상태의 사용자 언어 라벨 — CSV 등 서버 출력용 */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: '주문 접수',
  CONFIRMED: '주문 확인',
  IN_PRODUCTION: '문집 제작 중',
  PRODUCED: '제작 완료',
  SHIPPED: '배송 시작',
  IN_TRANSIT: '배송 중',
  DELIVERED: '배송 완료',
  PURCHASE_CONFIRMED: '구매 확정',
  CANCELED: '주문 취소',
  REFUND_REQUESTED: '환불 요청',
  REFUNDED: '환불 완료',
  REMAKE_REQUESTED: '재제작 요청',
};
