'use client';

import { FormControlLabel, Radio, RadioGroup } from '@mui/material';
import { useState } from 'react';
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

  // 액션이 바뀌어 열릴 때마다 입력 초기화 — 렌더 중 상태 조정(이펙트 불필요)
  const [lastAction, setLastAction] = useState(action);
  if (action !== lastAction) {
    setLastAction(action);
    setReason('');
    setReasonDetail('');
  }

  const showReason = action !== null && needsReason(action.toStatus);
  const isOtherReason = reason === 'OTHER';
  const detailLength = reasonDetail.trim().length;
  // 기타는 상세가 필수(5자 이상), 정형 사유는 상세 없이도 접수 가능
  const confirmDisabled =
    showReason &&
    (!reason || (isOtherReason && detailLength < OTHER_DETAIL_MIN));

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
            onChange={(e) => setReason(e.target.value as OrderIssueReason)}
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
          {/* 사유를 고른 뒤에만 상세 입력 노출 — 어떤 사유든 쓸 수 있고 '기타'만 필수 */}
          {reason && (
            <>
              <VerticalGap size={8} />
              <CommonInput
                label={isOtherReason ? '상세 내용' : '상세 내용 (선택)'}
                value={reasonDetail}
                onChange={(e) => setReasonDetail(e.target.value)}
                multiline
                minRows={3}
                maxLength={OTHER_DETAIL_MAX}
                placeholder={
                  isOtherReason
                    ? '어떤 문제였는지 알려 주세요'
                    : '어느 부분이 어떻게 문제였는지 적어 주시면 확인이 빨라요'
                }
                errorMessage={
                  isOtherReason &&
                  reasonDetail &&
                  detailLength < OTHER_DETAIL_MIN
                    ? `${OTHER_DETAIL_MIN}자 이상 입력해 주세요.`
                    : undefined
                }
                helperText={
                  isOtherReason
                    ? `${OTHER_DETAIL_MIN}~${OTHER_DETAIL_MAX}자 (${reasonDetail.length}/${OTHER_DETAIL_MAX})`
                    : `${reasonDetail.length}/${OTHER_DETAIL_MAX}자`
                }
              />
            </>
          )}
        </>
      )}
    </CommonModal>
  );
};
