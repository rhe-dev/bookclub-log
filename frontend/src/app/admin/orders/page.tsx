'use client';

// 운영자 주문 관리 — 목록·필터(상태/클럽/검색/정렬)·상세(이력·사유)·단계 진행·CSV (PLAN 화면 6, D-029)
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { Chip, Skeleton, Stack, Tooltip } from '@mui/material';
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
import { ROUTES } from '@/shared/constants/routes';
import { useRequireAdmin } from '@/shared/hooks/useRequireAdmin';
import { colorChips } from '@/shared/styles/colors';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useAdminOrderParams } from '../adminListParams';
import { AdminBulkActionBar } from './components/AdminBulkActionBar';
import { AdminOrderFilterBar } from './components/AdminOrderFilterBar';
import { AdminOrderTable } from './components/AdminOrderTable';

// useSearchParams(필터를 URL에 두는 D-038)는 Suspense 경계가 필요하다 —
// 없으면 프로덕션 빌드의 프리렌더가 실패한다. 페이지는 래퍼만 두고 본문은 아래 컴포넌트
export default function AdminOrdersPage() {
  return (
    <Suspense fallback={null}>
      <AdminOrdersContent />
    </Suspense>
  );
}

function AdminOrdersContent() {
  const isAdmin = useRequireAdmin();
  const router = useRouter();
  // 필터는 URL 쿼리가 단일 소스 — 조합을 링크로 공유할 수 있어야 한다
  const {
    filters,
    page,
    limit: pageSize,
    setFilters,
    setPage,
    setLimit: setPageSize,
    reset: resetFilters,
  } = useAdminOrderParams();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const ordersQuery = useAdminOrdersQuery(page, pageSize, filters);
  const clubsQuery = useAdminClubsQuery();

  if (!isAdmin) return null;

  const orders = ordersQuery.data?.items ?? [];
  const totalCount = ordersQuery.data?.meta.totalCount ?? 0;
  const activeClub = clubsQuery.data?.find(
    (club) => club.publicId === filters.clubId,
  );
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
        {/* 좁은 화면에선 두 버튼이 한 줄에 안 들어가 가로 스크롤이 생긴다 */}
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
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
        onChange={setFilters}
        onReset={resetFilters}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
      />

      {/* 클럽 상세에서 넘어온 좁히기 — 지우면 전체 주문으로 돌아간다 */}
      {filters.clubId && (
        <>
          <VerticalGap size={12} />
          <Chip
            label={`클럽 · ${activeClub?.name ?? filters.clubId}`}
            onDelete={() => setFilters({ ...filters, clubId: undefined })}
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          />
        </>
      )}

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
            onSelect={(order) =>
              router.push(ROUTES.adminOrderDetail(order.publicId))
            }
          />
        </>
      )}

      <CommonPagination
        page={page}
        totalCount={totalCount}
        pageSize={pageSize}
        onChange={setPage}
      />
    </CommonContainer>
  );
}
