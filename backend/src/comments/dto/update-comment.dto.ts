import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateCommentDto } from './create-comment.dto';

// 답글 대상(parentId)은 변경 불가
export class UpdateCommentDto extends PartialType(
  OmitType(CreateCommentDto, ['parentId'] as const),
) {}
