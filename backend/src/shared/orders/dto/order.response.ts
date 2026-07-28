import { ApiProperty } from '@nestjs/swagger';
import { ActorType, OrderIssueReason, OrderStatus } from '@prisma/client';
import { MemberSummaryResponse } from '../../dto/member-summary.response';
import { PageMetaResponse } from '../../dto/page-meta.response';

/** 주문이 속한 클럽 — 여러 클럽의 주문이 섞이는 마이페이지 구분용 */
export class OrderClubSummaryResponse {
  publicId: string;
  name: string;
}

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

  /** 환불·재제작 요청 전이에만 기록되는 사유 */
  @ApiProperty({ enum: OrderIssueReason, nullable: true })
  reason: OrderIssueReason | null;

  reasonDetail: string | null;
}

export class OrderResponse {
  publicId: string;
  title: string;
  copies: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  createdAt: Date;
  club: OrderClubSummaryResponse;
  member: MemberSummaryResponse;
  books: OrderBookSummaryResponse[];
  history: OrderHistoryResponse[];
}

export class PaginatedOrdersResponse {
  items: OrderResponse[];
  meta: PageMetaResponse;
}
