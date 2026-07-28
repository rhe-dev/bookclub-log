/**
 * 에러 타입 단일 소스 (D-028) — API 에러 계약은 이 코드 enum이다.
 * 서비스 예외·DTO 검증 모두 코드를 던지고, 전역 필터가 코드별 기본 메시지를 붙여
 * { statusCode, errors: [{ code, message }], timestamp, path }로 응답한다.
 * 프론트는 code로 분기하고 message를 그대로 표시한다.
 */
export enum ErrorCode {
  // 공통
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  MEMBER_HEADER_REQUIRED = 'MEMBER_HEADER_REQUIRED',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  COMMON_INVALID_INPUT = 'COMMON_INVALID_INPUT',
  UNKNOWN_FIELD = 'UNKNOWN_FIELD',
  PAGE_INVALID = 'PAGE_INVALID',
  LIMIT_INVALID = 'LIMIT_INVALID',

  // 모임
  CLUB_NOT_FOUND = 'CLUB_NOT_FOUND',
  CLUB_MEMBER_ONLY = 'CLUB_MEMBER_ONLY',
  LEADER_ONLY = 'LEADER_ONLY',

  // 책
  BOOK_NOT_FOUND = 'BOOK_NOT_FOUND',
  BOOK_TITLE_REQUIRED = 'BOOK_TITLE_REQUIRED',
  BOOK_AUTHOR_REQUIRED = 'BOOK_AUTHOR_REQUIRED',
  BOOK_COVER_COLOR_FORMAT = 'BOOK_COVER_COLOR_FORMAT',
  BOOK_TITLE_MAX = 'BOOK_TITLE_MAX',
  BOOK_AUTHOR_MAX = 'BOOK_AUTHOR_MAX',
  BOOK_PUBLISHER_MAX = 'BOOK_PUBLISHER_MAX',
  BOOK_COVER_EMOJI_INVALID = 'BOOK_COVER_EMOJI_INVALID',
  BOOK_STATUS_INVALID = 'BOOK_STATUS_INVALID',
  BOOK_DATE_INVALID = 'BOOK_DATE_INVALID',
  BOOK_PERIOD_INVALID = 'BOOK_PERIOD_INVALID',
  BOOK_PARTICIPANT_NOT_IN_CLUB = 'BOOK_PARTICIPANT_NOT_IN_CLUB',

  // 주문
  ORDER_NOT_FOUND = 'ORDER_NOT_FOUND',
  ORDER_TITLE_REQUIRED = 'ORDER_TITLE_REQUIRED',
  ORDER_COPIES_MIN = 'ORDER_COPIES_MIN',
  ORDER_COPIES_MAX = 'ORDER_COPIES_MAX',
  ORDER_TITLE_MAX = 'ORDER_TITLE_MAX',
  ORDER_BOOKS_REQUIRED = 'ORDER_BOOKS_REQUIRED',
  ORDER_BOOK_INVALID = 'ORDER_BOOK_INVALID',
  ORDER_BOOK_NOT_DONE = 'ORDER_BOOK_NOT_DONE',
  ORDER_INVALID_TRANSITION = 'ORDER_INVALID_TRANSITION',
  ORDER_ADMIN_ONLY_TRANSITION = 'ORDER_ADMIN_ONLY_TRANSITION',
  ORDER_ORDERER_ONLY = 'ORDER_ORDERER_ONLY',
  ORDER_REASON_REQUIRED = 'ORDER_REASON_REQUIRED',
  ORDER_REASON_INVALID = 'ORDER_REASON_INVALID',
  ORDER_REASON_DETAIL_REQUIRED = 'ORDER_REASON_DETAIL_REQUIRED',
  ORDER_REASON_DETAIL_MIN = 'ORDER_REASON_DETAIL_MIN',
  ORDER_REASON_DETAIL_MAX = 'ORDER_REASON_DETAIL_MAX',
  ORDER_STATUS_INVALID = 'ORDER_STATUS_INVALID',

  // 코멘트
  COMMENT_NOT_FOUND = 'COMMENT_NOT_FOUND',
  COMMENT_AUTHOR_ONLY = 'COMMENT_AUTHOR_ONLY',
  COMMENT_CONTENT_REQUIRED = 'COMMENT_CONTENT_REQUIRED',
  COMMENT_CONTENT_TOO_LONG = 'COMMENT_CONTENT_TOO_LONG',
  COMMENT_PAGE_MIN = 'COMMENT_PAGE_MIN',
  COMMENT_QUOTE_TOO_LONG = 'COMMENT_QUOTE_TOO_LONG',
  REPLY_TARGET_NOT_FOUND = 'REPLY_TARGET_NOT_FOUND',
  REPLY_TO_OTHER_BOOK = 'REPLY_TO_OTHER_BOOK',
  REPLY_DEPTH_EXCEEDED = 'REPLY_DEPTH_EXCEEDED',
  REPLY_TO_DELETED = 'REPLY_TO_DELETED',

  // 분류 불가(외부 라이브러리 메시지 등)
  NOT_FOUND = 'NOT_FOUND',
  UNKNOWN = 'UNKNOWN',
}

/** 코드별 사용자 노출 한글 메시지 — 카피의 단일 소스 (D-018) */
export const ERROR_MESSAGE: Record<ErrorCode, string> = {
  // 공통
  [ErrorCode.INTERNAL_ERROR]:
    '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  [ErrorCode.MEMBER_HEADER_REQUIRED]: 'X-Member-Id 헤더가 필요합니다.',
  [ErrorCode.MEMBER_NOT_FOUND]: '멤버를 찾을 수 없습니다.',
  [ErrorCode.COMMON_INVALID_INPUT]: '입력값 형식이 올바르지 않습니다.',
  [ErrorCode.UNKNOWN_FIELD]: '요청에 알 수 없는 필드가 있습니다.',
  [ErrorCode.PAGE_INVALID]: '페이지 번호는 1 이상의 정수여야 합니다.',
  [ErrorCode.LIMIT_INVALID]: '페이지 크기는 1~100 사이의 정수여야 합니다.',

  // 모임
  [ErrorCode.CLUB_NOT_FOUND]: '모임을 찾을 수 없습니다.',
  [ErrorCode.CLUB_MEMBER_ONLY]: '모임 멤버만 할 수 있습니다.',
  [ErrorCode.LEADER_ONLY]: '모임장만 할 수 있습니다.',

  // 책
  [ErrorCode.BOOK_NOT_FOUND]: '책을 찾을 수 없습니다.',
  [ErrorCode.BOOK_TITLE_REQUIRED]: '책 제목을 입력해 주세요.',
  [ErrorCode.BOOK_AUTHOR_REQUIRED]: '저자를 입력해 주세요.',
  [ErrorCode.BOOK_COVER_COLOR_FORMAT]: '표지 색상은 #RRGGBB 형식이어야 합니다.',
  [ErrorCode.BOOK_TITLE_MAX]: '책 제목은 200자 이하로 입력해 주세요.',
  [ErrorCode.BOOK_AUTHOR_MAX]: '저자는 100자 이하로 입력해 주세요.',
  [ErrorCode.BOOK_PUBLISHER_MAX]: '출판사는 100자 이하로 입력해 주세요.',
  [ErrorCode.BOOK_COVER_EMOJI_INVALID]: '표지 이모지가 올바르지 않습니다.',
  [ErrorCode.BOOK_STATUS_INVALID]: '올바른 책 상태 값이 아닙니다.',
  [ErrorCode.BOOK_DATE_INVALID]: '날짜 형식이 올바르지 않습니다.',
  [ErrorCode.BOOK_PERIOD_INVALID]: '기간 종료일은 시작일보다 빠를 수 없습니다.',
  [ErrorCode.BOOK_PARTICIPANT_NOT_IN_CLUB]:
    '참여 회원 목록에 이 모임의 멤버가 아닌 사람이 있습니다.',

  // 주문
  [ErrorCode.ORDER_NOT_FOUND]: '주문을 찾을 수 없습니다.',
  [ErrorCode.ORDER_TITLE_REQUIRED]: '문집 제목을 입력해 주세요.',
  [ErrorCode.ORDER_COPIES_MIN]: '부수는 1부 이상이어야 합니다.',
  [ErrorCode.ORDER_COPIES_MAX]: '부수는 100부 이하로 입력해 주세요.',
  [ErrorCode.ORDER_TITLE_MAX]: '문집 제목은 100자 이하로 입력해 주세요.',
  [ErrorCode.ORDER_BOOKS_REQUIRED]: '수록할 책을 한 권 이상 선택해 주세요.',
  [ErrorCode.ORDER_BOOK_INVALID]:
    '수록 목록에 이 모임의 책이 아닌 항목이 있습니다.',
  [ErrorCode.ORDER_BOOK_NOT_DONE]: '완독한 책만 문집에 수록할 수 있습니다.',
  [ErrorCode.ORDER_INVALID_TRANSITION]: '현재 상태에서는 불가능한 변경입니다.',
  [ErrorCode.ORDER_ADMIN_ONLY_TRANSITION]:
    '운영자만 진행할 수 있는 단계입니다.',
  [ErrorCode.ORDER_ORDERER_ONLY]: '주문자만 할 수 있습니다.',
  [ErrorCode.ORDER_REASON_REQUIRED]: '환불·재제작 사유를 선택해 주세요.',
  [ErrorCode.ORDER_REASON_INVALID]: '올바른 사유 항목이 아닙니다.',
  [ErrorCode.ORDER_REASON_DETAIL_REQUIRED]:
    '기타 사유는 상세 내용을 입력해 주세요.',
  [ErrorCode.ORDER_REASON_DETAIL_MIN]:
    '기타 사유 상세는 5자 이상 입력해 주세요.',
  [ErrorCode.ORDER_REASON_DETAIL_MAX]:
    '사유 상세는 500자 이하로 입력해 주세요.',
  [ErrorCode.ORDER_STATUS_INVALID]: '올바른 주문 상태 값이 아닙니다.',

  // 코멘트
  [ErrorCode.COMMENT_NOT_FOUND]: '코멘트를 찾을 수 없습니다.',
  [ErrorCode.COMMENT_AUTHOR_ONLY]: '작성자만 할 수 있습니다.',
  [ErrorCode.COMMENT_CONTENT_REQUIRED]: '내용을 입력해 주세요.',
  [ErrorCode.COMMENT_CONTENT_TOO_LONG]:
    '코멘트는 10,000자 이내로 작성해 주세요.',
  [ErrorCode.COMMENT_PAGE_MIN]: '페이지는 1 이상이어야 합니다.',
  [ErrorCode.COMMENT_QUOTE_TOO_LONG]: '인용은 1,000자 이내로 입력해 주세요.',
  [ErrorCode.REPLY_TARGET_NOT_FOUND]: '답글 대상 코멘트를 찾을 수 없습니다.',
  [ErrorCode.REPLY_TO_OTHER_BOOK]:
    '다른 책의 코멘트에는 답글을 달 수 없습니다.',
  [ErrorCode.REPLY_DEPTH_EXCEEDED]: '답글에는 답글을 달 수 없습니다.',
  [ErrorCode.REPLY_TO_DELETED]: '삭제된 코멘트에는 답글을 달 수 없습니다.',
  [ErrorCode.NOT_FOUND]: '요청한 대상을 찾을 수 없습니다.',
  [ErrorCode.UNKNOWN]: '요청을 처리하지 못했습니다.',
};

/** 임의 문자열이 ErrorCode인지 판별 — 전역 필터에서 사용 */
export const isErrorCode = (value: string): value is ErrorCode =>
  // in 연산자는 Object.prototype 키('toString' 등)까지 true — 자기 소유 키만 인정
  Object.prototype.hasOwnProperty.call(ERROR_MESSAGE, value);
