import { ApiProperty } from '@nestjs/swagger';
import { ErrorCode } from '../constants/error-code';

/** 에러 항목 — code가 계약, message는 코드별 한글 카피 (D-028) */
export class ApiErrorItemResponse {
  @ApiProperty({ enum: ErrorCode })
  code: ErrorCode;

  message: string;
}

/** 전역 예외 필터의 응답 포맷 — 모든 에러가 이 형태로 나간다 (D-018·D-028) */
export class ApiErrorResponse {
  statusCode: number;
  errors: ApiErrorItemResponse[];
  timestamp: string;
  path: string;
}
