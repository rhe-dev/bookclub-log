import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { AdminClub, AdminClubDetail } from '@/shared/types/club';
import type { AdminMember, AdminMemberDetail } from '@/shared/types/member';
import type { Paginated } from '@/shared/types/common';
import type {
  AdminOrder,
  OrderProductionCheck,
  OrderStatus,
  VendorEvent,
} from '@/shared/types/order';
import { API_BASE_URL, axiosClient } from './axiosClient';

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

const adminApi = {
  getOrder: async (orderPublicId: string): Promise<AdminOrder> => {
    const { data } = await axiosClient.get<AdminOrder>(
      `/admin/orders/${orderPublicId}`,
      { skipErrorToast: true },
    );
    return data;
  },
  getMembers: async (
    page: number,
    limit: number,
    filters: AdminMemberFilters,
  ): Promise<Paginated<AdminMember>> => {
    const { data } = await axiosClient.get<Paginated<AdminMember>>(
      '/admin/members',
      {
        params: {
          page,
          limit,
          clubId: filters.clubId,
          q: filters.q?.trim() || undefined,
          from: filters.from || undefined,
          to: filters.to || undefined,
        },
        skipErrorToast: true,
      },
    );
    return data;
  },
  getMember: async (memberPublicId: string): Promise<AdminMemberDetail> => {
    const { data } = await axiosClient.get<AdminMemberDetail>(
      `/admin/members/${memberPublicId}`,
      { skipErrorToast: true },
    );
    return data;
  },
  updateMemberNote: async (memberPublicId: string, note: string) => {
    const { data } = await axiosClient.patch<{ adminNote: string | null }>(
      `/admin/members/${memberPublicId}/note`,
      { note },
    );
    return data;
  },
  getClub: async (clubPublicId: string): Promise<AdminClubDetail> => {
    const { data } = await axiosClient.get<AdminClubDetail>(
      `/admin/clubs/${clubPublicId}`,
      { skipErrorToast: true },
    );
    return data;
  },
  updateClubNote: async (clubPublicId: string, note: string) => {
    const { data } = await axiosClient.patch<{ adminNote: string | null }>(
      `/admin/clubs/${clubPublicId}/note`,
      { note },
    );
    return data;
  },
  getProduction: async (
    orderPublicId: string,
  ): Promise<OrderProductionCheck> => {
    const { data } = await axiosClient.get<OrderProductionCheck>(
      `/admin/orders/${orderPublicId}/production`,
    );
    return data;
  },
  dispatch: async (
    orderPublicId: string,
    adminNote?: string,
  ): Promise<AdminOrder> => {
    const { data } = await axiosClient.post<AdminOrder>(
      `/admin/orders/${orderPublicId}/production`,
      { adminNote },
    );
    return data;
  },
  receiveVendorEvent: async (
    orderPublicId: string,
    event: VendorEvent,
  ): Promise<AdminOrder> => {
    const { data } = await axiosClient.post<AdminOrder>(
      `/admin/orders/${orderPublicId}/vendor-events`,
      { event },
    );
    return data;
  },
  getOrders: async (
    page: number,
    limit: number,
    filters: AdminOrderFilters,
  ): Promise<Paginated<AdminOrder>> => {
    const { data } = await axiosClient.get<Paginated<AdminOrder>>(
      '/admin/orders',
      {
        params: { page, limit, ...toParams(filters) },
        skipErrorToast: true,
      },
    );
    return data;
  },
  getClubs: async (filters: AdminClubFilters = {}): Promise<AdminClub[]> => {
    const { data } = await axiosClient.get<AdminClub[]>('/admin/clubs', {
      params: {
        q: filters.q?.trim() || undefined,
        from: filters.from || undefined,
        to: filters.to || undefined,
      },
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

export const useAdminOrdersQuery = (
  page: number,
  limit: number,
  filters: AdminOrderFilters,
) =>
  useQuery({
    queryKey: queryKeys.adminOrders(page, limit, filters),
    queryFn: () => adminApi.getOrders(page, limit, filters),
    placeholderData: keepPreviousData,
  });

/** 모임 목록 — 필터 없이 부르면 주문 관리의 모임 드롭다운용 전체 목록 */
export const useAdminClubsQuery = (filters: AdminClubFilters = {}) =>
  useQuery({
    queryKey: queryKeys.adminClubs(filters),
    queryFn: () => adminApi.getClubs(filters),
  });

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

/**
 * 발주 전 사양 재확인 — 주문 당시 쪽수와 지금 다시 계산한 쪽수를 함께 받는다 (D-035).
 * 주문 뒤 코멘트가 바뀌면 제작처가 거부할 수 있어, 발주 직전에 한 번 더 본다.
 */
export const useAdminProductionQuery = (orderPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.adminProduction(orderPublicId ?? ''),
    queryFn: () => adminApi.getProduction(orderPublicId as string),
    enabled: Boolean(orderPublicId),
  });

/** 북프린트 발주 — 이 시점에 제작이 시작되고 주문자 취소가 닫힌다 (D-034) */
export const useAdminDispatchMutation = (orderPublicId?: string) => {
  const invalidate = useInvalidateAdminOrders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (adminNote?: string) =>
      adminApi.dispatch(orderPublicId as string, adminNote),
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminProduction(orderPublicId ?? ''),
      });
    },
  });
};

/** 제작처 이벤트 수신 (데모 시뮬레이터) — 실제로는 웹훅이 들어오는 경로 */
export const useAdminVendorEventMutation = (orderPublicId?: string) => {
  const invalidate = useInvalidateAdminOrders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (event: VendorEvent) =>
      adminApi.receiveVendorEvent(orderPublicId as string, event),
    onSuccess: () => {
      invalidate();
      void queryClient.invalidateQueries({
        queryKey: queryKeys.adminProduction(orderPublicId ?? ''),
      });
    },
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
      // 건수만 필요해 1건만 받아 meta로 읽는다
      const data = await adminApi.getOrders(1, 1, { actionRequired: true });
      return data.meta.totalCount;
    },
    enabled,
  });

/** 회원 목록 필터 — 모임 목록 화면을 두지 않고 이 필터로 '이 모임의 회원들'을 본다 */
export interface AdminMemberFilters {
  clubId?: string;
  q?: string;
  /** 가입일 범위 (YYYY-MM-DD) */
  from?: string;
  to?: string;
}

/** 모임 목록 필터 — 드롭다운용 호출은 필터 없이 부른다 */
export interface AdminClubFilters {
  q?: string;
  from?: string;
  to?: string;
}

export const useAdminOrderQuery = (orderPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.adminOrder(orderPublicId ?? ''),
    queryFn: () => adminApi.getOrder(orderPublicId as string),
    enabled: Boolean(orderPublicId),
  });

export const useAdminMembersQuery = (
  page: number,
  limit: number,
  filters: AdminMemberFilters,
) =>
  useQuery({
    queryKey: queryKeys.adminMembers(page, limit, filters),
    queryFn: () => adminApi.getMembers(page, limit, filters),
    placeholderData: keepPreviousData,
  });

export const useAdminMemberQuery = (memberPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.adminMember(memberPublicId ?? ''),
    queryFn: () => adminApi.getMember(memberPublicId as string),
    enabled: Boolean(memberPublicId),
  });

export const useAdminClubQuery = (clubPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.adminClub(clubPublicId ?? ''),
    queryFn: () => adminApi.getClub(clubPublicId as string),
    enabled: Boolean(clubPublicId),
  });

/** 운영자 메모 저장 — 회원·모임이 같은 계약을 쓴다 */
export const useAdminNoteMutation = (
  target: 'member' | 'club',
  publicId?: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (note: string) =>
      target === 'member'
        ? adminApi.updateMemberNote(publicId as string, note)
        : adminApi.updateClubNote(publicId as string, note),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey:
          target === 'member'
            ? queryKeys.adminMember(publicId ?? '')
            : queryKeys.adminClub(publicId ?? ''),
      });
      // 목록의 '메모 있음' 표시도 함께 갱신
      if (target === 'member')
        void queryClient.invalidateQueries({
          queryKey: queryKeys.adminMembersRoot,
        });
    },
  });
};
