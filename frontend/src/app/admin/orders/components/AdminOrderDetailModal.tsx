'use client';

import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useAdminTransitionMutation } from '@/shared/api/adminApi';
import { BookCover } from '@/shared/components/book/BookCover';
import { OrderHistoryList } from '@/shared/components/order/OrderHistoryList';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { CopyableId } from '@/shared/components/ui/CopyableId';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import {
  ORDER_STATUS_CHIP,
  ORDER_STATUS_LOG_LABEL,
} from '@/shared/constants/orderStatus';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { AdminOrder, OrderStatus } from '@/shared/types/order';
import { formatDateTime } from '@/shared/utils/date';

interface AdminOrderDetailModalProps {
  order: AdminOrder | null;
  onClose: () => void;
}

/** 운영자 주문 상세 — 수록 책·진행 이력(요청 사유)·다음 단계 진행 */
export const AdminOrderDetailModal = ({
  order,
  onClose,
}: AdminOrderDetailModalProps) => {
  const transitionMutation = useAdminTransitionMutation();
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState('');
  // 모달이 닫힐 때 확인 상태가 남지 않게
  const [lastOrderId, setLastOrderId] = useState(order?.publicId);
  if (order?.publicId !== lastOrderId) {
    setLastOrderId(order?.publicId);
    setPendingStatus(null);
    setNote('');
  }
  if (!order) return null;

  const chip = ORDER_STATUS_CHIP[order.status];

  return (
    <CommonModal
      open
      onClose={onClose}
      title="주문 상세"
      actions={
        // 진행 가능한 다음 단계는 서버가 전이 맵으로 계산해 내려준다
        order.nextStatuses.length === 0 ? (
          <Typo token="text_r_12" color={colorChips.grayScale[500]}>
            더 진행할 단계가 없는 주문이에요.
          </Typo>
        ) : (
          order.nextStatuses.map((next) => (
            <CommonButton
              key={next}
              label={`${ORDER_STATUS_LOG_LABEL[next]}(으)로`}
              onClick={() => {
                setNote('');
                setPendingStatus(next);
              }}
            />
          ))
        )
      }
    >
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Box
          sx={{ px: 1, py: 0.25, borderRadius: 1, backgroundColor: chip.bg }}
        >
          <Typo token="text_sb_12" color={chip.text}>
            {ORDER_STATUS_LOG_LABEL[order.status]}
          </Typo>
        </Box>
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          {formatDateTime(order.createdAt)} 주문 · {order.club.name} ·{' '}
          {order.member.name}
        </Typo>
      </Stack>
      <VerticalGap size={8} />
      <Typo token="text_b_18">{order.title}</Typo>
      <VerticalGap size={2} />
      <Typo token="text_m_14" color={colorChips.grayScale[500]}>
        {order.copies}부
      </Typo>
      <VerticalGap size={8} />
      {/* 클럽명·회원명은 중복될 수 있어 운영자 화면에서는 식별자도 함께 노출 */}
      <Stack spacing={0.25}>
        <CopyableId label="주문번호" value={order.publicId} />
        <CopyableId
          label="클럽 ID"
          value={order.club.publicId}
        />
        <CopyableId
          label="주문자 ID"
          value={order.member.publicId}
        />
      </Stack>

      <VerticalGap size={16} />
      <Typo token="text_sb_14">수록 책 {order.books.length}권</Typo>
      <VerticalGap size={8} />
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
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
              width={24}
              fontSize={12}
              borderRadius={1}
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
                      setPendingStatus(null);
                      onClose();
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
    </CommonModal>
  );
};
