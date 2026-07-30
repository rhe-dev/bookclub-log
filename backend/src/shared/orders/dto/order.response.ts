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

  /** 운영자가 단계 진행 시 남긴 메모 (D-031) */
  adminNote: string | null;
}

/** 주문에 찍힌 판형 — 이름·크기는 카탈로그에서 붙인 값이다 */
export class OrderBookSpecResponse {
  bookSpecUid: string;
  name: string;

  @ApiProperty({ enum: ['SOFTCOVER', 'HARDCOVER'], nullable: true })
  coverType: string | null;

  @ApiProperty({ enum: ['PUR', 'LAYFLAT'], nullable: true })
  bindingType: string | null;

  @ApiProperty({ nullable: true })
  innerTrimWidthMm: number | null;

  @ApiProperty({ nullable: true })
  innerTrimHeightMm: number | null;
}

export class OrderResponse {
  publicId: string;
  title: string;
  copies: number;

  @ApiProperty({ enum: OrderStatus })
  status: OrderStatus;

  createdAt: Date;

  /** 마지막 상태 변경 시각 — 운영자 목록의 '최근 변경' */
  statusChangedAt: Date;

  /** --- 제작 사양 (D-033) --- */
  bookSpec: OrderBookSpecResponse;
  coverColor: string;
  coverEmoji: string;
  /** 주문 시점에 산출한 내지 쪽수 */
  pageCount: number;

  /** --- 견적 스냅샷 (원) --- */
  unitPrice: number;
  productAmount: number;
  shippingFee: number;
  totalAmount: number;

  /** 배송 정보 — 제작처 발송 이벤트로 채워진다 */
  @ApiProperty({ nullable: true })
  trackingCarrier: string | null;

  @ApiProperty({ nullable: true })
  trackingNumber: string | null;

  club: OrderClubSummaryResponse;
  member: MemberSummaryResponse;
  books: OrderBookSummaryResponse[];
  history: OrderHistoryResponse[];
}

export class PaginatedOrdersResponse {
  items: OrderResponse[];
  meta: PageMetaResponse;
}
