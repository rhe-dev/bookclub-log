import { ErrorCode } from '../constants/error-code';
import type { VendorErrorCode, VendorFailure } from './vendor-contract';

/**
 * 벤더 에러 → 우리 도메인 에러 번역 (D-033, PLAN §5-1 (5)).
 *
 * 파트너사가 실제로 하는 일이 이 번역이다. 벤더 코드를 그대로 화면에 던지지 않고
 * 우리 계약(D-028)의 코드로 바꾼 뒤, **재시도 가능 여부**를 함께 알려 운영자가
 * 다시 눌러도 되는지 판단할 수 있게 한다. 문서의 '재시도' 컬럼을 그대로 옮긴 표다.
 */
interface VendorErrorRule {
  code: ErrorCode;
  /** 같은 요청을 그대로 다시 보내도 되는지 */
  retryable: boolean;
}

const VENDOR_ERROR_RULES: Record<VendorErrorCode, VendorErrorRule> = {
  // 요청 자체가 잘못됨 — 문집 구성을 고치기 전에는 재시도해도 같은 결과
  ERR_VALIDATION_FAILED: {
    code: ErrorCode.PRINT_VENDOR_REJECTED,
    retryable: false,
  },
  ERR_MALFORMED_REQUEST: {
    code: ErrorCode.PRINT_VENDOR_REJECTED,
    retryable: false,
  },
  ERR_INSUFFICIENT_PAGES: { code: ErrorCode.PRINT_PAGE_MIN, retryable: false },
  ERR_PAGECOUNT_INVALID: { code: ErrorCode.PRINT_PAGE_MAX, retryable: false },
  ERR_UNAUTHORIZED: {
    code: ErrorCode.PRINT_VENDOR_UNAVAILABLE,
    retryable: false,
  },
  ERR_NOT_FOUND: { code: ErrorCode.PRINT_VENDOR_REJECTED, retryable: false },
  // 충전 후에는 같은 요청이 통한다
  ERR_INSUFFICIENT_CREDIT: {
    code: ErrorCode.PRINT_INSUFFICIENT_CREDIT,
    retryable: true,
  },
  // 시간이 해결하는 것들
  ERR_CONFLICT: { code: ErrorCode.PRINT_ALREADY_ORDERED, retryable: false },
  ERR_TOO_MANY_REQUESTS: {
    code: ErrorCode.PRINT_VENDOR_RATE_LIMITED,
    retryable: true,
  },
  ERR_INTERNAL_ERROR: {
    code: ErrorCode.PRINT_VENDOR_UNAVAILABLE,
    retryable: true,
  },
};

export interface TranslatedVendorError {
  code: ErrorCode;
  retryable: boolean;
  /** 운영자에게만 보여줄 원본 — 어드민 연동 패널의 진단 정보 */
  vendor: {
    errorCode: VendorErrorCode;
    /** 벤더가 준 한글 상세 (errors[0]) */
    detail?: string;
    /** 어떤 필드가 왜 걸렸는지 — 페이지 규칙 위반이면 여기에 기준값이 들어온다 */
    fieldErrors: VendorFailure['fieldErrors'];
  };
}

export function translateVendorError(
  failure: VendorFailure,
): TranslatedVendorError {
  const rule = VENDOR_ERROR_RULES[failure.errorCode] ?? {
    code: ErrorCode.PRINT_VENDOR_UNAVAILABLE,
    retryable: true,
  };

  return {
    code: rule.code,
    retryable: rule.retryable,
    vendor: {
      errorCode: failure.errorCode,
      detail: failure.errors[0],
      fieldErrors: failure.fieldErrors,
    },
  };
}
