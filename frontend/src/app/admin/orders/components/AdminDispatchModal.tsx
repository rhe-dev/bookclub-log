'use client';

import { Stack } from '@mui/material';
import { useState } from 'react';
import {
  useAdminDispatchMutation,
  useAdminProductionQuery,
} from '@/shared/api/adminApi';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { AdminOrder } from '@/shared/types/order';

interface AdminDispatchModalProps {
  order: AdminOrder;
  open: boolean;
  onClose: () => void;
}

/**
 * 북프린트 발주 — 되돌릴 수 없는 행위라 모달에서 한 번 더 확인받는다.
 *
 * 이 모달이 곧 확인 단계다. 주문 확인 직후 이어서 열리기도 하고, 나중에 연동 패널의
 * 발주 버튼으로 열기도 하는데 어느 쪽이든 같은 화면을 쓴다 — 확인을 두 번 겹치지 않으려고.
 */
export const AdminDispatchModal = ({
  order,
  open,
  onClose,
}: AdminDispatchModalProps) => {
  const { data } = useAdminProductionQuery(open ? order.publicId : undefined);
  const dispatchMutation = useAdminDispatchMutation(order.publicId);
  const [note, setNote] = useState('');

  // 열릴 때마다 메모를 비운다 — 렌더 중 상태 조정(이펙트 불필요)
  const [lastOpen, setLastOpen] = useState(open);
  if (open !== lastOpen) {
    setLastOpen(open);
    setNote('');
  }

  return (
    <CommonModal
      open={open}
      onClose={onClose}
      title="북프린트 발주"
      maxWidth="xs"
      actions={
        <>
          <CommonButton label="닫기" buttonColor="tertiary" onClick={onClose} />
          <CommonButton
            label="발주하기"
            isLoading={dispatchMutation.isPending}
            disabled={!data?.eligible}
            onClick={() =>
              dispatchMutation.mutate(note.trim() || undefined, {
                onSuccess: () => {
                  toast.success('제작처에 발주했어요.');
                  onClose();
                },
              })
            }
          />
        </>
      }
    >
      <Typo
        token="text_r_14"
        color={colorChips.grayScale[700]}
        sx={{ wordBreak: 'keep-all' }}
      >
        『{order.title}』 {order.copies}부를 제작처에 발주할까요?
      </Typo>
      <VerticalGap size={8} />
      <Stack spacing={0.25}>
        <Typo token="text_r_12" color={colorChips.grayScale[600]}>
          {data ? `${data.specName} · ${data.currentPageCount}쪽` : '확인 중…'}
        </Typo>
        <Typo token="text_r_12" color={colorChips.grayScale[600]}>
          제작비 {order.totalAmount.toLocaleString()}원
        </Typo>
      </Stack>

      <VerticalGap size={12} />
      <Stack spacing={0.25}>
        <Typo
          token="text_m_12"
          color={colorChips.system.warning}
          sx={{ wordBreak: 'keep-all' }}
        >
          발주하면 제작이 시작되고 주문자는 더 이상 취소할 수 없어요.
        </Typo>
        <Typo token="text_m_12" color={colorChips.system.warning}>
          되돌릴 수 없는 처리예요.
        </Typo>
      </Stack>

      {data && !data.eligible && (
        <>
          <VerticalGap size={8} />
          <Typo token="text_m_12" color={colorChips.system.warning}>
            사양이 판형 규칙에 맞지 않아 지금은 발주할 수 없어요.
          </Typo>
        </>
      )}

      <VerticalGap size={12} />
      <CommonInput
        label="운영자 메모 (선택)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        multiline
        minRows={2}
        maxLength={300}
        placeholder="발주 근거를 남기면 이력에 함께 저장돼요"
      />
    </CommonModal>
  );
};
