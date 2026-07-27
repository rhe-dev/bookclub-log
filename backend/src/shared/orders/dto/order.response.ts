import { ApiProperty } from '@nestjs/swagger';
import { ActorType, OrderStatus } from '@prisma/client';
import { MemberSummaryResponse } from '../../dto/member-summary.response';
import { PageMetaResponse } from '../../dto/page-meta.response';

export class OrderBookSummaryResponse {
  publicId: string;
  title: string;
  author: string;
  coverColor: string;
  coverEmoji: string;
}

/** 상태 전이 이력 1건 — 마이페이지·관리자의 단계별 날짜 표시용 */
export class OrderHistoryResponse {
  @ApiProperty({ enum: OrderStatus, nullable: true })
  fromStatus: OrderStatus | null;

  @ApiProperty({ enum: OrderStatus })
  toStatus: OrderStatus;

  changedAt: Date;

  @ApiProperty({ enum: ActorType })
  actor: ActorType;
}

export class OrderResponse {
  publicId: string;
  title: string;
  copies: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  createdAt: Date;
  member: MemberSummaryResponse;
  books: OrderBookSummaryResponse[];
  history: OrderHistoryResponse[];
}

export class PaginatedOrdersResponse {
  items: OrderResponse[];
  meta: PageMetaResponse;
}
