import type { components } from './api.generated';

/** 주문 — 목록·상세·전이 응답 공통 */
export type Order = components['schemas']['OrderResponse'];

export type OrderStatus = Order['status'];

/** 상태 전이 이력 1건 */
export type OrderHistoryEntry = components['schemas']['OrderHistoryResponse'];

/** 환불·재제작 요청 사유 */
export type OrderIssueReason = NonNullable<OrderHistoryEntry['reason']>;

/** 주문에 수록된 책 요약 */
export type OrderBookSummary =
  components['schemas']['OrderBookSummaryResponse'];

/** POST /clubs/:id/orders 바디 */
export type CreateOrderBody = components['schemas']['CreateOrderDto'];

/** POST /orders/:id/transition · /admin/orders/:id/transition 바디 */
export type TransitionOrderBody = components['schemas']['TransitionOrderDto'];
