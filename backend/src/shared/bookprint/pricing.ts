import { type BookSpec, SHIPPING_FEE } from './book-specs';

/**
 * 제작비 산출 — 문서의 가격 공식을 그대로 옮긴다 (PLAN §5-1 (6)).
 *
 *   단가 = priceBase + ((pageCount - pageMin) / pageIncrement) × pricePerIncrement
 *   총액 = 단가 × 부수 + 배송비(주문당 1회)
 *
 * 결제 수단·정산은 만들지 않는다(안내문 제외 대상). 사용자가 부수를 정할 때 판단 근거로만 쓴다.
 * 금액은 원 단위 정수로 다룬다 — 벤더 응답은 소수를 포함하지만 KRW는 소수점이 없다.
 */
export interface Quote {
  /** 1부 가격 */
  unitPrice: number;
  /** 단가 × 부수 */
  productAmount: number;
  shippingFee: number;
  totalAmount: number;
}

export function quoteOrder(
  spec: BookSpec,
  pageCount: number,
  copies: number,
): Quote {
  const increments = Math.max(
    0,
    Math.ceil((pageCount - spec.pageMin) / spec.pageIncrement),
  );
  const unitPrice = spec.priceBase + increments * spec.pricePerIncrement;
  const productAmount = unitPrice * copies;

  return {
    unitPrice,
    productAmount,
    shippingFee: SHIPPING_FEE,
    totalAmount: productAmount + SHIPPING_FEE,
  };
}
