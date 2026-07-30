import type { BookSpecOption } from '@/shared/types/order';

// 표지 색상은 UI 토큰이 아니라 콘텐츠 값(문집 표지의 색) — colorChips 규칙의 의도적 예외
export const COVER_COLORS = [
  '#4A6FA5',
  '#B0662C',
  '#2F855A',
  '#C53030',
  '#6B46C1',
  '#B7791F',
  '#2F4858',
  '#6D6875',
];

export const COVER_EMOJIS = [
  '📚',
  '📖',
  '✏️',
  '🖋️',
  '🌙',
  '🌿',
  '☀️',
  '🍂',
  '⭐',
  '🕯️',
  '💬',
  '📝',
  '🏛️',
  '🌊',
  '🔖',
  '🎞️',
];

/**
 * 판형을 고를 수 없는 이유를 사용자 말로 옮긴다 (D-035).
 * "무엇을 하면 고를 수 있는지"까지 말해 주는 게 목적 — 규칙만 보여주면 막다른 길이 된다.
 */
export const describeIneligible = (spec: BookSpecOption): string | null => {
  if (spec.eligible) return null;
  switch (spec.ineligibleReason) {
    case 'PAGE_MIN':
      return `${spec.requiredValue}쪽부터 만들 수 있어요. 수록할 책을 더 담으면 고를 수 있어요.`;
    case 'PAGE_MAX':
      return `${spec.requiredValue}쪽까지 만들 수 있어요. 수록할 책을 줄이면 고를 수 있어요.`;
    case 'PAGE_INCREMENT':
      return `${spec.requiredValue}쪽 단위로만 만들 수 있어요.`;
    default:
      return '지금 분량으로는 만들 수 없어요.';
  }
};
