import { ApiProperty } from '@nestjs/swagger';
import { OrderIssueReason, OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

export class TransitionOrderDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus, { message: ErrorCode.ORDER_STATUS_INVALID })
  toStatus: OrderStatus;

  /** 환불·재제작 요청 전이에만 사용 — 그 외 전이에서는 무시 */
  @ApiProperty({ enum: OrderIssueReason, required: false })
  @IsOptional()
  @IsEnum(OrderIssueReason, { message: ErrorCode.ORDER_REASON_INVALID })
  reason?: OrderIssueReason;

  /** 사유 상세 — reason이 OTHER면 필수 */
  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @MaxLength(500, { message: ErrorCode.ORDER_REASON_DETAIL_MAX })
  reasonDetail?: string;
}
