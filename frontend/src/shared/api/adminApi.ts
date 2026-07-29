import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { AdminClub } from '@/shared/types/club';
import type { Paginated } from '@/shared/types/common';
import type { AdminOrder, OrderStatus } from '@/shared/types/order';
import { API_BASE_URL, axiosClient } from './axiosClient';

export const ADMIN_ORDERS_PAGE_SIZE = 10;

/** 주문 목록 필터 — 화면·CSV가 같은 조건을 공유한다 */
export interface AdminOrderFilters {
  status?: OrderStatus;
  clubId?: string;
  q?: string;
  /** 주문일 기간 (YYYY-MM-DD) */
  from?: string;
  to?: string;
  /** 운영자 처리가 필요한 건만 — 신규 접수·환불/재제작 요청 */
  actionRequired?: boolean;
  sort?: 'latest' | 'oldest' | 'changed_latest' | 'changed_oldest';
}

const toParams = (filters: AdminOrderFilters) => ({
  status: filters.status,
  clubId: filters.clubId || undefined,
  q: filters.q?.trim() || undefined,
  from: filters.from || undefined,
  to: filters.to || undefined,
  actionRequired: filters.actionRequired ? 'true' : undefined,
  sort: filters.sort,
});

/**
 * CSV 다운로드 링크 — 서버가 필터·날짜를 파일명에 담아 내려준다.
 * orderIds를 주면 선택한 건만, 없으면 현재 필터 전체(모든 페이지)를 받는다.
 */
export const buildAdminOrdersCsvUrl = (
  filters: AdminOrderFilters,
  scope?: { type: 'selected' | 'page'; orderIds: string[] },
) => {
  const params = new URLSearchParams();
  if (scope?.orderIds.length) {
    params.set('ids', scope.orderIds.join(','));
    params.set('scope', scope.type);
  } else {
    Object.entries(toParams(filters)).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
  }
  const query = params.toString();
  return `${API_BASE_URL}/admin/orders/csv${query ? `?${query}` : ''}`;
};

export const adminApi = {
  getOrders: async (
    page: number,
    filters: AdminOrderFilters,
  ): Promise<Paginated<AdminOrder>> => {
    const { data } = await axiosClient.get<Paginated<AdminOrder>>(
      '/admin/orders',
      {
        params: { page, limit: ADMIN_ORDERS_PAGE_SIZE, ...toParams(filters) },
        skipErrorToast: true,
      },
    );
    return data;
  },
  getClubs: async (): Promise<AdminClub[]> => {
    const { data } = await axiosClient.get<AdminClub[]>('/admin/clubs', {
      skipErrorToast: true,
    });
    return data;
  },
  transitionOrder: async (
    orderPublicId: string,
    toStatus: OrderStatus,
    adminNote?: string,
  ): Promise<AdminOrder> => {
    const { data } = await axiosClient.post<AdminOrder>(
      `/admin/orders/${orderPublicId}/transition`,
      { toStatus, adminNote },
    );
    return data;
  },
  bulkTransition: async (
    orderIds: string[],
    toStatus: OrderStatus,
    adminNote?: string,
  ): Promise<BulkTransitionResult> => {
    const { data } = await axiosClient.post<BulkTransitionResult>(
      '/admin/orders/bulk-transition',
      { orderIds, toStatus, adminNote },
    );
    return data;
  },
};

/** 일괄 전이 결과 — 실패 건은 건너뛰고 결과로 돌려받는다 */
export interface BulkTransitionResult {
  succeeded: string[];
  failed: { orderId: string; code: string }[];
}

export const useAdminOrdersQuery = (page: number, filters: AdminOrderFilters) =>
  useQuery({
    queryKey: queryKeys.adminOrders(page, filters),
    queryFn: () => adminApi.getOrders(page, filters),
    placeholderData: keepPreviousData,
  });

/** 클럽 필터 드롭다운용 목록 */
export const useAdminClubsQuery = () =>
  useQuery({ queryKey: queryKeys.adminClubs, queryFn: adminApi.getClubs });

const useInvalidateAdminOrders = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrdersRoot });
    void queryClient.invalidateQueries({ queryKey: queryKeys.ordersMineRoot });
  };
};

/** 운영자 단계 진행 — 성공 시 목록과 회원 화면의 주문 캐시를 함께 무효화 */
export const useAdminTransitionMutation = () => {
  const invalidate = useInvalidateAdminOrders();
  return useMutation({
    mutationFn: ({
      orderPublicId,
      toStatus,
      adminNote,
    }: {
      orderPublicId: string;
      toStatus: OrderStatus;
      adminNote?: string;
    }) => adminApi.transitionOrder(orderPublicId, toStatus, adminNote),
    onSuccess: invalidate,
  });
};

/** 선택한 주문을 같은 단계로 일괄 진행 */
export const useAdminBulkTransitionMutation = () => {
  const invalidate = useInvalidateAdminOrders();
  return useMutation({
    mutationFn: ({
      orderIds,
      toStatus,
      adminNote,
    }: {
      orderIds: string[];
      toStatus: OrderStatus;
      adminNote?: string;
    }) => adminApi.bulkTransition(orderIds, toStatus, adminNote),
    onSuccess: invalidate,
  });
};

/** 처리 대기 건수 — GNB 배지용 (목록과 별개로 가볍게 조회) */
export const useAdminPendingCountQuery = (enabled: boolean) =>
  useQuery({
    queryKey: queryKeys.adminPendingCount,
    queryFn: async () => {
      const data = await adminApi.getOrders(1, { actionRequired: true });
      return data.meta.totalCount;
    },
    enabled,
  });
