/** TanStack Query 키 단일 소스 */
export const queryKeys = {
  clubs: ['clubs'] as const,
  clubMembers: (clubPublicId: string) =>
    ['clubs', clubPublicId, 'members'] as const,
  /** status 미지정(전체)은 'ALL' 세그먼트로 캐시 분리 */
  books: (clubPublicId: string, status?: string) =>
    ['clubs', clubPublicId, 'books', status ?? 'ALL'] as const,
  booksRoot: (clubPublicId: string) =>
    ['clubs', clubPublicId, 'books'] as const,
} as const;
