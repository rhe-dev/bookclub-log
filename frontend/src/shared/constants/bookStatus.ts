import type { BookStatus } from '@/shared/types/book';

/** 책 상태의 사용자 언어 라벨 */
export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  UPCOMING: '읽을 예정',
  READING: '읽는 중',
  DONE: '완독',
};

/**
 * 상태별 코멘트 입력 안내 (D-039).
 *
 * 읽을 예정인 책에도 코멘트를 막지 않는다 — 실제 모임에서는 "이 책 왜 골랐어요?",
 * "언제부터 시작하나요?" 같은 대화가 읽기 전부터 오간다. 규칙으로 막는 대신 문구로
 * 기대를 맞춘다. 문집에는 완독 책만 실리므로 콘텐츠 품질은 그 규칙이 지킨다.
 */
export const COMMENT_PLACEHOLDER: Record<BookStatus, string> = {
  UPCOMING: '아직 읽기 전이에요. 기대되는 점이나 일정을 나눠 보세요',
  READING: '지금까지 읽은 데까지 이야기해 보세요. 뒷부분은 접어 두고요',
  DONE: '이 책에 대한 생각을 남겨보세요',
};
