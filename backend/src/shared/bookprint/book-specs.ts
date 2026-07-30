/**
 * 북프린트 판형(BookSpec) 카탈로그 — 실제 `GET /book-specs` 응답을 재현한다 (PLAN §5-1, D-033).
 *
 * 판형 하나가 표지 유형·제본 방식·페이지 규칙·가격을 함께 결정한다.
 * 표지/제본은 따로 고르는 축이 아니다 — 공개 제품 안내의 "사양에 따라 둘 중 하나가 표준 적용됩니다".
 *
 * 즉시 주문 가능한 표준 판형 3종만 노출한다. `SQUAREBOOK_LAYFLAT_HC`(레이플랫, 16~46쪽)는
 * 표준 3종에 없고 내지 PDF가 펼침면(pageCount / 2)이라 텍스트 문집 조판과 맞지 않아 제외.
 */

export type CoverType = 'SOFTCOVER' | 'HARDCOVER';
export type BindingType = 'PUR' | 'LAYFLAT';

export interface BookSpec {
  /** 판형 식별자 — 벤더가 판형을 추가할 수 있으므로 DB에는 문자열로 저장한다 */
  bookSpecUid: string;
  name: string;
  /** 내지 재단 크기 (mm) */
  innerTrimWidthMm: number;
  innerTrimHeightMm: number;
  pageMin: number;
  pageMax: number;
  /** 페이지 증가 단위 — 이 배수가 아니면 벤더가 주문을 거부한다 */
  pageIncrement: number;
  coverType: CoverType;
  bindingType: BindingType;
  /** pageMin 기준 기본 단가 (원) */
  priceBase: number;
  /** pageIncrement마다 붙는 추가 단가 (원) */
  pricePerIncrement: number;
  /** 이 판형이 어떤 문집에 어울리는지 — 주문서 판형 카드에 그대로 노출 */
  description: string;
}

/**
 * 배송비는 주문 단위로 붙는다 (부수와 무관) — 문서 "주문 생성 처리 로직" 3번.
 */
export const SHIPPING_FEE = 3000;

/**
 * 가격은 `SQUAREBOOK_HC`만 문서 예시의 실제 값(19,800원 / 2쪽당 500원)이고,
 * 나머지 두 판형은 공개 문서에 단가가 없어 목값이다 (실제는 파트너 포털에서 확인).
 */
export const BOOK_SPECS: BookSpec[] = [
  {
    bookSpecUid: 'PHOTOBOOK_A5_SC',
    name: 'A5 소프트커버',
    innerTrimWidthMm: 148,
    innerTrimHeightMm: 210,
    pageMin: 50,
    pageMax: 200,
    pageIncrement: 2,
    coverType: 'SOFTCOVER',
    bindingType: 'PUR',
    priceBase: 12800,
    pricePerIncrement: 300,
    description:
      '손에 잡히는 단행본 크기. 오래 쌓인 토론을 한 권으로 묶기 좋아요.',
  },
  {
    bookSpecUid: 'PHOTOBOOK_A4_SC',
    name: 'A4 소프트커버',
    innerTrimWidthMm: 210,
    innerTrimHeightMm: 297,
    pageMin: 24,
    pageMax: 130,
    pageIncrement: 2,
    coverType: 'SOFTCOVER',
    bindingType: 'PUR',
    priceBase: 16800,
    pricePerIncrement: 400,
    description: '판면이 넉넉해 인용문과 긴 글이 시원하게 들어가요.',
  },
  {
    bookSpecUid: 'SQUAREBOOK_HC',
    name: '스퀘어북 하드커버',
    innerTrimWidthMm: 243,
    innerTrimHeightMm: 248,
    pageMin: 24,
    pageMax: 130,
    pageIncrement: 2,
    coverType: 'HARDCOVER',
    bindingType: 'PUR',
    priceBase: 19800,
    pricePerIncrement: 500,
    description: '단단한 하드커버로 오래 남아요. 기념 문집·선물용에 어울려요.',
  },
];

const SPEC_BY_UID = new Map(BOOK_SPECS.map((spec) => [spec.bookSpecUid, spec]));

export const findBookSpec = (bookSpecUid: string): BookSpec | undefined =>
  SPEC_BY_UID.get(bookSpecUid);
