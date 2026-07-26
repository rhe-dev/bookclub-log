import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get('books/:bookId/comments')
  list(@Param('bookId') bookId: string) {
    return this.commentsService.listForBook(bookId);
  }

  @Post('books/:bookId/comments')
  create(
    @Param('bookId') bookId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(bookId, memberId, dto);
  }

  @Patch('comments/:commentId')
  update(
    @Param('commentId') commentId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.update(commentId, memberId, dto);
  }

  @Delete('comments/:commentId')
  remove(
    @Param('commentId') commentId: string,
    @Headers('x-member-id') memberId: string | undefined,
  ) {
    return this.commentsService.remove(commentId, memberId);
  }
}
