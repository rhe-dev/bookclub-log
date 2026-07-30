import { ApiProperty } from '@nestjs/swagger';
import type { IneligibleReason } from '../../../../shared/bookprint/spec-eligibility';

/**
 * 발주 전 사양 재확인 (D-035) — 주문 당시 쪽수와 지금 다시 계산한 쪽수를 함께 준다.
 * 주문 뒤 코멘트가 지워지거나 늘면 제작처가 주문을 거부할 수 있어, 그 차이를 운영자가 먼저 본다.
 */
/** 제작처 이벤트 수신 1건 — 실제 웹훅 수신 로그에 해당 */
export class VendorEventLogResponse {
  /** 벤더 이벤트명 (production.confirmed 등) */
  event: string;
  vendorStatus: string;
  vendorStatusDisplay: string;
  receivedAt: Date;

  @ApiProperty({ nullable: true })
  detail: string | null;
}

export class AdminProductionCheckResponse {
  bookSpecUid: string;
  specName: string;

  @ApiProperty({ nullable: true })
  pageMin: number | null;

  @ApiProperty({ nullable: true })
  pageMax: number | null;

  /** 주문 시점에 제작처에 고지하기로 한 쪽수 */
  orderedPageCount: number;

  /** 지금 다시 계산한 쪽수 */
  currentPageCount: number;

  eligible: boolean;

  @ApiProperty({
    enum: ['PAGE_MIN', 'PAGE_MAX', 'PAGE_INCREMENT'],
    nullable: true,
  })
  ineligibleReason: IneligibleReason | null;

  @ApiProperty({ nullable: true })
  requiredValue: number | null;

  /** 발주 가능한 상태인지 — 주문 확인 단계 + 아직 발주 전 */
  canDispatch: boolean;

  @ApiProperty({ nullable: true })
  vendorOrderUid: string | null;

  @ApiProperty({ nullable: true })
  vendorStatus: string | null;

  @ApiProperty({ nullable: true })
  vendorStatusDisplay: string | null;

  @ApiProperty({ nullable: true })
  vendorStatusAt: Date | null;

  @ApiProperty({ nullable: true })
  trackingCarrier: string | null;

  @ApiProperty({ nullable: true })
  trackingNumber: string | null;

  /**
   * 제작처 이벤트 수신 이력.
   * 우리 상태가 바뀌지 않는 이벤트(제작 확정·제작 시작)도 남는다 — 여러 벤더 상태가
   * 우리 한 단계로 접히기 때문에, 이 로그가 없으면 진행이 멈춘 것처럼 보인다 (D-034).
   */
  events: VendorEventLogResponse[];
}
