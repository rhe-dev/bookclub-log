import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

/** 운영자 전이 — 단계 진행만. 사유(reason)는 주문자 요청 전이 전용이라 받지 않는다 (D-025) */
export class AdminTransitionOrderDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus, { message: ErrorCode.ORDER_STATUS_INVALID })
  toStatus: OrderStatus;
}
