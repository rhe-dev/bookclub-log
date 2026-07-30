import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';

/** 클럽 목록 필터 — 클럽이 늘어나면 이름으로 찾는다 (페이지네이션 예외는 유지, D-026) */
export class AdminClubsQuery {
  /** 클럽명·클럽 ID 검색 */
  @IsOptional()
  @Type(() => String)
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  q?: string;

  /** 개설일 범위 (YYYY-MM-DD) */
  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  from?: string;

  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  to?: string;
}
