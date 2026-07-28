/** TanStack Query 키 단일 소스 */
export const queryKeys = {
  members: ['members'] as const,
  clubs: ['clubs'] as const,
  clubsMine: (memberPublicId: string) =>
    ['clubs', 'mine', memberPublicId] as const,
  clubMembers: (clubPublicId: string) =>
    ['clubs', clubPublicId, 'members'] as const,
  /** status 미지정(전체)은 'ALL' 세그먼트로 캐시 분리 */
  books: (clubPublicId: string, status?: string) =>
    ['clubs', clubPublicId, 'books', status ?? 'ALL'] as const,
  booksRoot: (clubPublicId: string) =>
    ['clubs', clubPublicId, 'books'] as const,
  book: (bookPublicId: string) => ['books', bookPublicId] as const,
  ordersMine: ['orders', 'mine'] as const,
  order: (orderPublicId: string) => ['orders', orderPublicId] as const,
  adminOrders: ['admin', 'orders'] as const,
  comments: (bookPublicId: string) =>
    ['books', bookPublicId, 'comments'] as const,
} as const;
