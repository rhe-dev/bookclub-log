import type { MemberSummary } from './member';

export type BookStatus = 'UPCOMING' | 'READING' | 'DONE';

/** GET /clubs/:id/books 항목 · GET /books/:id 응답 */
export interface Book {
  publicId: string;
  title: string;
  author: string;
  publisher: string | null;
  coverColor: string;
  coverEmoji: string;
  status: BookStatus;
  meetingDate: string | null;
  periodFrom: string | null;
  periodTo: string | null;
  createdAt: string;
  updatedAt: string;
  participants: MemberSummary[];
  commentCount: number;
}

/** POST /clubs/:id/books 바디 */
export interface CreateBookBody {
  title: string;
  author: string;
  publisher?: string | null;
  coverColor: string;
  coverEmoji: string;
  status?: BookStatus;
  meetingDate?: string | null;
  periodFrom?: string | null;
  periodTo?: string | null;
  participantIds?: string[];
}

/** PATCH /books/:id 바디 — null은 해당 값 해제 */
export type UpdateBookBody = Partial<CreateBookBody>;
