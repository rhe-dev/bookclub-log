import type { components } from './api.generated';

/** 목록 API 공통 meta — 스펙 생성 타입 재노출 */
export type PageMeta = components['schemas']['PageMetaResponse'];

/** 전역 에러 응답 (D-018·D-028) — code가 계약, message는 서버가 준 카피 */
export type ApiErrorItem = components['schemas']['ApiErrorItemResponse'];

/** 에러 코드 — 프론트 분기는 이 코드로만 한다 */
export type ErrorCode = ApiErrorItem['code'];

/** 목록 봉투 제네릭 — 스펙엔 도메인별 구체 타입만 있어 보조 정의 */
export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}
