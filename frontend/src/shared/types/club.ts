import type { components } from './api.generated';

/** GET /clubs 항목 */
export type Club = components['schemas']['ClubResponse'];

/** GET /clubs/:id/members 항목 — 입장 화면 프로필 선택용 */
export type ClubMember = components['schemas']['ClubMemberResponse'];

export type ClubRole = ClubMember['role'];
