import { BOOK_SPECS, type BookSpec, findBookSpec } from './book-specs';

/**
 * 판형별 제작 가능 여부 판정 (D-035).
 *
 * 주문서 판형 카드가 "왜 이 판형을 못 고르는지"를 그대로 보여줄 수 있도록,
 * 불가 사유와 기준값을 함께 돌려준다. 운영자 발주 직전 재확인도 같은 함수를 쓴다.
 */

export type IneligibleReason = 'PAGE_MIN' | 'PAGE_MAX' | 'PAGE_INCREMENT';

export interface SpecEligibility {
  bookSpecUid: string;
  eligible: boolean;
  /** 불가할 때만 — 어떤 규칙에 걸렸는지 */
  reason?: IneligibleReason;
  /** 그 규칙의 기준값 (최소 쪽수·최대 쪽수·증분 단위) */
  requiredValue?: number;
}

export function checkSpecEligibility(
  spec: BookSpec,
  pageCount: number,
): SpecEligibility {
  if (pageCount < spec.pageMin)
    return {
      bookSpecUid: spec.bookSpecUid,
      eligible: false,
      reason: 'PAGE_MIN',
      requiredValue: spec.pageMin,
    };
  if (pageCount > spec.pageMax)
    return {
      bookSpecUid: spec.bookSpecUid,
      eligible: false,
      reason: 'PAGE_MAX',
      requiredValue: spec.pageMax,
    };
  if ((pageCount - spec.pageMin) % spec.pageIncrement !== 0)
    return {
      bookSpecUid: spec.bookSpecUid,
      eligible: false,
      reason: 'PAGE_INCREMENT',
      requiredValue: spec.pageIncrement,
    };
  return { bookSpecUid: spec.bookSpecUid, eligible: true };
}

/** 카탈로그 전체 판정 — 주문서 판형 목록용 */
export const checkCatalogEligibility = (pageCount: number): SpecEligibility[] =>
  BOOK_SPECS.map((spec) => checkSpecEligibility(spec, pageCount));

/** 이 분량으로 만들 수 있는 판형이 하나라도 있는지 */
export const hasEligibleSpec = (pageCount: number): boolean =>
  checkCatalogEligibility(pageCount).some((result) => result.eligible);

/** 특정 판형으로 제작 가능한지 — 알 수 없는 판형이면 null */
export function checkSpecEligibilityByUid(
  bookSpecUid: string,
  pageCount: number,
): SpecEligibility | null {
  const spec = findBookSpec(bookSpecUid);
  return spec ? checkSpecEligibility(spec, pageCount) : null;
}
