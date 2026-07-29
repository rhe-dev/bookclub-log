import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { PageMetaResponse } from '../../../../shared/dto/page-meta.response';
import { OrderResponse } from '../../../../shared/orders/dto/order.response';

/** 운영자 화면용 주문 — 지금 진행 가능한 다음 단계를 서버가 계산해 내려준다 */
export class AdminOrderResponse extends OrderResponse {
  @ApiProperty({ enum: OrderStatus, isArray: true })
  nextStatuses: OrderStatus[];
}

export class PaginatedAdminOrdersResponse {
  items: AdminOrderResponse[];
  meta: PageMetaResponse;
}
