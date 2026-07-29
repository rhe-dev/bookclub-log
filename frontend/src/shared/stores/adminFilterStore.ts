import { create } from 'zustand';
import type { AdminOrderFilters } from '@/shared/api/adminApi';

export const DEFAULT_ADMIN_ORDER_FILTERS: AdminOrderFilters = { sort: 'latest' };

interface AdminFilterState {
  /** 주문 관리 필터 — 다른 메뉴에 갔다 돌아와도 유지되도록 화면 밖에 둔다 */
  orderFilters: AdminOrderFilters;
  orderPage: number;
  setOrderFilters: (next: AdminOrderFilters) => void;
  setOrderPage: (page: number) => void;
  resetOrderFilters: () => void;
}

export const useAdminFilterStore = create<AdminFilterState>((set) => ({
  orderFilters: DEFAULT_ADMIN_ORDER_FILTERS,
  orderPage: 1,
  // 필터가 바뀌면 항상 1페이지부터 — 남은 페이지 번호로 빈 화면이 되지 않게
  setOrderFilters: (next) => set({ orderFilters: next, orderPage: 1 }),
  setOrderPage: (orderPage) => set({ orderPage }),
  resetOrderFilters: () =>
    set({ orderFilters: DEFAULT_ADMIN_ORDER_FILTERS, orderPage: 1 }),
}));
