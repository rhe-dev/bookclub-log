import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/shared/constants/queryKeys';
import type { CreateOrderBody, Order } from '@/shared/types/order';
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
};

export const useCreateOrderMutation = (clubPublicId?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateOrderBody) =>
      orderApi.createOrder(clubPublicId as string, body),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.ordersMine });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminOrders });
    },
  });
};
