import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import type { VendorWebhookEvent } from '../../../../shared/bookprint/vendor-contract';
import { ErrorCode } from '../../../../shared/constants/error-code';

/** 발주 요청 — 운영자 메모는 이력에 함께 남는다 (D-031) */
export class AdminDispatchDto {
  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @MaxLength(300, { message: ErrorCode.ORDER_ADMIN_NOTE_MAX })
  adminNote?: string;
}

/** 운영자가 흘려보낼 수 있는 제작처 이벤트 — 발주(order.created) 이후 단계만 */
const RECEIVABLE_EVENTS: VendorWebhookEvent[] = [
  'production.confirmed',
  'production.started',
  'production.completed',
  'shipping.departed',
  'shipping.delivered',
];

export class AdminVendorEventDto {
  @ApiProperty({ enum: RECEIVABLE_EVENTS })
  @IsIn(RECEIVABLE_EVENTS, { message: ErrorCode.PRINT_WEBHOOK_EVENT_INVALID })
  event: VendorWebhookEvent;
}
