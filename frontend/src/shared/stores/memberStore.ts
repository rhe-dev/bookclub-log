import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClubRole } from '@/shared/types/club';
import type { MemberSummary } from '@/shared/types/member';

/** 현재 입장한 클럽 컨텍스트 — 역할은 클럽마다 다를 수 있다 (D-024) */
export interface CurrentClub {
  publicId: string;
  name: string;
  role: ClubRole;
}

interface SessionState {
  /** 로그인 모달에서 선택한 현재 멤버(사람) — 세션(localStorage) 기준 */
  member: MemberSummary | null;
  /** 지금 보고 있는 클럽 — GNB 멤버 메뉴에서 전환 */
  club: CurrentClub | null;
  login: (member: MemberSummary, club: CurrentClub) => void;
  switchClub: (club: CurrentClub) => void;
  logout: () => void;
}

export const useMemberStore = create<SessionState>()(
  persist(
    (set) => ({
      member: null,
      club: null,
      login: (member, club) => set({ member, club }),
      switchClub: (club) => set({ club }),
      logout: () => set({ member: null, club: null }),
    }),
    // 세션 = 멤버 + 클럽으로 개편하며 키 변경 — 구버전 저장값은 무시된다
    { name: 'bookclub-session' },
  ),
);
