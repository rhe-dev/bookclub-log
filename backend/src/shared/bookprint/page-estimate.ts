/**
 * 문집 분량(pageCount) 산출 — 우리가 내지를 조판하므로 수록 대상이 정해지면 쪽수가 확정된다 (D-035).
 *
 * `PDF_UPLOAD` 방식은 책 생성 시 pageCount를 벤더에 미리 알려야 하고,
 * 페이지 규칙 위반은 업로드가 아니라 **주문 생성**에서 400으로 막힌다 → 사전 검증은 파트너 책임이다.
 * 그래서 이 산출식이 주문서(예상 분량 표시)와 발주 전 재확인의 단일 기준이 된다.
 */

/** 속표지 · 모임 소개 · 목차 */
export const FRONT_MATTER_PAGES = 3;
/** 책마다 들어가는 표제지 · 책 정보(참여자·모임 일정) */
export const BOOK_HEADER_PAGES = 2;
/** 코멘트 1개 = 1쪽 — 인용문·본문·작성자를 한 쪽에 여유 있게 앉힌다 */
export const PAGES_PER_COMMENT = 1;
/** 참여자 명단 · 맺음말 */
export const BACK_MATTER_PAGES = 2;

export interface PageEstimateItem {
  /** 수록 책 1권의 살아있는 코멘트 수 (답글 포함, 삭제분 제외) */
  commentCount: number;
}

export interface PageEstimate {
  /** 벤더에 고지할 최종 페이지 수 — 항상 짝수 */
  pageCount: number;
  /** 짝수 보정으로 들어간 여백면 수 (0 또는 1) */
  blankPages: number;
  breakdown: {
    frontMatter: number;
    bookHeaders: number;
    comments: number;
    backMatter: number;
  };
}

/**
 * 수록 책들의 코멘트 수로 분량을 계산한다.
 * 홀수면 여백면 1쪽을 더해 `pageIncrement`(2) 배수를 항상 만족시킨다 —
 * 증분 위반으로 벤더가 거부하는 일이 애초에 생기지 않게.
 */
export function estimatePageCount(items: PageEstimateItem[]): PageEstimate {
  const bookHeaders = items.length * BOOK_HEADER_PAGES;
  const comments = items.reduce(
    (sum, item) => sum + item.commentCount * PAGES_PER_COMMENT,
    0,
  );
  const raw = FRONT_MATTER_PAGES + bookHeaders + comments + BACK_MATTER_PAGES;
  const blankPages = raw % 2 === 0 ? 0 : 1;

  return {
    pageCount: raw + blankPages,
    blankPages,
    breakdown: {
      frontMatter: FRONT_MATTER_PAGES,
      bookHeaders,
      comments,
      backMatter: BACK_MATTER_PAGES,
    },
  };
}
