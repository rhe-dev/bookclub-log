'use client';

// 운영자 주문 관리 — 목록·필터(상태/클럽/검색/정렬)·상세(이력·사유)·단계 진행·CSV (PLAN 화면 6, D-029)
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { Skeleton, Stack, Tooltip } from '@mui/material';
import {
  buildAdminOrdersCsvUrl,
  useAdminClubsQuery,
  useAdminOrdersQuery,
} from '@/shared/api/adminApi';
import { CommonContainer } from '@/shared/components/layout/CommonContainer';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonEmptyState } from '@/shared/components/ui/CommonEmptyState';
import { CommonPagination } from '@/shared/components/ui/CommonPagination';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { useRequireAdmin } from '@/shared/hooks/useRequireAdmin';
import { useAdminFilterStore } from '@/shared/stores/adminFilterStore';
import { colorChips } from '@/shared/styles/colors';
import { useState } from 'react';
import { AdminBulkActionBar } from './components/AdminBulkActionBar';
import { AdminOrderDetailModal } from './components/AdminOrderDetailModal';
import { AdminOrderFilterBar } from './components/AdminOrderFilterBar';
import { AdminOrderTable } from './components/AdminOrderTable';

export default function AdminOrdersPage() {
  const isAdmin = useRequireAdmin();
  // 필터·페이지는 화면 밖(스토어)에 둬서 다른 메뉴에 갔다 와도 유지된다
  const filters = useAdminFilterStore((s) => s.orderFilters);
  const page = useAdminFilterStore((s) => s.orderPage);
  const setFilters = useAdminFilterStore((s) => s.setOrderFilters);
  const setPage = useAdminFilterStore((s) => s.setOrderPage);
  const pageSize = useAdminFilterStore((s) => s.orderPageSize);
  const setPageSize = useAdminFilterStore((s) => s.setOrderPageSize);
  const resetFilters = useAdminFilterStore((s) => s.resetOrderFilters);
  // 상세는 id로만 들고 있는다 — 목록이 갱신되면 모달 내용도 함께 최신이 되도록
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const ordersQuery = useAdminOrdersQuery(page, pageSize, filters);
  const clubsQuery = useAdminClubsQuery();

  if (!isAdmin) return null;

  const orders = ordersQuery.data?.items ?? [];
  const totalCount = ordersQuery.data?.meta.totalCount ?? 0;
  const selected =
    orders.find((order) => order.publicId === selectedId) ?? null;
  const selectedOrders = orders.filter((order) =>
    selectedIds.includes(order.publicId),
  );

  const toggleSelect = (orderPublicId: string) =>
    setSelectedIds((prev) =>
      prev.includes(orderPublicId)
        ? prev.filter((id) => id !== orderPublicId)
        : [...prev, orderPublicId],
    );
  const toggleSelectAll = () =>
    setSelectedIds((prev) =>
      prev.length === orders.length ? [] : orders.map((o) => o.publicId),
    );
  const downloadCsv = (scope?: {
    type: 'selected' | 'page';
    orderIds: string[];
  }) => {
    window.location.href = buildAdminOrdersCsvUrl(filters, scope);
  };

  return (
    <CommonContainer maxWidth={1600} sx={{ py: { xs: 3, md: 5 } }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'center' },
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
          <Typo token="text_b_24" sx={{ fontSize: { xs: 20, md: 24 } }}>
            주문 관리
          </Typo>
          <Typo token="text_m_12" color={colorChips.grayScale[500]}>
            {totalCount}건
          </Typo>
        </Stack>
        {/* 무엇을 받는지 건수로 구분 — 이 페이지만 / 필터에 걸린 전체 */}
        <Stack direction="row" spacing={1}>
          <Tooltip
            title="지금 보이는 페이지의 주문만 내려받아요."
            placement="top"
          >
            <span>
              <CommonButton
                label={`이 페이지 CSV (${orders.length}건)`}
                buttonColor="tertiary"
                buttonVariant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={() =>
                  downloadCsv({
                    type: 'page',
                    orderIds: orders.map((o) => o.publicId),
                  })
                }
              />
            </span>
          </Tooltip>
          <Tooltip
            title="현재 필터에 걸린 모든 페이지의 주문을 내려받아요."
            placement="top"
          >
            <span>
              <CommonButton
                label={`필터 전체 CSV (${totalCount}건)`}
                buttonColor="tertiary"
                startIcon={<DownloadRoundedIcon />}
                onClick={() => downloadCsv()}
              />
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      <VerticalGap size={16} />

      <AdminOrderFilterBar
        filters={filters}
        clubs={clubsQuery.data}
        onChange={setFilters}
        onReset={resetFilters}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      <VerticalGap size={16} />

      {ordersQuery.isError ? (
        <ErrorView
          message="주문 목록을 불러오지 못했어요."
          onRetry={() => void ordersQuery.refetch()}
        />
      ) : ordersQuery.isLoading ? (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={52} />
          ))}
        </Stack>
      ) : orders.length === 0 ? (
        <CommonEmptyState message="조건에 맞는 주문이 없어요." />
      ) : (
        <>
          <AdminBulkActionBar
            selectedOrders={selectedOrders}
            onClearSelection={() => setSelectedIds([])}
            onDownloadSelected={() =>
              downloadCsv({ type: 'selected', orderIds: selectedIds })
            }
          />
          {selectedOrders.length > 0 && <VerticalGap size={12} />}
          <AdminOrderTable
            orders={orders}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onSelect={(order) => setSelectedId(order.publicId)}
          />
        </>
      )}

      <CommonPagination
        page={page}
        totalCount={totalCount}
        pageSize={pageSize}
        onChange={setPage}
      />

      <AdminOrderDetailModal
        order={selected}
        onClose={() => setSelectedId(null)}
      />
    </CommonContainer>
  );
}
