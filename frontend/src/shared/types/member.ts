import type { components } from './api.generated';

/** API 응답에 공통으로 실리는 멤버 요약 */
export type MemberSummary = components['schemas']['MemberSummaryResponse'];

/** GET /members 항목 — 로그인(계정 선택) 모달용, 가입 클럽·역할 포함 */
export type MemberAccount = components['schemas']['MemberAccountResponse'];

/** 운영자 회원 목록 한 줄 */
export type AdminMember = components['schemas']['AdminMemberResponse'];

/** 운영자 회원 상세 */
export type AdminMemberDetail =
  components['schemas']['AdminMemberDetailResponse'];
