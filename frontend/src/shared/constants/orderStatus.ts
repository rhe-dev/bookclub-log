import { colorChips } from '@/shared/styles/colors';
import type { OrderStatus } from '@/shared/types/order';

/** 주문 상태의 사용자 언어 라벨 (QA 루브릭 ② — 코드가 아니라 사용자 말로) */
export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEIVED: '접수됐어요',
  CONFIRMED: '주문을 확인했어요',
  IN_PRODUCTION: '문집을 만들고 있어요',
  PRODUCED: '제작이 끝났어요',
  SHIPPED: '배송을 시작했어요',
  IN_TRANSIT: '배송 중이에요',
  DELIVERED: '배송이 완료됐어요',
  PURCHASE_CONFIRMED: '구매를 확정했어요',
  CANCELED: '주문이 취소됐어요',
  REFUND_REQUESTED: '환불을 접수했어요',
  REFUNDED: '환불이 완료됐어요',
  REMAKE_REQUESTED: '재제작을 접수했어요',
};

/** 진행 이력·관리자용 명사형 라벨 — 타임라인은 짧은 명사형이 훑기 좋다 */
export const ORDER_STATUS_LOG_LABEL: Record<OrderStatus, string> = {
  RECEIVED: '주문 접수',
  CONFIRMED: '주문 확인',
  IN_PRODUCTION: '제작 시작',
  PRODUCED: '제작 완료',
  SHIPPED: '배송 시작',
  IN_TRANSIT: '배송 중',
  DELIVERED: '배송 완료',
  PURCHASE_CONFIRMED: '구매 확정',
  CANCELED: '주문 취소',
  REFUND_REQUESTED: '환불 접수',
  REFUNDED: '환불 완료',
  REMAKE_REQUESTED: '재제작 접수',
};

/** 8단계를 사용자 눈높이의 4그룹으로 묶은 진행 스텝 */
export const ORDER_STEP_GROUPS = ['접수', '제작', '배송', '완료'] as const;

const STEP_INDEX_BY_STATUS: Partial<Record<OrderStatus, number>> = {
  RECEIVED: 0,
  CONFIRMED: 0,
  IN_PRODUCTION: 1,
  PRODUCED: 1,
  // 재제작 승인 후 제작 재진입까지 제작 그룹으로 표시
  REMAKE_REQUESTED: 1,
  SHIPPED: 2,
  IN_TRANSIT: 2,
  DELIVERED: 3,
  PURCHASE_CONFIRMED: 3,
};

/** 진행 스텝 인덱스 — 취소·환불 등 스텝 밖 상태는 null */
export const getOrderStepIndex = (status: OrderStatus): number | null =>
  STEP_INDEX_BY_STATUS[status] ?? null;

/** 상태 칩 색 — 진행형(파랑)·완료(초록)·취소(회색)·환불/재제작(테라코타) */
export const ORDER_STATUS_CHIP: Record<
  OrderStatus,
  { bg: string; text: string }
> = {
  RECEIVED: { bg: colorChips.primary[100], text: colorChips.primary[700] },
  CONFIRMED: { bg: colorChips.primary[100], text: colorChips.primary[700] },
  IN_PRODUCTION: { bg: colorChips.primary[100], text: colorChips.primary[700] },
  PRODUCED: { bg: colorChips.primary[100], text: colorChips.primary[700] },
  SHIPPED: { bg: colorChips.primary[100], text: colorChips.primary[700] },
  IN_TRANSIT: { bg: colorChips.primary[100], text: colorChips.primary[700] },
  DELIVERED: { bg: colorChips.primary[100], text: colorChips.primary[700] },
  PURCHASE_CONFIRMED: { bg: '#E3F2E8', text: colorChips.system.success },
  CANCELED: {
    bg: colorChips.grayScale[200],
    text: colorChips.grayScale[600],
  },
  REFUND_REQUESTED: {
    bg: colorChips.secondary[100],
    text: colorChips.secondary[700],
  },
  REFUNDED: {
    bg: colorChips.secondary[100],
    text: colorChips.secondary[700],
  },
  REMAKE_REQUESTED: {
    bg: colorChips.secondary[100],
    text: colorChips.secondary[700],
  },
};
