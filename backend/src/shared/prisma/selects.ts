/** 응답 공통 멤버 요약 select — 도메인 서비스에서 공용 */
export const memberSummarySelect = {
  select: { publicId: true, name: true, avatarEmoji: true, color: true },
} as const;
