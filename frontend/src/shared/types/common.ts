import type { components } from './api.generated';

/** 목록 API 공통 meta — 스펙 생성 타입 재노출 */
export type PageMeta = components['schemas']['PageMetaResponse'];

/** 목록 봉투 제네릭 — 스펙엔 도메인별 구체 타입만 있어 보조 정의 */
export interface Paginated<T> {
  items: T[];
  meta: PageMeta;
}
