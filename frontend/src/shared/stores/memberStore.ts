import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClubRole } from '@/shared/types/club';
import type { MemberSummary } from '@/shared/types/member';

/** 현재 입장한 모임 컨텍스트 — 역할은 모임마다 다를 수 있다 (D-024) */
export interface CurrentClub {
  publicId: string;
  name: string;
  role: ClubRole;
}

interface SessionState {
  /** 로그인 모달에서 선택한 현재 멤버(사람) — 세션(localStorage) 기준 */
  member: MemberSummary | null;
  /** 지금 보고 있는 모임 — GNB 멤버 메뉴에서 전환 */
  club: CurrentClub | null;
  /** 운영자 모드 — 회원 세션과 배타적으로만 존재한다 (D-029) */
  isAdmin: boolean;
  login: (member: MemberSummary, club: CurrentClub) => void;
  loginAsAdmin: () => void;
  switchClub: (club: CurrentClub) => void;
  logout: () => void;
}

export const useMemberStore = create<SessionState>()(
  persist(
    (set) => ({
      member: null,
      club: null,
      isAdmin: false,
      login: (member, club) => set({ member, club, isAdmin: false }),
      loginAsAdmin: () => set({ member: null, club: null, isAdmin: true }),
      switchClub: (club) => set({ club }),
      logout: () => set({ member: null, club: null, isAdmin: false }),
    }),
    // 세션 = 멤버 + 모임으로 개편하며 키 변경 — 구버전 저장값은 무시된다
    { name: 'bookclub-session' },
  ),
);
