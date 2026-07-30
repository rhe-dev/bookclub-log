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
  ): Promise<OrderEstimate> => {
    const { data } = await axiosClient.post<OrderEstimate>(
      `/clubs/${clubPublicId}/orders/estimate`,
      // 부수는 보내지 않는다 — 금액은 1부 단가에 프론트가 곱한다
      { bookIds },
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
 * 문집 견적 — 분량·판형별 제작 가능 여부·1부 단가·예상 수령일 (D-035).
 *
 * 쪽수 산출과 판형 규칙은 서버에만 두고, 화면은 결과만 받아 쓴다.
 *
 * **자동으로 부르지 않는다**(`enabled: false`). 책을 고를 때마다 요청이 나가면 선택 한 번에
 * 한 번씩 서버를 부르게 된다. 수록 책이 확정되는 시점('다음' 클릭)에 `refetch()`로 한 번만
 * 부르고, 이후 단계는 그 결과를 그대로 쓴다. 부수는 금액에만 비례하므로 요청에 넣지 않고
 * 화면에서 곱한다 — 입력 도중의 값(예: 1555)으로 요청이 나가는 일도 없어진다.
 */
export const useOrderEstimateQuery = (
  clubPublicId: string | undefined,
  bookIds: string[],
) =>
  useQuery({
    queryKey: queryKeys.orderEstimate(clubPublicId ?? '', bookIds),
    queryFn: () => orderApi.estimate(clubPublicId as string, bookIds),
    enabled: false,
    // 수록 책이 그대로면 단계를 오갈 때 다시 부르지 않는다
    staleTime: Infinity,
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
