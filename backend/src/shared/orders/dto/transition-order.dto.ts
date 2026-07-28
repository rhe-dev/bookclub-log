import { ApiProperty } from '@nestjs/swagger';
import { OrderIssueReason, OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ErrorMessage } from '../../constants/error-message';

export class TransitionOrderDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  toStatus: OrderStatus;

  /** 환불·재제작 요청 전이에만 사용 — 그 외 전이에서는 무시 */
  @ApiProperty({ enum: OrderIssueReason, required: false })
  @IsOptional()
  @IsEnum(OrderIssueReason, { message: ErrorMessage.ORDER_REASON_INVALID })
  reason?: OrderIssueReason;

  /** 사유 상세 — reason이 OTHER면 필수 */
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: ErrorMessage.ORDER_REASON_DETAIL_MAX })
  reasonDetail?: string;
}
