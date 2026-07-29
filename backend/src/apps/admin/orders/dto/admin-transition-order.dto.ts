import { ApiProperty } from '@nestjs/swagger';
import { OrderStatus } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

/** 운영자 전이 — 단계 진행만. 사유(reason)는 주문자 요청 전용이라 받지 않는다 (D-025) */
export class AdminTransitionOrderDto {
  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus, { message: ErrorCode.ORDER_STATUS_INVALID })
  toStatus: OrderStatus;

  /** 처리 메모 — 왜 이 시점에 진행했는지 이력에 남긴다 (D-031) */
  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|adminNote` })
  @MaxLength(300, { message: ErrorCode.ORDER_ADMIN_NOTE_MAX })
  adminNote?: string;
}

/** 여러 주문을 같은 단계로 한 번에 진행 */
export class AdminBulkTransitionDto extends AdminTransitionOrderDto {
  @IsArray({ message: `${ErrorCode.COMMON_INVALID_INPUT}|orderIds` })
  @ArrayNotEmpty({ message: ErrorCode.ORDER_BULK_EMPTY })
  @ArrayMaxSize(50, { message: ErrorCode.ORDER_BULK_TOO_MANY })
  @IsString({
    each: true,
    message: `${ErrorCode.COMMON_INVALID_INPUT}|orderIds`,
  })
  orderIds: string[];
}
