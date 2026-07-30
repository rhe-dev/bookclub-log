import type { components } from './api.generated';

/** 주문 — 목록·상세·전이 응답 공통 */
export type Order = components['schemas']['OrderResponse'];

export type OrderStatus = Order['status'];

/** 운영자 화면용 주문 — 진행 가능한 다음 단계 포함 */
export type AdminOrder = components['schemas']['AdminOrderResponse'];

/** 상태 전이 이력 1건 */
export type OrderHistoryEntry = components['schemas']['OrderHistoryResponse'];

/** 환불·재제작 요청 사유 */
export type OrderIssueReason = NonNullable<OrderHistoryEntry['reason']>;

/** POST /clubs/:id/orders 바디 */
export type CreateOrderBody = components['schemas']['CreateOrderDto'];

/** POST /orders/:id/transition · /admin/orders/:id/transition 바디 */
export type TransitionOrderBody = components['schemas']['TransitionOrderDto'];

/** 문집 견적 — 분량·판형별 제작 가능 여부·금액·예상 수령일 (D-035) */
export type OrderEstimate = components['schemas']['OrderEstimateResponse'];

/** 견적에 담긴 판형 하나 */
export type BookSpecOption = components['schemas']['BookSpecOptionResponse'];

/** 판형 규칙 위반 사유 */
export type IneligibleReason = NonNullable<BookSpecOption['ineligibleReason']>;

/** POST /clubs/:id/orders/estimate 바디 */
export type EstimateOrderBody = components['schemas']['EstimateOrderDto'];

/** 발주 전 사양 재확인 결과 (운영자 전용) */
export type OrderProductionCheck =
  components['schemas']['AdminProductionCheckResponse'];

/** 운영자가 흘려보낼 수 있는 제작처 이벤트 */
export type VendorEvent = components['schemas']['AdminVendorEventDto']['event'];

/** 제작처 이벤트 수신 1건 */
export type VendorEventLog = components['schemas']['VendorEventLogResponse'];
