'use client';

import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

interface CommonConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  /** 안내 본문 — 문자열이면 기본 스타일로, 노드면 그대로 렌더 */
  body: React.ReactNode;
  confirmLabel: string;
  confirmColor?: 'primary' | 'error';
  isLoading?: boolean;
}

/** 확인 모달 공통 골격 — 닫기(tertiary) + 확정 버튼 */
export const CommonConfirmModal = ({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel,
  confirmColor = 'primary',
  isLoading = false,
}: CommonConfirmModalProps) => (
  <CommonModal
    open={open}
    onClose={onClose}
    title={title}
    maxWidth="xs"
    actions={
      <>
        <CommonButton label="닫기" buttonColor="tertiary" onClick={onClose} />
        <CommonButton
          label={confirmLabel}
          buttonColor={confirmColor}
          isLoading={isLoading}
          onClick={onConfirm}
        />
      </>
    }
  >
    {typeof body === 'string' ? (
      <Typo
        token="text_r_14"
        color={colorChips.grayScale[600]}
        sx={{ wordBreak: 'keep-all' }}
      >
        {body}
      </Typo>
    ) : (
      body
    )}
  </CommonModal>
);
