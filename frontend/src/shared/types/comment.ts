import type { components } from './api.generated';

/**
 * 코멘트·답글 공통 형태.
 * deleted=true(답글이 남아 자리만 유지된 삭제 코멘트)면 member·content가 null.
 */
export type Comment = components['schemas']['CommentResponse'];

/** GET /books/:id/comments 항목 — 코멘트 + 답글 1단계 */
export type CommentThread = components['schemas']['CommentThreadResponse'];

/** POST /books/:id/comments 바디 */
export type CreateCommentBody = components['schemas']['CreateCommentDto'];

/** PATCH /comments/:id 바디 — null은 앵커 해제 */
export type UpdateCommentBody = components['schemas']['UpdateCommentDto'];

/** GET /comments/mine 항목 — 마이페이지 내 코멘트 모아보기 */
export type MyComment = components['schemas']['MyCommentResponse'];

/** POST /comments/:id/like 응답 — 공감 토글 결과 */
export type CommentLikeResult = components['schemas']['CommentLikeResponse'];
