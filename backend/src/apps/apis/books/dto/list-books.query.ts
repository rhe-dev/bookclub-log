import { BookStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';
import { PaginationQuery } from '../../../../shared/dto/pagination.query';

export class ListBooksQuery extends PaginationQuery {
  @IsOptional()
  @IsEnum(BookStatus, { message: ErrorCode.BOOK_STATUS_INVALID })
  status?: BookStatus;
}
