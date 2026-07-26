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

export class CreateBookDto {
  @IsString()
  @IsNotEmpty({ message: '책 제목을 입력해 주세요.' })
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty({ message: '저자를 입력해 주세요.' })
  @MaxLength(100)
  author: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  publisher?: string;

  @Matches(/^#[0-9a-fA-F]{6}$/, {
    message: 'coverColor는 #RRGGBB 형식이어야 합니다.',
  })
  coverColor: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(16)
  coverEmoji: string;

  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;

  @IsOptional()
  @IsDateString()
  meetingDate?: string;

  @IsOptional()
  @IsDateString()
  periodFrom?: string;

  @IsOptional()
  @IsDateString()
  periodTo?: string;

  /** 참여 회원의 publicId 목록 — 전달 시 전체 교체 */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  participantIds?: string[];
}
