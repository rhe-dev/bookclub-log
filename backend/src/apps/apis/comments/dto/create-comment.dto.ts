import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

export class CreateCommentDto {
  @IsString({ message: ErrorCode.COMMON_INVALID_INPUT })
  @IsNotEmpty({ message: ErrorCode.COMMENT_CONTENT_REQUIRED })
  @MaxLength(10000, { message: ErrorCode.COMMENT_CONTENT_TOO_LONG })
  content: string;

  /** 선택 앵커: 언급하는 페이지 — null 전달 시 해제 */
  @IsOptional()
  @IsInt({ message: ErrorCode.COMMON_INVALID_INPUT })
  @Min(1, { message: ErrorCode.COMMENT_PAGE_MIN })
  page?: number | null;

  /** 선택 앵커: 인용 문장 — null 전달 시 해제 */
  @IsOptional()
  @IsString({ message: ErrorCode.COMMON_INVALID_INPUT })
  @MaxLength(1000, { message: ErrorCode.COMMENT_QUOTE_TOO_LONG })
  quote?: string | null;

  /** 답글 대상 코멘트의 publicId — 스레드는 1단계까지만 */
  @IsOptional()
  @IsString({ message: ErrorCode.COMMON_INVALID_INPUT })
  parentId?: string;
}
