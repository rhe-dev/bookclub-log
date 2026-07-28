import { BookStatus } from '@prisma/client';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

export class CreateBookDto {
  @IsString({ message: ErrorCode.COMMON_INVALID_INPUT })
  @IsNotEmpty({ message: ErrorCode.BOOK_TITLE_REQUIRED })
  @MaxLength(200, { message: ErrorCode.BOOK_TITLE_MAX })
  title: string;

  @IsString({ message: ErrorCode.COMMON_INVALID_INPUT })
  @IsNotEmpty({ message: ErrorCode.BOOK_AUTHOR_REQUIRED })
  @MaxLength(100, { message: ErrorCode.BOOK_AUTHOR_MAX })
  author: string;

  @IsOptional()
  @IsString({ message: ErrorCode.COMMON_INVALID_INPUT })
  @MaxLength(100, { message: ErrorCode.BOOK_PUBLISHER_MAX })
  publisher?: string | null;

  @IsString({ message: ErrorCode.COMMON_INVALID_INPUT })
  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: ErrorCode.BOOK_COVER_COLOR_FORMAT,
  })
  coverColor: string;

  @IsString({ message: ErrorCode.COMMON_INVALID_INPUT })
  @IsNotEmpty({ message: ErrorCode.BOOK_COVER_EMOJI_INVALID })
  @MaxLength(16, { message: ErrorCode.BOOK_COVER_EMOJI_INVALID })
  coverEmoji: string;

  @IsOptional()
  @IsEnum(BookStatus, { message: ErrorCode.BOOK_STATUS_INVALID })
  status?: BookStatus;

  // 날짜류는 null 전달 시 '해제' — @IsOptional은 null도 검증을 건너뛴다
  @IsOptional()
  @IsDateString({}, { message: ErrorCode.BOOK_DATE_INVALID })
  meetingDate?: string | null;

  @IsOptional()
  @IsDateString({}, { message: ErrorCode.BOOK_DATE_INVALID })
  periodFrom?: string | null;

  @IsOptional()
  @IsDateString({}, { message: ErrorCode.BOOK_DATE_INVALID })
  periodTo?: string | null;

  /** 참여 회원의 publicId 목록 — 전달 시 전체 교체 */
  @IsOptional()
  @IsArray({ message: ErrorCode.COMMON_INVALID_INPUT })
  @IsString({ each: true, message: ErrorCode.COMMON_INVALID_INPUT })
  participantIds?: string[];
}
