import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { Paginated } from '@/shared/types/common';
import type {
  CreateOrderBody,
  Order,
  OrderEstimate,
  TransitionOrderBody,
} from '@/shared/types/order';
import { axiosClient } from './axiosClient';

export const orderApi = {
  createOrder: async (
    clubPublicId: string,
    body: CreateOrderBody,
  ): Promise<Order> => {
    const { data } = await axiosClient.post<Order>(
      `/clubs/${clubPublicId}/orders`,
      body,
    );
    return data;
  },
  estimate: async (
    clubPublicId: string,
    bookIds: string[],
    copies: number,
  ): Promise<OrderEstimate> => {
    const { data } = await axiosClient.post<OrderEstimate>(
      `/clubs/${clubPublicId}/orders/estimate`,
      { bookIds, copies },
      // 분량 미달 등은 화면에서 안내로 보여준다 — 토스트로 반복 노출하지 않는다
      { skipErrorToast: true },
    );
    return data;
  },
  getMyOrders: async (page: number): Promise<Paginated<Order>> => {
    const { data } = await axiosClient.get<Paginated<Order>>('/orders/mine', {
      params: { page, limit: MY_ORDERS_PAGE_SIZE },
      skipErrorToast: true,
    });
    return data;
  },
  transitionMyOrder: async (
    orderPublicId: string,
    body: TransitionOrderBody,
  ): Promise<Order> => {
    const { data } = await axiosClient.post<Order>(
      `/orders/${orderPublicId}/transition`,
      body,
    );
    return data;
  },
};

export const MY_ORDERS_PAGE_SIZE = 10;

/** 내 주문 — 마이페이지 (번호 페이지네이션) */
export const useMyOrdersQuery = (memberPublicId?: string, page = 1) =>
  useQuery({
    queryKey: [...queryKeys.ordersMine(memberPublicId ?? ''), page],
    queryFn: () => orderApi.getMyOrders(page),
    placeholderData: keepPreviousData,
    enabled: Boolean(memberPublicId),
  });

/**
 * 문집 견적 — 수록 책·부수가 바뀌면 다시 계산한다 (D-035).
 * 쪽수 산출과 판형 규칙은 서버에만 두고, 화면은 결과만 받아 보여준다.
 */
export const useOrderEstimateQuery = (
  clubPublicId: string | undefined,
  bookIds: string[],
  copies: number,
) =>
  useQuery({
    queryKey: queryKeys.orderEstimate(clubPublicId ?? '', bookIds, copies),
    queryFn: () => orderApi.estimate(clubPublicId as string, bookIds, copies),
    // 부수만 바뀔 때 판형 카드가 빈 채로 깜빡이지 않게
    placeholderData: keepPreviousData,
    enabled: Boolean(clubPublicId) && bookIds.length > 0,
  });

const useInvalidateOrders = () => {
  const queryClient = useQueryClient();
  return () =>
    void queryClient.invalidateQueries({ queryKey: queryKeys.ordersMineRoot });
};

export const useCreateOrderMutation = (clubPublicId?: string) => {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: (body: CreateOrderBody) =>
      orderApi.createOrder(clubPublicId as string, body),
    onSuccess: invalidate,
  });
};

/** 주문자 전이 — 취소·구매 확정·환불/재제작 요청(사유 포함) */
export const useMyOrderTransitionMutation = () => {
  const invalidate = useInvalidateOrders();
  return useMutation({
    mutationFn: ({
      orderPublicId,
      ...body
    }: { orderPublicId: string } & TransitionOrderBody) =>
      orderApi.transitionMyOrder(orderPublicId, body),
    onSuccess: invalidate,
  });
};
