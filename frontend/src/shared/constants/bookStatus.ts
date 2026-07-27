import type { BookStatus } from '@/shared/types/book';

/** 책 상태의 사용자 언어 라벨 */
export const BOOK_STATUS_LABEL: Record<BookStatus, string> = {
  UPCOMING: '읽을 예정',
  READING: '읽는 중',
  DONE: '완독',
};
