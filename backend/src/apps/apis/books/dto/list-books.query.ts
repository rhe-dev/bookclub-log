import { BookStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQuery } from '../../shared/dto/pagination.query';

export class ListBooksQuery extends PaginationQuery {
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;
}
