/** 라우트 단일 소스 — 경로 문자열을 화면 코드에 직접 쓰지 않는다 */
export const ROUTES = {
  /** 입장(프로필 선택) */
  entry: '/',
  /** 책방(모임 홈) */
  bookshelf: '/bookshelf',
  /** 책 상세(토론) */
  bookDetail: (bookPublicId: string) => `/books/${bookPublicId}`,
} as const;
