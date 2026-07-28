import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

export class CreateOrderDto {
  /** 문집 제목 */
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @IsNotEmpty({ message: ErrorCode.ORDER_TITLE_REQUIRED })
  @MaxLength(100, { message: ErrorCode.ORDER_TITLE_MAX })
  title: string;

  /** 인쇄 부수 */
  @IsInt({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @Min(1, { message: ErrorCode.ORDER_COPIES_MIN })
  @Max(100, { message: ErrorCode.ORDER_COPIES_MAX })
  copies: number;

  /** 수록할 책 publicId 목록 */
  @IsArray({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @ArrayNotEmpty({ message: ErrorCode.ORDER_BOOKS_REQUIRED })
  @IsString({
    each: true,
    message: `${ErrorCode.COMMON_INVALID_INPUT}|$property`,
  })
  bookIds: string[];
}
