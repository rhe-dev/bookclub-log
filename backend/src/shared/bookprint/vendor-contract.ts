/**
 * 북프린트 API 계약 재현 (D-033).
 *
 * 우리 백엔드 ↔ 벤더 사이의 계약은 **문서 그대로**다 — 실패 응답 6필드 고정,
 * `ERR_*` 코드, `fieldErrors[].constraint` enum. 우리 서비스가 프론트에 쓰는 계약(D-028)과는
 * 다른 계층이며, 번역은 `vendor-error.ts`가 담당한다.
 *
 * 실제 호출은 하지 않는다(외부 의존 배제 요건). 이 타입들은 목 클라이언트가 지키는 규약이다.
 */

/** 문서의 errorCode 카탈로그 21종 중 이 서비스의 호출 경로에서 실제로 만날 수 있는 것들 */
export type VendorErrorCode =
  | 'ERR_VALIDATION_FAILED'
  | 'ERR_MALFORMED_REQUEST'
  | 'ERR_INSUFFICIENT_PAGES'
  | 'ERR_PAGECOUNT_INVALID'
  | 'ERR_UNAUTHORIZED'
  | 'ERR_INSUFFICIENT_CREDIT'
  | 'ERR_NOT_FOUND'
  | 'ERR_CONFLICT'
  | 'ERR_TOO_MANY_REQUESTS'
  | 'ERR_INTERNAL_ERROR';

/** 제약 종류 — 클라이언트 분기용. 문서의 6종을 그대로 쓴다 */
export type VendorConstraint =
  'required' | 'min' | 'max' | 'increment' | 'enum' | 'pattern';

export interface VendorFieldError {
  /** 중첩 필드는 점 표기 (`shipping.recipientPhone`) */
  field: string;
  message: string;
  currentValue?: unknown;
  /** 기대값 또는 허용 범위 — 단일 값이거나 `{ min, increment }` 객체 */
  requiredValue?: unknown;
  constraint?: VendorConstraint;
}

export interface VendorSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface VendorFailure {
  success: false;
  /** 실패 시 항상 존재 — 분기는 이 코드로 한다 (메시지 파싱 금지) */
  errorCode: VendorErrorCode;
  /** HTTP 상태의 영어 라벨 — 사용자 표시용이 아니다 */
  message: string;
  /** 기본 null, 일부 에러는 진단 객체 포함 (402의 `{ required, balance, currency }`) */
  data: Record<string, unknown> | null;
  /** 사용자 표시용 한글 메시지 배열 — 비어 있으면 [] */
  errors: string[];
  /** 필드 단위 구조화 에러 — 해당 없으면 [] */
  fieldErrors: VendorFieldError[];
}

export type VendorResponse<T> = VendorSuccess<T> | VendorFailure;

/** 벤더 주문 상태 — 문서의 `orderStatus` enum */
export type VendorOrderStatus =
  | 'PAID'
  | 'PDF_READY'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'PRODUCTION_COMPLETE'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'CANCELLED_REFUND'
  | 'ERROR';

/** 벤더 웹훅 이벤트 — 제작·배송 단계는 파트너가 호출하지 않고 이 이벤트로 통보받는다 */
export type VendorWebhookEvent =
  | 'order.created'
  | 'production.confirmed'
  | 'production.started'
  | 'production.completed'
  | 'shipping.departed'
  | 'shipping.delivered'
  | 'order.cancelled';

export interface VendorOrder {
  orderUid: string;
  orderStatus: VendorOrderStatus;
  /** 한글 표시 문자열 — 화면 표시는 이 값, 분기는 orderStatus */
  orderStatusDisplay: string;
  totalProductAmount: number;
  totalShippingFee: number;
  totalAmount: number;
  /** 파트너 외부 참조 식별자 — 우리 주문 publicId를 실어 보낸다 */
  externalRef: string;
  orderedAt: string;
}

/** 벤더 상태의 한글 표시 — 어드민 연동 패널에서 그대로 노출 */
export const VENDOR_STATUS_DISPLAY: Record<VendorOrderStatus, string> = {
  PAID: '결제완료',
  PDF_READY: 'PDF준비완료',
  CONFIRMED: '제작확정',
  IN_PRODUCTION: '제작중',
  PRODUCTION_COMPLETE: '전체제작완료',
  SHIPPED: '발송완료',
  DELIVERED: '배송완료',
  CANCELLED: '취소',
  CANCELLED_REFUND: '취소환불',
  ERROR: '오류',
};

export const isVendorFailure = <T>(
  response: VendorResponse<T>,
): response is VendorFailure => !response.success;
