/**
 * 사용자 노출 에러 메시지 단일 소스 (D-018)
 * — 도메인 예외와 DTO 검증 메시지가 모두 이 enum을 사용한다.
 */
export enum ErrorMessage {
  // 공통
  INTERNAL_ERROR = '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  MEMBER_HEADER_REQUIRED = 'X-Member-Id 헤더가 필요합니다.',
  MEMBER_NOT_FOUND = '멤버를 찾을 수 없습니다.',

  // 모임
  CLUB_NOT_FOUND = '모임을 찾을 수 없습니다.',
  CLUB_MEMBER_ONLY = '모임 멤버만 할 수 있습니다.',
  LEADER_ONLY = '모임장만 할 수 있습니다.',

  // 책
  BOOK_NOT_FOUND = '책을 찾을 수 없습니다.',
  BOOK_TITLE_REQUIRED = '책 제목을 입력해 주세요.',
  BOOK_AUTHOR_REQUIRED = '저자를 입력해 주세요.',
  BOOK_COVER_COLOR_FORMAT = '표지 색상은 #RRGGBB 형식이어야 합니다.',
  BOOK_PERIOD_INVALID = '기간 종료일은 시작일보다 빠를 수 없습니다.',
  BOOK_PARTICIPANT_NOT_IN_CLUB = '참여 회원 목록에 이 모임의 멤버가 아닌 사람이 있습니다.',

  // 주문
  ORDER_NOT_FOUND = '주문을 찾을 수 없습니다.',
  ORDER_TITLE_REQUIRED = '문집 제목을 입력해 주세요.',
  ORDER_COPIES_MIN = '부수는 1부 이상이어야 합니다.',
  ORDER_BOOKS_REQUIRED = '수록할 책을 한 권 이상 선택해 주세요.',
  ORDER_BOOK_INVALID = '수록 목록에 이 모임의 책이 아닌 항목이 있습니다.',
  ORDER_BOOK_NOT_DONE = '완독한 책만 문집에 수록할 수 있습니다.',
  ORDER_INVALID_TRANSITION = '현재 상태에서는 불가능한 변경입니다.',
  ORDER_ADMIN_ONLY_TRANSITION = '운영자만 진행할 수 있는 단계입니다.',
  ORDER_ORDERER_ONLY = '주문자만 할 수 있습니다.',
  ORDER_REASON_REQUIRED = '환불·재제작 사유를 선택해 주세요.',
  ORDER_REASON_INVALID = '올바른 사유 항목이 아닙니다.',
  ORDER_REASON_DETAIL_REQUIRED = '기타 사유는 상세 내용을 입력해 주세요.',
  ORDER_REASON_DETAIL_MIN = '기타 사유 상세는 5자 이상 입력해 주세요.',
  ORDER_REASON_DETAIL_MAX = '사유 상세는 500자 이하로 입력해 주세요.',

  // 코멘트
  COMMENT_NOT_FOUND = '코멘트를 찾을 수 없습니다.',
  COMMENT_AUTHOR_ONLY = '작성자만 할 수 있습니다.',
  COMMENT_CONTENT_REQUIRED = '내용을 입력해 주세요.',
  COMMENT_CONTENT_TOO_LONG = '코멘트는 10,000자 이내로 작성해 주세요.',
  COMMENT_PAGE_MIN = '페이지는 1 이상이어야 합니다.',
  COMMENT_QUOTE_TOO_LONG = '인용은 1,000자 이내로 입력해 주세요.',
  REPLY_TARGET_NOT_FOUND = '답글 대상 코멘트를 찾을 수 없습니다.',
  REPLY_TO_OTHER_BOOK = '다른 책의 코멘트에는 답글을 달 수 없습니다.',
  REPLY_DEPTH_EXCEEDED = '답글에는 답글을 달 수 없습니다.',
  REPLY_TO_DELETED = '삭제된 코멘트에는 답글을 달 수 없습니다.',
}
