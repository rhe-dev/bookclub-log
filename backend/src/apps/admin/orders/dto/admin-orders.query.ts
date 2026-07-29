import { OrderStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ErrorCode } from '../../../../shared/constants/error-code';
import { PaginationQuery } from '../../../../shared/dto/pagination.query';

const invalid = (property: string) =>
  `${ErrorCode.COMMON_INVALID_INPUT}|${property}`;

/** 운영자 주문 목록 필터 — 미지정 항목은 전체 */
export class AdminOrdersQuery extends PaginationQuery {
  @IsOptional()
  @IsEnum(OrderStatus, { message: ErrorCode.ORDER_STATUS_INVALID })
  status?: OrderStatus;

  /** 클럽 publicId */
  @IsOptional()
  @IsString({ message: invalid('clubId') })
  clubId?: string;

  /** 검색어 — 문집 제목·주문자 이름·주문번호 */
  @IsOptional()
  @IsString({ message: invalid('q') })
  @MaxLength(100, { message: invalid('q') })
  q?: string;

  /** 주문일 시작 (YYYY-MM-DD) */
  @IsOptional()
  @IsDateString({}, { message: invalid('from') })
  from?: string;

  /** 주문일 종료 (YYYY-MM-DD, 당일 포함) */
  @IsOptional()
  @IsDateString({}, { message: invalid('to') })
  to?: string;

  /** 운영자 처리가 필요한 건만 — 신규 접수·환불 요청·재제작 요청 */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: invalid('actionRequired') })
  actionRequired?: boolean;

  /** CSV 다운로드에서 선택한 주문만 받을 때 (미지정이면 현재 필터 전체) */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',').filter(Boolean) : value,
  )
  @IsArray({ message: invalid('ids') })
  @IsString({ each: true, message: invalid('ids') })
  ids?: string[];

  /** 정렬 — 주문일/변경일 × 최신·오래된순 (기본 주문일 최신순) */
  @IsOptional()
  @IsIn(['latest', 'oldest', 'changed_latest', 'changed_oldest'], {
    message: invalid('sort'),
  })
  sort?: 'latest' | 'oldest' | 'changed_latest' | 'changed_oldest';

  /** CSV 파일명에 쓰는 범위 표기 — 선택분·현재 페이지 구분 */
  @IsOptional()
  @IsIn(['selected', 'page'], { message: invalid('scope') })
  scope?: 'selected' | 'page';
}
