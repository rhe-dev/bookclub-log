/**
 * 예상 수령일 산출 — 문서의 제작·배송 SLA를 그대로 옮긴다 (PLAN §5-1 (6)).
 *
 *   제작(CONFIRMED → PRODUCTION_COMPLETE): 3~4 영업일 (공휴일 제외)
 *   배송(SHIPPED → DELIVERED): 1~2일 (한진택배)
 *
 * 공휴일은 반영하지 않는다 — 외부 달력 의존 없이 주말만 건너뛴다.
 * 그래서 화면에서는 확정일이 아니라 '쯤'으로 안내한다.
 */

const PRODUCTION_BUSINESS_DAYS_MIN = 3;
const PRODUCTION_BUSINESS_DAYS_MAX = 4;
const SHIPPING_DAYS_MIN = 1;
const SHIPPING_DAYS_MAX = 2;

export interface DeliveryEstimate {
  /** 가장 빠른 예상 수령일 */
  earliest: Date;
  /** 가장 늦은 예상 수령일 */
  latest: Date;
}

const addDays = (base: Date, days: number): Date => {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
};

/** 주말을 건너뛰며 영업일을 더한다 */
function addBusinessDays(base: Date, days: number): Date {
  let result = new Date(base);
  let remaining = days;
  while (remaining > 0) {
    result = addDays(result, 1);
    const day = result.getDay();
    if (day !== 0 && day !== 6) remaining -= 1;
  }
  return result;
}

/**
 * 기준 시점부터의 예상 수령일 범위.
 * 주문 직후에는 주문일이, 제작이 시작된 뒤에는 그 시점이 기준이 되어 안내가 좁혀진다.
 */
export function estimateDelivery(from: Date): DeliveryEstimate {
  return {
    earliest: addDays(
      addBusinessDays(from, PRODUCTION_BUSINESS_DAYS_MIN),
      SHIPPING_DAYS_MIN,
    ),
    latest: addDays(
      addBusinessDays(from, PRODUCTION_BUSINESS_DAYS_MAX),
      SHIPPING_DAYS_MAX,
    ),
  };
}
