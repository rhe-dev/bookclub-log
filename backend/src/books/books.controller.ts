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
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { ListBooksQuery } from './dto/list-books.query';
import { UpdateBookDto } from './dto/update-book.dto';

@Controller()
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get('clubs/:clubId/books')
  list(@Param('clubId') clubId: string, @Query() query: ListBooksQuery) {
    return this.booksService.list(clubId, query.status);
  }

  @Post('clubs/:clubId/books')
  create(
    @Param('clubId') clubId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: CreateBookDto,
  ) {
    return this.booksService.create(clubId, memberId, dto);
  }

  @Get('books/:bookId')
  detail(@Param('bookId') bookId: string) {
    return this.booksService.detail(bookId);
  }

  @Patch('books/:bookId')
  update(
    @Param('bookId') bookId: string,
    @Headers('x-member-id') memberId: string | undefined,
    @Body() dto: UpdateBookDto,
  ) {
    return this.booksService.update(bookId, memberId, dto);
  }

  @Delete('books/:bookId')
  remove(
    @Param('bookId') bookId: string,
    @Headers('x-member-id') memberId: string | undefined,
  ) {
    return this.booksService.softDelete(bookId, memberId);
  }
}
