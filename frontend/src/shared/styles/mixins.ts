import { colorChips } from './colors';

/** n줄 말줄임 (line clamp) sx 조각 */
export const lineClamp = (lines: number) =>
  ({
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }) as const;

/** 카드 그림자 — 히어로 카드 등 은은한 떠 있음 */
export const cardShadow = '0 4px 16px rgba(17, 17, 17, 0.08)';

/** 플로팅 그림자 — 토스트 등 화면 위에 뜨는 요소 */
export const floatingShadow = '0 6px 20px rgba(17, 17, 17, 0.25)';

/** 카드 표면 — 흰 배경 + 연회색 보더 + 라운드/패딩 (목록·프로필 카드 공통) */
export const cardSurface = {
  borderRadius: 2,
  border: `1px solid ${colorChips.grayScale[200]}`,
  backgroundColor: colorChips.basic.white,
  p: { xs: 2, md: 2.5 },
} as const;
