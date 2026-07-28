'use client';

import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useEffect, useState } from 'react';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { CommonInput } from '@/shared/components/ui/CommonInput';
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import { ORDER_ISSUE_REASON_LABEL } from '@/shared/constants/orderStatus';
import { colorChips } from '@/shared/styles/colors';
import type { OrderIssueReason } from '@/shared/types/order';
import {
  needsReason,
  type OrderAction,
  OTHER_DETAIL_MAX,
  OTHER_DETAIL_MIN,
} from './orderActions';

interface OrderActionModalProps {
  action: OrderAction | null;
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (issue: {
    reason?: OrderIssueReason;
    reasonDetail?: string;
  }) => void;
}

/** 주문자 액션 확인 모달 — 환불·재제작 요청은 사유 선택(기타는 상세 5~500자 필수) */
export const OrderActionModal = ({
  action,
  isLoading,
  onClose,
  onSubmit,
}: OrderActionModalProps) => {
  const [reason, setReason] = useState<OrderIssueReason | ''>('');
  const [reasonDetail, setReasonDetail] = useState('');

  // 액션이 바뀌어 열릴 때마다 입력 초기화
  useEffect(() => {
    setReason('');
    setReasonDetail('');
  }, [action]);

  const showReason = action !== null && needsReason(action.toStatus);
  const detailLength = reasonDetail.trim().length;
  const confirmDisabled =
    showReason &&
    (!reason || (reason === 'OTHER' && detailLength < OTHER_DETAIL_MIN));

  const handleConfirm = () => {
    if (!action) return;
    onSubmit(
      showReason && reason
        ? { reason, reasonDetail: reasonDetail.trim() || undefined }
        : {},
    );
  };

  return (
    <CommonModal
      open={action !== null}
      onClose={onClose}
      title={action?.confirmTitle}
      maxWidth="xs"
      actions={
        action && (
          <>
            <CommonButton
              label="닫기"
              buttonColor="tertiary"
              onClick={onClose}
            />
            <CommonButton
              label={action.label}
              buttonColor={
                action.buttonColor === 'tertiary'
                  ? 'primary'
                  : action.buttonColor
              }
              disabled={confirmDisabled}
              isLoading={isLoading}
              onClick={handleConfirm}
            />
          </>
        )
      }
    >
      <Typo
        token="text_r_14"
        color={colorChips.grayScale[600]}
        sx={{ wordBreak: 'keep-all' }}
      >
        {action?.confirmBody}
      </Typo>
      {showReason && (
        <>
          <VerticalGap size={16} />
          <Typo token="text_sb_14" color={colorChips.grayScale[800]}>
            사유 선택
          </Typo>
          <RadioGroup
            value={reason}
            onChange={(e) => {
              const next = e.target.value as OrderIssueReason;
              setReason(next);
              // 상세 입력은 기타 전용 — 다른 사유로 바꾸면 입력값도 비운다
              if (next !== 'OTHER') setReasonDetail('');
            }}
          >
            {(
              Object.entries(ORDER_ISSUE_REASON_LABEL) as [
                OrderIssueReason,
                string,
              ][]
            ).map(([value, label]) => (
              <FormControlLabel
                key={value}
                value={value}
                control={<Radio size="small" />}
                label={
                  <Typo token="text_r_14" color={colorChips.grayScale[700]}>
                    {label}
                  </Typo>
                }
              />
            ))}
          </RadioGroup>
          {reason === 'OTHER' && (
            <>
              <VerticalGap size={8} />
              <CommonInput
                label="상세 내용"
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                multiline
                minRows={3}
                maxLength={OTHER_DETAIL_MAX}
                placeholder="하자 내용을 알려 주시면 확인에 도움이 돼요"
                errorMessage={
                  reasonDetail && detailLength < OTHER_DETAIL_MIN
                    ? `${OTHER_DETAIL_MIN}자 이상 입력해 주세요.`
                    : undefined
                }
                helperText={`${OTHER_DETAIL_MIN}~${OTHER_DETAIL_MAX}자 (${reasonDetail.length}/${OTHER_DETAIL_MAX})`}
              />
            </>
          )}
        </>
      )}
    </CommonModal>
  );
};
