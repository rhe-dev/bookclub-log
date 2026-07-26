/** 목록 API 공통 meta */
export class PageMetaResponse {
  page: number;
  limit: number;
  totalCount: number;
  hasNext: boolean;
}
