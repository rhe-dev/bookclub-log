/** 목록 API 공통 봉투 — 백엔드 pagination.query.ts와 1:1 */
export interface PageMeta {
  page: number;
  limit: number;
  totalCount: number;
  hasNext: boolean;
}

export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}

/** 전역 에러 필터 응답 포맷 (D-018) */
export interface ApiErrorBody {
  statusCode: number;
  messages: string[];
  timestamp: string;
  path: string;
}
