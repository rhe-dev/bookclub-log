import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClubRole } from '@/shared/types/club';
import type { MemberSummary } from '@/shared/types/member';

export interface CurrentMember extends MemberSummary {
  role: ClubRole;
}

interface MemberState {
  /** 입장 화면에서 선택한 현재 멤버 — 세션(localStorage) 기준 */
  member: CurrentMember | null;
  setMember: (member: CurrentMember) => void;
  clearMember: () => void;
}

export const useMemberStore = create<MemberState>()(
  persist(
    (set) => ({
      member: null,
      setMember: (member) => set({ member }),
      clearMember: () => set({ member: null }),
    }),
    { name: 'bookclub-current-member' },
  ),
);
