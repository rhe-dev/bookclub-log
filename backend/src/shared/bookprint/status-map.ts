import { OrderStatus } from '@prisma/client';
import type { VendorOrderStatus, VendorWebhookEvent } from './vendor-contract';

/**
 * 벤더 상태 ↔ 우리 상태 매핑 — 단일 소스 (D-034).
 *
 * 최종 사용자에게 "결제완료 / PDF준비완료"는 의미가 없다. 우리 상태는 사용자 언어로 두고,
 * 벤더 상태는 `Order.vendorStatus`에 그대로 보관해 어드민에서만 노출한다.
 * 여러 벤더 상태가 우리 한 단계(문집 제작)로 접히는 구간이 있다.
 */
const VENDOR_TO_ORDER_STATUS: Record<VendorOrderStatus, OrderStatus | null> = {
  // 발주 직후 구간 — 우리는 전부 '문집 제작'으로 묶어 보여준다
  PAID: OrderStatus.IN_PRODUCTION,
  PDF_READY: OrderStatus.IN_PRODUCTION,
  CONFIRMED: OrderStatus.IN_PRODUCTION,
  IN_PRODUCTION: OrderStatus.IN_PRODUCTION,
  PRODUCTION_COMPLETE: OrderStatus.PRODUCED,
  SHIPPED: OrderStatus.SHIPPED,
  DELIVERED: OrderStatus.DELIVERED,
  CANCELLED: OrderStatus.CANCELED,
  CANCELLED_REFUND: OrderStatus.CANCELED,
  // 벤더 측 오류는 우리 상태를 바꾸지 않는다 — 운영자가 연동 패널에서 판단한다
  ERROR: null,
};

/** 웹훅 이벤트가 알려주는 벤더 상태 */
const WEBHOOK_TO_VENDOR_STATUS: Record<VendorWebhookEvent, VendorOrderStatus> =
  {
    'order.created': 'PAID',
    'production.confirmed': 'CONFIRMED',
    'production.started': 'IN_PRODUCTION',
    'production.completed': 'PRODUCTION_COMPLETE',
    'shipping.departed': 'SHIPPED',
    'shipping.delivered': 'DELIVERED',
    'order.cancelled': 'CANCELLED_REFUND',
  };

/**
 * 웹훅 수신 시 우리 상태를 어디로 옮길지.
 * null이면 벤더 상태만 갱신하고 우리 상태는 그대로 둔다 — 예: 제작 확정·제작 시작은
 * 이미 '문집 제작'이라 사용자에게 보이는 변화가 없다.
 */
export function resolveStatusFromWebhook(
  event: VendorWebhookEvent,
  current: OrderStatus,
): { vendorStatus: VendorOrderStatus; nextStatus: OrderStatus | null } {
  const vendorStatus = WEBHOOK_TO_VENDOR_STATUS[event];
  const mapped = VENDOR_TO_ORDER_STATUS[vendorStatus];
  return {
    vendorStatus,
    nextStatus: mapped && mapped !== current ? mapped : null,
  };
}
