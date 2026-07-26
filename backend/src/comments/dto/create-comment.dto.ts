import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ErrorMessage } from '../../shared/constants/error-message';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: ErrorMessage.COMMENT_CONTENT_REQUIRED })
  @MaxLength(10000, { message: ErrorMessage.COMMENT_CONTENT_TOO_LONG })
  content: string;

  /** 선택 앵커: 언급하는 페이지 — null 전달 시 해제 */
  @IsOptional()
  @IsInt()
  @Min(1, { message: ErrorMessage.COMMENT_PAGE_MIN })
  page?: number | null;

  /** 선택 앵커: 인용 문장 — null 전달 시 해제 */
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: ErrorMessage.COMMENT_QUOTE_TOO_LONG })
  quote?: string | null;

  /** 답글 대상 코멘트의 publicId — 스레드는 1단계까지만 */
  @IsOptional()
  @IsString()
  parentId?: string;
}
