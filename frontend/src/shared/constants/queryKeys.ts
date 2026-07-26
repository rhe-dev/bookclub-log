/** TanStack Query 키 단일 소스 */
export const queryKeys = {
  clubs: ['clubs'] as const,
  clubMembers: (clubPublicId: string) =>
    ['clubs', clubPublicId, 'members'] as const,
} as const;
