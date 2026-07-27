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
import { ErrorMessage } from '../../../../shared/constants/error-message';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: ErrorMessage.BOOK_TITLE_REQUIRED })
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty({ message: ErrorMessage.BOOK_AUTHOR_REQUIRED })
  @MaxLength(100)
  author: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  publisher?: string | null;

  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: ErrorMessage.BOOK_COVER_COLOR_FORMAT,
  })
  coverColor: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  coverEmoji: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  // 날짜류는 null 전달 시 '해제' — @IsOptional은 null도 검증을 건너뛴다
  @IsOptional()
  @IsDateString()
  meetingDate?: string | null;

  @IsOptional()
  @IsDateString()
  periodFrom?: string | null;

  @IsOptional()
  @IsDateString()
  periodTo?: string | null;

  /** 참여 회원의 publicId 목록 — 전달 시 전체 교체 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[];
}
