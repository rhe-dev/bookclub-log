import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
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

  /** 판형 — 북프린트 카탈로그의 bookSpecUid (검증은 서비스에서 카탈로그 대조) */
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @IsNotEmpty({ message: ErrorCode.PRINT_SPEC_NOT_FOUND })
  bookSpecUid: string;

  /** 문집 표지 색 — 책 표지와 같은 컨벤션 */
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: ErrorCode.ORDER_COVER_COLOR_FORMAT })
  coverColor: string;

  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  @IsNotEmpty({ message: ErrorCode.ORDER_COVER_EMOJI_INVALID })
  @MaxLength(16, { message: ErrorCode.ORDER_COVER_EMOJI_INVALID })
  coverEmoji: string;
}
