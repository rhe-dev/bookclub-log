import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

/** 닫힘 애니메이션 지속 시간 */
export const TOAST_EXIT_DURATION = 300;
/** 자동 닫힘 기본 시간 */
const TOAST_AUTO_CLOSE_DURATION = 3000;

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  isExiting: boolean;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  dismissToast: (id: string) => void;
}

/** 큐 방식 — 새 토스트가 아래에 붙고 기존 토스트가 위로 쌓인다 */
export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  showToast: (message, type = 'info', duration = TOAST_AUTO_CLOSE_DURATION) => {
    // 같은 메시지가 아직 떠 있으면 다시 쌓지 않는다 — 리다이렉트 가드가 두 번 도는 경우 등
    const duplicated = get().toasts.some(
      (t) => t.message === message && !t.isExiting,
    );
    if (duplicated) return;
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    set((state) => ({
      toasts: [...state.toasts, { id, type, message, isExiting: false }],
    }));
    setTimeout(() => get().dismissToast(id), duration);
  },
  dismissToast: (id) => {
    const target = get().toasts.find((t) => t.id === id);
    if (!target || target.isExiting) return;
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, isExiting: true } : t,
      ),
    }));
    setTimeout(
      () =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      TOAST_EXIT_DURATION,
    );
  },
}));

/** React 밖(axios 에러 처리 등)에서도 쓸 수 있는 전역 헬퍼 */
export const toast = {
  success: (message: string) =>
    useToastStore.getState().showToast(message, 'success'),
  error: (message: string) =>
    useToastStore.getState().showToast(message, 'error'),
  info: (message: string) =>
    useToastStore.getState().showToast(message, 'info'),
};
