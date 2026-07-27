import { MemberSummaryResponse } from '../../../../shared/dto/member-summary.response';
import { PageMetaResponse } from '../../../../shared/dto/page-meta.response';

/**
 * 코멘트·답글 공통 응답.
 * deleted=true(답글이 남아 자리만 유지)면 member·content 등은 null.
 */
export class CommentResponse {
  publicId: string;
  deleted: boolean;
  member: MemberSummaryResponse | null;
  page: number | null;
  quote: string | null;
  content: string | null;
  createdAt: Date;
  updatedAt: Date | null;
  isEdited: boolean;
  likeCount: number;
  /** 요청 멤버(X-Member-Id)가 공감했는지 */
  likedByMe: boolean;
}

/** POST /comments/:id/like 응답 — 토글 결과 */
export class CommentLikeResponse {
  liked: boolean;
  likeCount: number;
}

export class CommentThreadResponse extends CommentResponse {
  replies: CommentResponse[];
}

export class PaginatedCommentsResponse {
  items: CommentThreadResponse[];
  meta: PageMetaResponse;
}
