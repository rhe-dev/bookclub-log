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
import { DeletedResponse } from '../../../shared/dto/deleted.response';
import { BooksService } from './books.service';
import { BookResponse, PaginatedBooksResponse } from './dto/book.response';
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksQuery } from './dto/list-books.query';
import { UpdateBookDto } from './dto/update-book.dto';

@ApiHeader({
  name: 'X-Member-Id',
  required: false,
  description: '현재 멤버의 publicId — 쓰기 요청에 필요 (D-017)',
})
@Controller()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('clubs/:clubId/books')
  list(
    @Param('clubId') clubId: string,
    @Query() query: ListBooksQuery,
  ): Promise<PaginatedBooksResponse> {
    return this.booksService.list(clubId, query);
  }

  @Post('clubs/:clubId/books')
  create(
    @Param('clubId') clubId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: CreateBookDto,
  ): Promise<BookResponse> {
    return this.booksService.create(clubId, memberId, dto);
  }

  @Get('books/:bookId')
  detail(@Param('bookId') bookId: string): Promise<BookResponse> {
    return this.booksService.detail(bookId);
  }

  @Patch('books/:bookId')
  update(
    @Param('bookId') bookId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: UpdateBookDto,
  ): Promise<BookResponse> {
    return this.booksService.update(bookId, memberId, dto);
  }

  @Delete('books/:bookId')
  remove(
    @Param('bookId') bookId: string,
    @Headers('x-member-id') memberId: string | undefined,
  ): Promise<DeletedResponse> {
    return this.booksService.softDelete(bookId, memberId);
  }
}
