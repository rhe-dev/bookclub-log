/** 라우트 단일 소스 — 경로 문자열을 화면 코드에 직접 쓰지 않는다 */
export const ROUTES = {
  /** 입장(프로필 선택) */
  entry: '/entry',
  /** 책방(모임 홈) */
  bookshelf: '/bookshelf',
  /** 책 상세(토론) */
  bookDetail: (bookPublicId: string) => `/books/${bookPublicId}`,
  /** 문집 내보내기(주문 만들기) */
  orderNew: '/orders/new',
  /** 마이페이지(내 주문) */
  myPage: '/my',
} as const;
