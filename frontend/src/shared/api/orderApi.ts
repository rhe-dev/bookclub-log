import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { Paginated } from '@/shared/types/common';
import type {
  CreateOrderBody,
  Order,
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
  getMyOrders: async (): Promise<Paginated<Order>> => {
    const { data } = await axiosClient.get<Paginated<Order>>('/orders/mine', {
      params: { limit: 50 },
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

export const useMyOrdersQuery = (memberPublicId?: string) =>
  useQuery({
    queryKey: queryKeys.ordersMine(memberPublicId ?? ''),
    queryFn: orderApi.getMyOrders,
    enabled: Boolean(memberPublicId),
  });

const useInvalidateOrders = () => {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: queryKeys.ordersMineRoot });
    void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders });
  };
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
