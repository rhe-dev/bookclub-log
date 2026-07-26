import type { MemberSummary } from './member';

export type ClubRole = 'LEADER' | 'MEMBER';

/** GET /clubs 항목 */
export interface Club {
  publicId: string;
  name: string;
  description: string;
  memberCount: number;
  createdAt: string;
}

/** GET /clubs/:id/members 항목 — 입장 화면 프로필 선택용 */
export interface ClubMember extends MemberSummary {
  role: ClubRole;
  joinedAt: string;
}
