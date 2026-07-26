import { BookStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class ListBooksQuery {
  @IsOptional()
  @IsEnum(BookStatus)
  status?: BookStatus;
}
