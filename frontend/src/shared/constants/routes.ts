/** 라우트 단일 소스 — 경로 문자열을 화면 코드에 직접 쓰지 않는다 */
export const ROUTES = {
  /** 서비스 소개(랜딩) — 로그인 진입점 */
  home: '/',
  /** 책방(모임 홈) */
  bookshelf: '/bookshelf',
  /** 책 상세(토론) */
  bookDetail: (bookPublicId: string) => `/books/${bookPublicId}`,
  /** 문집 내보내기(주문 만들기) */
  orderNew: '/orders/new',
  /** 마이페이지(내 주문·코멘트) */
  myPage: '/my',
  /** 운영자 — 주문 관리 */
  adminOrders: '/admin/orders',
  /** 운영자 — 주문 상세 (모달이 아닌 페이지 — 회원·클럽 상세와 오갈 수 있어야 한다) */
  adminOrderDetail: (orderPublicId: string) => `/admin/orders/${orderPublicId}`,
  /** 운영자 — 회원 관리 */
  adminMembers: '/admin/members',
  adminMemberDetail: (memberPublicId: string) =>
    `/admin/members/${memberPublicId}`,
  /** 운영자 — 클럽 관리 */
  adminClubs: '/admin/clubs',
  /** 운영자 — 클럽 상세 */
  adminClubDetail: (clubPublicId: string) => `/admin/clubs/${clubPublicId}`,
} as const;
