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
