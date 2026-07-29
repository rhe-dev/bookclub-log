'use client';

import { Box, Stack } from '@mui/material';
import { useState } from 'react';
import { useAdminBulkTransitionMutation } from '@/shared/api/adminApi';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ORDER_STATUS_LOG_LABEL } from '@/shared/constants/orderStatus';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { AdminOrder, OrderStatus } from '@/shared/types/order';

interface AdminBulkActionBarProps {
  selectedOrders: AdminOrder[];
  onClearSelection: () => void;
  onDownloadSelected: () => void;
}

/**
 * 선택 항목 일괄 처리 바 — 선택한 주문들이 **공통으로** 진행 가능한 단계만 제안한다.
 * (상태가 섞여 있으면 교집합이 비어 안내만 노출)
 */
export const AdminBulkActionBar = ({
  selectedOrders,
  onClearSelection,
  onDownloadSelected,
}: AdminBulkActionBarProps) => {
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState('');
  const bulkMutation = useAdminBulkTransitionMutation();

  if (selectedOrders.length === 0) return null;

  const commonNextStatuses = selectedOrders
    .map((order) => order.nextStatuses)
    .reduce((acc, next) => acc.filter((status) => next.includes(status)));

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${colorChips.primary[300]}`,
        backgroundColor: colorChips.primary[100],
        px: 2,
        py: 1.5,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
      >
        <Typo token="text_sb_14" color={colorChips.primary[700]}>
          {selectedOrders.length}건 선택됨
        </Typo>
        {commonNextStatuses.length > 0 ? (
          commonNextStatuses.map((status) => (
            <CommonButton
              key={status}
              label={`${ORDER_STATUS_LOG_LABEL[status]}(으)로`}
              size="small"
              onClick={() => {
                setNote('');
                setPendingStatus(status);
              }}
            />
          ))
        ) : (
          <Typo token="text_r_12" color={colorChips.grayScale[600]}>
            선택한 주문들의 다음 단계가 서로 달라 일괄 진행할 수 없어요.
          </Typo>
        )}
        <CommonButton
          label={`선택 항목 CSV (${selectedOrders.length}건)`}
          size="small"
          buttonColor="tertiary"
          onClick={onDownloadSelected}
        />
        <CommonButton
          label="선택 해제"
          size="small"
          buttonColor="tertiary"
          buttonVariant="outlined"
          onClick={onClearSelection}
        />
      </Stack>

      <CommonModal
        open={pendingStatus !== null}
        onClose={() => setPendingStatus(null)}
        title="일괄 단계 진행"
        maxWidth="xs"
        actions={
          <>
            <CommonButton
              label="닫기"
              buttonColor="tertiary"
              onClick={() => setPendingStatus(null)}
            />
            <CommonButton
              label="진행"
              isLoading={bulkMutation.isPending}
              onClick={() => {
                if (!pendingStatus) return;
                bulkMutation.mutate(
                  {
                    orderIds: selectedOrders.map((order) => order.publicId),
                    toStatus: pendingStatus,
                    adminNote: note.trim() || undefined,
                  },
                  {
                    onSuccess: (result) => {
                      toast.success(
                        result.failed.length === 0
                          ? `${result.succeeded.length}건을 처리했어요.`
                          : `${result.succeeded.length}건 처리, ${result.failed.length}건은 진행할 수 없어 건너뛰었어요.`,
                      );
                      setPendingStatus(null);
                      onClearSelection();
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
          선택한 {selectedOrders.length}건을 &apos;
          {pendingStatus ? ORDER_STATUS_LOG_LABEL[pendingStatus] : ''}&apos;
          (으)로 진행할까요? 주문자 화면에도 바로 반영돼요.
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
    </Box>
  );
};
