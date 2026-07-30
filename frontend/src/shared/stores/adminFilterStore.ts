import { create } from 'zustand';

/**
 * 운영자 목록의 '최근 필터' 기억.
 *
 * 필터의 단일 소스는 URL 쿼리다(공유 가능해야 하므로). 이 스토어는 GNB로 다른 메뉴에
 * 갔다 돌아왔을 때 보던 조건을 되살리기 위해 마지막 쿼리스트링만 들고 있는다.
 */
interface AdminFilterState {
  lastQuery: { orders: string; members: string; clubs: string };
  rememberQuery: (menu: 'orders' | 'members' | 'clubs', query: string) => void;
}

export const useAdminFilterStore = create<AdminFilterState>((set) => ({
  lastQuery: { orders: '', members: '', clubs: '' },
  rememberQuery: (menu, query) =>
    set((state) => ({ lastQuery: { ...state.lastQuery, [menu]: query } })),
}));
