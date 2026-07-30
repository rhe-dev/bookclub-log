import { ActorType, OrderStatus } from '@prisma/client';
import { VENDOR_STATUS_DISPLAY } from '../../../shared/bookprint/vendor-contract';
import { getAvailableTransitions } from '../../../shared/orders/order-transitions';
import {
  type OrderWithRelations,
  toOrderDto,
} from '../../../shared/orders/order.mapper';

/**
 * 운영자 응답에 '지금 진행 가능한 다음 단계'를 붙인다 —
 * 화면이 전이 맵을 복제하지 않도록 서버가 알려주는 값 (D-031).
 */
export const withNextStatuses = <T extends { status: OrderStatus }>(
  order: T,
) => ({
  ...order,
  nextStatuses: getAvailableTransitions(order.status, ActorType.ADMIN),
});

/**
 * 제작처 연동 정보 — 운영자에게만 노출한다 (D-034).
 * 최종 사용자에게 '결제완료·PDF준비완료' 같은 벤더 용어는 의미가 없다.
 */
export const toVendorInfo = (order: OrderWithRelations) => ({
  vendorOrderUid: order.vendorOrderUid,
  vendorStatus: order.vendorStatus,
  vendorStatusDisplay: order.vendorStatus
    ? (VENDOR_STATUS_DISPLAY[
        order.vendorStatus as keyof typeof VENDOR_STATUS_DISPLAY
      ] ?? order.vendorStatus)
    : null,
  vendorStatusAt: order.vendorStatusAt,
});

/** 운영자 응답 = 서비스 응답 + 다음 단계 + 제작처 연동 정보 */
export const toAdminOrderDto = (order: OrderWithRelations) => ({
  ...withNextStatuses(toOrderDto(order)),
  ...toVendorInfo(order),
});
