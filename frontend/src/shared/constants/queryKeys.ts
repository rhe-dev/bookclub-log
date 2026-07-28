/** TanStack Query 키 단일 소스 */
export const queryKeys = {
  members: ['members'] as const,
  clubsMine: (memberPublicId: string) =>
    ['clubs', 'mine', memberPublicId] as const,
  clubMembers: (clubPublicId: string) =>
    ['clubs', clubPublicId, 'members'] as const,
  /** status 미지정(전체)은 'ALL' 세그먼트로 캐시 분리 */
  books: (clubPublicId: string, status?: string) =>
    ['books', 'list', clubPublicId, status ?? 'ALL'] as const,
  booksRoot: (clubPublicId: string) => ['books', 'list', clubPublicId] as const,
  /** 클럽 id가 없는 컨텍스트(책 수정·코멘트 변경)에서 책 목록 광역 무효화용 */
  booksAll: ['books', 'list'] as const,
  book: (bookPublicId: string) => ['books', bookPublicId] as const,
  ordersMine: (memberPublicId: string) =>
    ['orders', 'mine', memberPublicId] as const,
  ordersMineRoot: ['orders', 'mine'] as const,
  comments: (bookPublicId: string) =>
    ['books', bookPublicId, 'comments'] as const,
  commentsMine: (memberPublicId: string) =>
    ['comments', 'mine', memberPublicId] as const,
  commentsMineRoot: ['comments', 'mine'] as const,
} as const;
