import { ApiProperty } from '@nestjs/swagger';
import type { IneligibleReason } from '../../../../shared/bookprint/spec-eligibility';

/** 분량 내역 — "왜 이 쪽수인지"를 화면에서 그대로 설명할 수 있게 */
export class PageBreakdownResponse {
  /** 속표지·모임 소개·목차 */
  frontMatter: number;
  /** 책마다 들어가는 표제지·책 정보 */
  bookHeaders: number;
  /** 코멘트 쪽수 */
  comments: number;
  /** 참여자 명단·맺음말 */
  backMatter: number;
}

/** 판형 하나의 제작 가능 여부와 금액 */
export class BookSpecOptionResponse {
  bookSpecUid: string;
  name: string;
  innerTrimWidthMm: number;
  innerTrimHeightMm: number;
  pageMin: number;
  pageMax: number;
  pageIncrement: number;

  @ApiProperty({ enum: ['SOFTCOVER', 'HARDCOVER'] })
  coverType: string;

  @ApiProperty({ enum: ['PUR', 'LAYFLAT'] })
  bindingType: string;

  priceBase: number;
  pricePerIncrement: number;
  description: string;

  /** 이 분량으로 이 판형을 만들 수 있는지 */
  eligible: boolean;

  /** 불가 사유 — 화면이 "왜 못 고르는지"를 안내하는 근거 */
  @ApiProperty({
    enum: ['PAGE_MIN', 'PAGE_MAX', 'PAGE_INCREMENT'],
    nullable: true,
  })
  ineligibleReason: IneligibleReason | null;

  /** 그 규칙의 기준값 (최소 쪽수 등) */
  @ApiProperty({ nullable: true })
  requiredValue: number | null;

  unitPrice: number;
  productAmount: number;
  shippingFee: number;
  totalAmount: number;
}

/** 예상 수령일 범위 — 제작 3~4영업일 + 배송 1~2일 (공휴일 미반영) */
export class DeliveryEstimateResponse {
  earliest: Date;
  latest: Date;
}

export class OrderEstimateResponse {
  /** 벤더에 고지할 내지 쪽수 — 항상 짝수 */
  pageCount: number;
  /** 짝수 보정으로 들어간 여백면 */
  blankPages: number;
  breakdown: PageBreakdownResponse;
  /** 어떤 판형으로도 만들 수 없는 분량이면 false */
  printable: boolean;
  specs: BookSpecOptionResponse[];
  shippingFee: number;
  delivery: DeliveryEstimateResponse;
}
