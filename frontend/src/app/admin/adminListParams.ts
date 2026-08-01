'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { AdminOrderFilters } from '@/shared/api/adminApi';
import { ADMIN_ORDERS_PAGE_SIZE } from '@/shared/constants/adminOrders';
import type { OrderStatus } from '@/shared/types/order';
import { useAdminFilterStore } from '@/shared/stores/adminFilterStore';

/**
 * 운영자 목록 화면의 필터를 URL 쿼리에 둔다.
 *
 * 필터 조합을 링크로 주고받을 수 있어야 한다 — "처리 대기만, 밑줄과 여백, 이번 주"를
 * 동료에게 보낼 때 화면 상태를 말로 설명하지 않아도 되게. 브라우저 뒤로 가기로
 * 이전 필터가 되살아나는 것도 URL을 쓸 때 공짜로 따라온다.
 *
 * 다른 메뉴에 갔다 돌아와도 필터가 유지되도록, 마지막 쿼리스트링은 스토어가 기억하고
 * GNB 링크가 그것을 붙인다 (URL이 단일 소스, 스토어는 '최근 위치' 기억용).
 */

const asString = (value: string | null) => value || undefined;

export const useAdminOrderParams = () => {
  const searchParams = useSearchParams();
  const apply = useApplyParams('orders');

  const filters: AdminOrderFilters = {
    status: (asString(searchParams.get('status')) as OrderStatus) ?? undefined,
    clubId: asString(searchParams.get('clubId')),
    q: asString(searchParams.get('q')),
    from: asString(searchParams.get('from')),
    to: asString(searchParams.get('to')),
    actionRequired: searchParams.get('actionRequired') === 'true' || undefined,
    sort:
      (asString(searchParams.get('sort')) as AdminOrderFilters['sort']) ??
      'latest',
  };
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || ADMIN_ORDERS_PAGE_SIZE;

  return {
    filters,
    page,
    limit,
    // 필터·페이지 크기가 바뀌면 항상 1페이지부터 — 남은 페이지 번호로 빈 화면이 되지 않게
    setFilters: (next: AdminOrderFilters) =>
      apply({ ...next, page: undefined, limit }),
    setPage: (next: number) => apply({ ...filters, limit, page: next }),
    setLimit: (next: number) =>
      apply({ ...filters, limit: next, page: undefined }),
    reset: () => apply({ sort: 'latest', limit }),
  };
};

export const useAdminMemberParams = () => {
  const searchParams = useSearchParams();
  const apply = useApplyParams('members');

  const clubId = asString(searchParams.get('clubId'));
  const q = asString(searchParams.get('q'));
  const from = asString(searchParams.get('from'));
  const to = asString(searchParams.get('to'));
  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || ADMIN_ORDERS_PAGE_SIZE;
  const base = { clubId, q, from, to, limit };

  return {
    clubId,
    q,
    from,
    to,
    page,
    limit,
    search: (next?: string) => apply({ ...base, q: next }),
    setPeriod: (next: { from?: string; to?: string }) =>
      apply({ ...base, ...next }),
    clearClub: () => apply({ ...base, clubId: undefined }),
    reset: () => apply({ limit }),
    setPage: (next: number) => apply({ ...base, page: next }),
    setLimit: (next: number) => apply({ ...base, limit: next }),
  };
};

/** 모임 목록 — 페이지네이션 예외라 검색·기간만 (D-026) */
export const useAdminClubParams = () => {
  const searchParams = useSearchParams();
  const apply = useApplyParams('clubs');

  const q = asString(searchParams.get('q'));
  const from = asString(searchParams.get('from'));
  const to = asString(searchParams.get('to'));

  return {
    q,
    from,
    to,
    search: (next?: string) => apply({ q: next, from, to }),
    setPeriod: (next: { from?: string; to?: string }) =>
      apply({ q, from, to, ...next }),
    reset: () => apply({}),
  };
};

/** 값이 있는 것만 쿼리로 남긴다 — 기본값이 URL을 채우면 공유 링크가 지저분해진다 */
function useApplyParams(menu: 'orders' | 'members' | 'clubs') {
  const router = useRouter();
  const pathname = usePathname();
  const remember = useAdminFilterStore((s) => s.rememberQuery);

  return useCallback(
    (values: Record<string, string | number | boolean | undefined>) => {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(values)) {
        if (value === undefined || value === '' || value === false) continue;
        // 기본값은 굳이 URL에 남기지 않는다
        if (key === 'page' && value === 1) continue;
        if (key === 'limit' && value === ADMIN_ORDERS_PAGE_SIZE) continue;
        if (key === 'sort' && value === 'latest') continue;
        params.set(key, String(value));
      }
      const query = params.toString();
      remember(menu, query);
      // replace — 필터 조작마다 히스토리가 쌓이면 뒤로 가기가 지옥이 된다
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [menu, pathname, remember, router],
  );
}
