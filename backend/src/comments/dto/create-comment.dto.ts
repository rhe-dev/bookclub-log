import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: '내용을 입력해 주세요.' })
  @MaxLength(2000, { message: '코멘트는 2000자 이내로 작성해 주세요.' })
  content: string;

  /** 선택 앵커: 언급하는 페이지 */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1, { message: '페이지는 1 이상이어야 합니다.' })
  page?: number;

  /** 선택 앵커: 인용 문장 */
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '인용은 500자 이내로 입력해 주세요.' })
  quote?: string;

  /** 답글 대상 코멘트의 publicId — 스레드는 1단계까지만 */
  @IsOptional()
  @IsString()
  parentId?: string;
}
