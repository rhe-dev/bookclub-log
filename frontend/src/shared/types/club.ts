import type { components } from './api.generated';

/** GET /clubs/mine 항목 — 내가 가입한 클럽 + 클럽별 역할 */
export type MyClub = components['schemas']['MyClubResponse'];

/** GET /admin/clubs 항목 — 운영자 필터·회원 관리용 */
export type AdminClub = components['schemas']['AdminClubResponse'];

/** GET /clubs/:id/members 항목 — 입장 화면 프로필 선택용 */
export type ClubMember = components['schemas']['ClubMemberResponse'];

export type ClubRole = ClubMember['role'];

/** 운영자 클럽 상세 */
export type AdminClubDetail = components['schemas']['AdminClubDetailResponse'];
