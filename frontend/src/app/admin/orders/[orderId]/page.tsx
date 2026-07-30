'use client';

// 운영자 주문 상세 — 모달이 아닌 페이지. 회원·클럽 상세와 오갈 수 있어야 하므로 (D-037)
import { Box, Skeleton, Stack } from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  useAdminOrderQuery,
  useAdminTransitionMutation,
} from '@/shared/api/adminApi';
import { BookCover } from '@/shared/components/book/BookCover';
import { OrderHistoryList } from '@/shared/components/order/OrderHistoryList';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { CopyableId } from '@/shared/components/ui/CopyableId';
import { ErrorView } from '@/shared/components/ui/ErrorView';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import {
  ORDER_STATUS_CHIP,
  ORDER_STATUS_LOG_LABEL,
} from '@/shared/constants/orderStatus';
import { ROUTES } from '@/shared/constants/routes';
import { useRequireAdmin } from '@/shared/hooks/useRequireAdmin';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { OrderStatus } from '@/shared/types/order';
import { formatDateTime } from '@/shared/utils/date';
import { AdminDetailShell } from '../../components/AdminDetailShell';
import { AdminBackLink } from '../../components/AdminBackLink';
import { AdminDispatchModal } from '../components/AdminDispatchModal';
import { AdminProductionPanel } from '../components/AdminProductionPanel';

/** 발주·제작처 웹훅으로만 움직이는 단계 — 운영자가 직접 누르지 않는다 (D-034) */
const VENDOR_DRIVEN_STATUSES: OrderStatus[] = [
  'IN_PRODUCTION',
  'PRODUCED',
  'SHIPPED',
  'DELIVERED',
];

export default function AdminOrderDetailPage() {
  const isAdmin = useRequireAdmin();
  const router = useRouter();
  const { orderId } = useParams<{ orderId: string }>();
  const {
    data: order,
    isLoading,
    isError,
    refetch,
  } = useAdminOrderQuery(orderId);
  const transitionMutation = useAdminTransitionMutation();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState('');
  const [dispatchOpen, setDispatchOpen] = useState(false);

  if (!isAdmin) return null;

  if (isError)
    return (
      <AdminDetailShell>
        <ErrorView
          message="주문을 불러오지 못했어요."
          onRetry={() => void refetch()}
        />
      </AdminDetailShell>
    );

  if (isLoading || !order)
    return (
      <AdminDetailShell>
        <Skeleton variant="rounded" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={220} />
      </AdminDetailShell>
    );

  const chip = ORDER_STATUS_CHIP[order.status];
  // 취소·환불·재제작 승인처럼 운영자가 직접 판단하는 전이만 버튼으로 남긴다
  const manualStatuses = order.nextStatuses.filter(
    (next) => !VENDOR_DRIVEN_STATUSES.includes(next),
  );

  return (
    <AdminDetailShell>
      <AdminBackLink listLabel="주문 관리" listHref={ROUTES.adminOrders} />
      <VerticalGap size={12} />

      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: chip.bg,
            border: chip.border ? `1px solid ${chip.border}` : 'none',
          }}
        >
          <Typo token="text_sb_12" color={chip.text}>
            {ORDER_STATUS_LOG_LABEL[order.status]}
          </Typo>
        </Box>
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          {formatDateTime(order.createdAt)} 주문
        </Typo>
      </Stack>
      <VerticalGap size={8} />
      <Typo token="text_b_24" sx={{ fontSize: { xs: 20, md: 24 } }}>
        {order.title}
      </Typo>
      <VerticalGap size={2} />
      <Typo token="text_m_14" color={colorChips.grayScale[500]}>
        {order.copies}부
      </Typo>

      <VerticalGap size={12} />
      {/* 클럽·주문자는 각자의 상세로 — 이 왕복이 모달을 페이지로 바꾼 이유다 */}
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <CommonButton
          label={`클럽 · ${order.club.name}`}
          size="small"
          buttonColor="tertiary"
          buttonVariant="outlined"
          onClick={() =>
            router.push(ROUTES.adminClubDetail(order.club.publicId))
          }
        />
        <CommonButton
          label={`주문자 · ${order.member.name}`}
          size="small"
          buttonColor="tertiary"
          buttonVariant="outlined"
          onClick={() =>
            router.push(ROUTES.adminMemberDetail(order.member.publicId))
          }
        />
      </Stack>

      <VerticalGap size={12} />
      <Stack spacing={0.25}>
        <CopyableId label="주문번호" value={order.publicId} />
        <CopyableId label="클럽 ID" value={order.club.publicId} />
        <CopyableId label="주문자 ID" value={order.member.publicId} />
      </Stack>

      <VerticalGap size={16} />
      <Stack spacing={0.25}>
        <Typo token="text_r_14" color={colorChips.grayScale[700]}>
          {order.bookSpec.name} · {order.pageCount}쪽 ·{' '}
          {order.bookSpec.innerTrimWidthMm}×{order.bookSpec.innerTrimHeightMm}mm
        </Typo>
        <Typo token="text_r_14" color={colorChips.grayScale[700]}>
          {order.unitPrice.toLocaleString()}원 × {order.copies}부 + 배송비{' '}
          {order.shippingFee.toLocaleString()}원 ={' '}
          <b>{order.totalAmount.toLocaleString()}원</b>
        </Typo>
      </Stack>

      <VerticalGap size={16} />
      <AdminProductionPanel
        order={order}
        onOpenDispatch={() => setDispatchOpen(true)}
      />

      <VerticalGap size={16} />
      <Typo token="text_sb_14">수록 책 {order.books.length}권</Typo>
      <VerticalGap size={8} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
          },
          gap: 1,
        }}
      >
        {order.books.map((book) => (
          <Stack
            key={book.publicId}
            direction="row"
            spacing={1}
            sx={{ alignItems: 'center', minWidth: 0 }}
          >
            <BookCover
              color={book.coverColor}
              emoji={book.coverEmoji}
              width={28}
              fontSize={13}
              borderRadius={0.75}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typo
                token="text_r_14"
                color={colorChips.grayScale[700]}
                sx={lineClamp(1)}
              >
                {book.title}
              </Typo>
              <Typo token="text_r_12" color={colorChips.grayScale[400]}>
                {book.author}
              </Typo>
            </Box>
          </Stack>
        ))}
      </Box>

      <VerticalGap size={16} />
      <Typo token="text_sb_14">진행 이력 {order.history.length}</Typo>
      <VerticalGap size={8} />
      <OrderHistoryList history={order.history} adminView />

      <VerticalGap size={24} />
      <Stack
        direction="row"
        spacing={1}
        sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 }}
      >
        {manualStatuses.length === 0 ? (
          <Typo token="text_r_12" color={colorChips.grayScale[500]}>
            {order.nextStatuses.length > 0
              ? '제작 단계는 위 북프린트 연동에서 진행해요.'
              : '더 진행할 단계가 없는 주문이에요.'}
          </Typo>
        ) : (
          manualStatuses.map((next) => (
            <CommonButton
              key={next}
              label={`${ORDER_STATUS_LOG_LABEL[next]}(으)로`}
              onClick={() => {
                setNote('');
                setPendingStatus(next);
              }}
            />
          ))
        )}
      </Stack>

      <AdminDispatchModal
        order={order}
        open={dispatchOpen}
        onClose={() => setDispatchOpen(false)}
      />

      {/* 상태 전환은 되돌릴 수 없는 운영 행위 — 확인 + 처리 메모를 함께 받는다 */}
      <CommonModal
        open={pendingStatus !== null}
        onClose={() => setPendingStatus(null)}
        title="상태 변경"
        maxWidth="xs"
        actions={
          <>
            <CommonButton
              label="닫기"
              buttonColor="tertiary"
              onClick={() => setPendingStatus(null)}
            />
            <CommonButton
              label="변경"
              isLoading={transitionMutation.isPending}
              onClick={() => {
                if (!pendingStatus) return;
                transitionMutation.mutate(
                  {
                    orderPublicId: order.publicId,
                    toStatus: pendingStatus,
                    adminNote: note.trim() || undefined,
                  },
                  {
                    onSuccess: () => {
                      toast.success(
                        `'${ORDER_STATUS_LOG_LABEL[pendingStatus]}'(으)로 변경했어요.`,
                      );
                      const goesToDispatch = pendingStatus === 'CONFIRMED';
                      setPendingStatus(null);
                      setNote('');
                      if (goesToDispatch) setDispatchOpen(true);
                    },
                  },
                );
              }}
            />
          </>
        }
      >
        <Typo
          token="text_r_14"
          color={colorChips.grayScale[600]}
          sx={{ wordBreak: 'keep-all' }}
        >
          이 주문을 &apos;
          {pendingStatus ? ORDER_STATUS_LOG_LABEL[pendingStatus] : ''}&apos;
          상태로 변경할까요? 주문자 화면에도 바로 반영돼요.
        </Typo>
        <VerticalGap size={12} />
        <CommonInput
          label="운영자 메모 (선택)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline
          minRows={2}
          maxLength={300}
          placeholder="처리 근거를 남기면 이력에 함께 저장돼요"
        />
      </CommonModal>
    </AdminDetailShell>
  );
}
