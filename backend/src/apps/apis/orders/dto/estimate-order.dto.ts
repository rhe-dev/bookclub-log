import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

/**
 * 문집 견적 요청 — 주문서에서 수록 책이 정해질 때마다 호출한다.
 * 분량·제작 가능 판형·금액·예상 수령일을 한 번에 받아 화면이 계산을 복제하지 않게 한다 (D-035).
 */
export class EstimateOrderDto {
  @IsArray({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @ArrayNotEmpty({ message: ErrorCode.ORDER_BOOKS_REQUIRED })
  @IsString({
    each: true,
    message: `${ErrorCode.COMMON_INVALID_INPUT}|$property`,
  })
  bookIds: string[];

  /** 부수 — 판형별 금액을 부수까지 반영해 보여주기 위해 함께 받는다 */
  @IsInt({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @Min(1, { message: ErrorCode.ORDER_COPIES_MIN })
  @Max(100, { message: ErrorCode.ORDER_COPIES_MAX })
  copies: number;
}
