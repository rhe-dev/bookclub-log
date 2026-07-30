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
 * 지금 단계에서 알려줄 배송 안내 한 줄.
 *
 * 상태가 진행될수록 기준 시점이 뒤로 옮겨가 안내가 좁혀진다 — 접수 직후에는 제작+배송
 * 전체를, 발송 뒤에는 배송만 계산한다. 공휴일은 반영하지 않아 '쯤'으로만 말한다.
 */
export const describeDelivery = (order: Order): string | null => {
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
    default:
      return null;
  }
};
