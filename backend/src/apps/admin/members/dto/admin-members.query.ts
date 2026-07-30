import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';
import { PaginationQuery } from '../../../../shared/dto/pagination.query';

/**
 * 회원 목록 필터.
 * 클럽 목록 화면을 따로 두지 않고, 이 클럽 필터로 "이 모임의 회원들"을 본다.
 */
export class AdminMembersQuery extends PaginationQuery {
  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  clubId?: string;

  /** 이름·회원 ID·클럽명·클럽 ID 검색 */
  @IsOptional()
  @Type(() => String)
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  q?: string;

  /** 가입일 범위 (YYYY-MM-DD) */
  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  from?: string;

  @IsOptional()
  @IsString({ message: `${ErrorCode.COMMON_INVALID_INPUT}|$property` })
  to?: string;
}
