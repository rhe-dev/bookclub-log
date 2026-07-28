import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ErrorCode } from '../constants/error-code';

export class PaginationQuery {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ErrorCode.PAGE_INVALID })
  @Min(1, { message: ErrorCode.PAGE_INVALID })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: ErrorCode.LIMIT_INVALID })
  @Min(1, { message: ErrorCode.LIMIT_INVALID })
  @Max(100, { message: ErrorCode.LIMIT_INVALID })
  limit?: number = 20;
}

export interface PageMeta {
  page: number;
  limit: number;
  totalCount: number;
  hasNext: boolean;
}

export function toPageMeta(
  page: number,
  limit: number,
  totalCount: number,
): PageMeta {
  return { page, limit, totalCount, hasNext: page * limit < totalCount };
}
