import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { PageMetaResponse } from '../../../../shared/dto/page-meta.response';
import { OrderResponse } from '../../../../shared/orders/dto/order.response';

/** 운영자 화면용 주문 — 지금 진행 가능한 다음 단계를 서버가 계산해 내려준다 */
export class AdminOrderResponse extends OrderResponse {
  @ApiProperty({ enum: OrderStatus, isArray: true })
  nextStatuses: OrderStatus[];

  /** --- 제작처 연동 (운영자 전용, D-034) --- */
  @ApiProperty({ nullable: true })
  vendorOrderUid: string | null;

  /** 벤더 orderStatus 원본 — 분기는 이 값으로 */
  @ApiProperty({ nullable: true })
  vendorStatus: string | null;

  /** 벤더가 주는 한글 표시 문자열 */
  @ApiProperty({ nullable: true })
  vendorStatusDisplay: string | null;

  @ApiProperty({ nullable: true })
  vendorStatusAt: Date | null;
}

export class PaginatedAdminOrdersResponse {
  items: AdminOrderResponse[];
  meta: PageMetaResponse;
}
