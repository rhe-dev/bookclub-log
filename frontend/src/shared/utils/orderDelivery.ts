import type { Order } from '@/shared/types/order';

/** 제작 3~4 영업일 + 배송 1~2일 — 제작처 SLA (PLAN §5-1) */
const PRODUCTION_BUSINESS_DAYS_MIN = 3;
const PRODUCTION_BUSINESS_DAYS_MAX = 4;
const SHIPPING_DAYS_MIN = 1;
const SHIPPING_DAYS_MAX = 2;

const addDays = (base: Date, days: number) => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

const addBusinessDays = (base: Date, days: number) => {
  let result = new Date(base);
  let remaining = days;
  while (remaining > 0) {
    result = addDays(result, 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return result;
};

const monthDay = (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`;

/**
 * 지금 단계에서 주문자에게 건넬 한 줄 — 진행 중에는 '언제 받는지', 받은 뒤에는 '무엇을 하면 되는지'.
 *
 * 상태가 진행될수록 기준 시점이 뒤로 옮겨가 안내가 좁혀진다 — 접수 직후에는 제작+배송
 * 전체를, 발송 뒤에는 배송만 계산한다. 공휴일은 반영하지 않아 '쯤'으로만 말한다.
 */
export const describeOrderGuide = (order: Order): string | null => {
  const changedAt = new Date(order.statusChangedAt);

  switch (order.status) {
    case 'RECEIVED':
    case 'CONFIRMED':
    case 'IN_PRODUCTION': {
      const from = addDays(
        addBusinessDays(changedAt, PRODUCTION_BUSINESS_DAYS_MIN),
        SHIPPING_DAYS_MIN,
      );
      const to = addDays(
        addBusinessDays(changedAt, PRODUCTION_BUSINESS_DAYS_MAX),
        SHIPPING_DAYS_MAX,
      );
      return `${monthDay(from)}~${monthDay(to)}쯤 받아보실 수 있어요`;
    }
    case 'PRODUCED':
      return '곧 발송될 예정이에요';
    case 'SHIPPED': {
      const from = addDays(changedAt, SHIPPING_DAYS_MIN);
      const to = addDays(changedAt, SHIPPING_DAYS_MAX);
      return `${monthDay(from)}~${monthDay(to)}쯤 도착할 예정이에요`;
    }
    /*
     * 배송 완료는 안내가 끝나는 지점이 아니라 주문자가 판단해야 하는 유일한 분기점이다.
     * 여기서 말을 끊으면 버튼 세 개(구매 확정·환불·재제작)만 남아 무엇을 골라야 할지
     * 알 수 없다 — 기본 행동을 먼저 알리고 예외를 덧붙인다.
     */
    case 'DELIVERED':
      return '받으신 문집을 확인하고 구매를 확정해 주세요. 하자가 있다면 환불·재제작을 요청할 수 있어요';
    case 'REFUND_REQUESTED':
      return '운영자가 확인한 뒤 환불이 처리돼요';
    case 'REMAKE_REQUESTED':
      return '운영자가 확인하면 같은 내용으로 다시 제작돼요';
    default:
      return null;
  }
};
