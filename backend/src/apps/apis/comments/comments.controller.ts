import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { DeletedResponse } from '../shared/dto/deleted.response';
import { PaginationQuery } from '../shared/dto/pagination.query';
import { CommentsService } from './comments.service';
import {
  CommentLikeResponse,
  CommentResponse,
  PaginatedCommentsResponse,
} from './dto/comment.response';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@ApiHeader({
  name: 'X-Member-Id',
  required: false,
  description: '현재 멤버의 publicId — 쓰기 요청에 필요 (D-017)',
})
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('books/:bookId/comments')
  list(
    @Param('bookId') bookId: string,
    @Query() query: PaginationQuery,
    @Headers('x-member-id') memberId: string | undefined,
  ): Promise<PaginatedCommentsResponse> {
    return this.commentsService.listForBook(bookId, query, memberId);
  }

  @Post('books/:bookId/comments')
  create(
    @Param('bookId') bookId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    return this.commentsService.create(bookId, memberId, dto);
  }

  @Patch('comments/:commentId')
  update(
    @Param('commentId') commentId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: UpdateCommentDto,
  ): Promise<CommentResponse> {
    return this.commentsService.update(commentId, memberId, dto);
  }

  @Delete('comments/:commentId')
  remove(
    @Param('commentId') commentId: string,
    @Headers('x-member-id') memberId: string | undefined,
  ): Promise<DeletedResponse> {
    return this.commentsService.remove(commentId, memberId);
  }

  @Post('comments/:commentId/like')
  toggleLike(
    @Param('commentId') commentId: string,
    @Headers('x-member-id') memberId: string | undefined,
  ): Promise<CommentLikeResponse> {
    return this.commentsService.toggleLike(commentId, memberId);
  }
}
