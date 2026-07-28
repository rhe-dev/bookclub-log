import type { OrderStatus } from '@/shared/types/order';

export type OrderAction = {
  toStatus: OrderStatus;
  label: string;
  confirmTitle: string;
  confirmBody: string;
  successMessage: string;
  buttonColor: 'primary' | 'error' | 'tertiary';
  buttonVariant?: 'filled' | 'outlined';
};

const CANCEL_ACTION: OrderAction = {
  toStatus: 'CANCELED',
  label: '주문 취소',
  confirmTitle: '주문 취소',
  confirmBody: '이 주문을 취소할까요? 제작이 시작되기 전에만 취소할 수 있어요.',
  successMessage: '주문을 취소했어요.',
  buttonColor: 'error',
  buttonVariant: 'outlined',
};

/** 상태별 주문자 액션 — 전이 맵(PLAN §5)의 USER 분기와 1:1 */
export const ACTIONS_BY_STATUS: Partial<Record<OrderStatus, OrderAction[]>> = {
  RECEIVED: [CANCEL_ACTION],
  CONFIRMED: [CANCEL_ACTION],
  DELIVERED: [
    {
      toStatus: 'PURCHASE_CONFIRMED',
      label: '구매 확정',
      confirmTitle: '구매 확정',
      confirmBody: '문집을 잘 받으셨나요? 구매를 확정하면 주문이 마무리돼요.',
      successMessage: '구매를 확정했어요. 함께 읽은 기록이 책이 됐네요!',
      buttonColor: 'primary',
    },
    {
      toStatus: 'REFUND_REQUESTED',
      label: '환불 요청',
      confirmTitle: '환불 요청',
      confirmBody:
        '파본·인쇄 불량 등 하자가 있었나요? 문집은 주문 제작 상품이라 하자가 있을 때만 환불을 접수할 수 있어요.',
      successMessage: '환불을 접수했어요. 운영자 확인 후 처리돼요.',
      buttonColor: 'tertiary',
    },
    {
      toStatus: 'REMAKE_REQUESTED',
      label: '재제작 요청',
      confirmTitle: '재제작 요청',
      confirmBody:
        '파본·인쇄 불량 등 하자가 있었나요? 운영자가 확인하면 같은 내용으로 다시 제작해 드려요.',
      successMessage:
        '재제작을 접수했어요. 운영자 확인 후 제작이 다시 시작돼요.',
      buttonColor: 'tertiary',
    },
  ],
};

/** 환불·재제작 요청은 사유 필수 — 서버 검증과 동일 규칙 */
export const needsReason = (toStatus: OrderStatus) =>
  toStatus === 'REFUND_REQUESTED' || toStatus === 'REMAKE_REQUESTED';

/** 기타 사유 상세 글자수 제한 — 서버 검증과 동일 */
export const OTHER_DETAIL_MIN = 5;
export const OTHER_DETAIL_MAX = 500;
