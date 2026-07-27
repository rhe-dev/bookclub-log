/**
 * 타이포 토큰 — text_{weight}_{size} 네이밍.
 * weight: b(700) | sb(600) | m(500) | r(400), 기본 line-height 1.5.
 * 화면 텍스트는 Typo 컴포넌트 + 이 토큰으로 통일한다.
 */
const TYPO_WEIGHTS = { b: 700, sb: 600, m: 500, r: 400 } as const;
const TYPO_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28] as const;

export type TypoWeight = keyof typeof TYPO_WEIGHTS;
export type TypoSize = (typeof TYPO_SIZES)[number];
export type TypoToken = `text_${TypoWeight}_${TypoSize}`;

export interface TypoStyle {
  fontSize: string;
  fontWeight: number;
  lineHeight: number;
}

export const typographyTokens = Object.fromEntries(
  Object.entries(TYPO_WEIGHTS).flatMap(([weightKey, fontWeight]) =>
    TYPO_SIZES.map((size) => [
      `text_${weightKey}_${size}`,
      { fontSize: `${size}px`, fontWeight, lineHeight: 1.5 },
    ]),
  ),
) as Record<TypoToken, TypoStyle>;
