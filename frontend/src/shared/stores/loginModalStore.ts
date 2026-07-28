import { create } from 'zustand';

/** 로그인(계정 선택) 모달 열림 상태 — GNB 버튼·랜딩 CTA가 함께 사용 */
interface LoginModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
