import { create } from 'zustand';
import type { AdminOrderFilters } from '@/shared/api/adminApi';
import { ADMIN_ORDERS_PAGE_SIZE } from '@/shared/constants/adminOrders';

export const DEFAULT_ADMIN_ORDER_FILTERS: AdminOrderFilters = {
  sort: 'latest',
};

interface AdminFilterState {
  /** 주문 관리 필터 — 다른 메뉴에 갔다 돌아와도 유지되도록 화면 밖에 둔다 */
  orderFilters: AdminOrderFilters;
  orderPage: number;
  /** 한 페이지에 몇 건 볼지 — 운영자마다 화면 높이가 달라 고를 수 있게 한다 */
  orderPageSize: number;
  setOrderFilters: (next: AdminOrderFilters) => void;
  setOrderPage: (page: number) => void;
  setOrderPageSize: (limit: number) => void;
  resetOrderFilters: () => void;
}

export const useAdminFilterStore = create<AdminFilterState>((set) => ({
  orderFilters: DEFAULT_ADMIN_ORDER_FILTERS,
  orderPage: 1,
  orderPageSize: ADMIN_ORDERS_PAGE_SIZE,
  // 필터가 바뀌면 항상 1페이지부터 — 남은 페이지 번호로 빈 화면이 되지 않게
  setOrderFilters: (next) => set({ orderFilters: next, orderPage: 1 }),
  setOrderPage: (orderPage) => set({ orderPage }),
  // 페이지 크기를 바꾸면 보던 페이지 번호가 범위를 벗어날 수 있어 1페이지로
  setOrderPageSize: (orderPageSize) => set({ orderPageSize, orderPage: 1 }),
  resetOrderFilters: () =>
    set({ orderFilters: DEFAULT_ADMIN_ORDER_FILTERS, orderPage: 1 }),
}));
