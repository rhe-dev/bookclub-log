import type { MemberSummary } from './member';

/**
 * 코멘트·답글 공통 형태.
 * deleted=true(답글이 남아 자리만 유지된 삭제 코멘트)면 member·content가 null.
 */
export interface Comment {
  publicId: string;
  deleted: boolean;
  member: MemberSummary | null;
  page: number | null;
  quote: string | null;
  content: string | null;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
}

/** GET /books/:id/comments 항목 — 코멘트 + 답글 1단계 */
export interface CommentThread extends Comment {
  replies: Comment[];
}

/** POST /books/:id/comments 바디 */
export interface CreateCommentBody {
  content: string;
  page?: number | null;
  quote?: string | null;
  parentId?: string;
}

/** PATCH /comments/:id 바디 — null은 앵커 해제 */
export interface UpdateCommentBody {
  content?: string;
  page?: number | null;
  quote?: string | null;
}
