'use client';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import {
  Box,
  ButtonBase,
  Collapse,
  Stack,
  Step,
  StepLabel,
  Stepper,
} from '@mui/material';
import { useState } from 'react';
import { useMyOrderTransitionMutation } from '@/shared/api/orderApi';
import { BookCover } from '@/shared/components/book/BookCover';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import {
  getOrderStepIndex,
  ORDER_STATUS_CHIP,
  ORDER_STATUS_LABEL,
  ORDER_STEP_GROUPS,
} from '@/shared/constants/orderStatus';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import { cardSurface } from '@/shared/styles/mixins';
import type { Order } from '@/shared/types/order';
import { formatDate } from '@/shared/utils/date';
import { ACTIONS_BY_STATUS, type OrderAction } from './orderActions';
import { OrderActionModal } from './OrderActionModal';
import { OrderHistoryList } from './OrderHistoryList';

/** 마이페이지 주문 카드 — 사용자 언어 상태·진행 스텝·단계별 날짜·주문자 액션 */
export const OrderCard = ({ order }: { order: Order }) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<OrderAction | null>(null);
  const transitionMutation = useMyOrderTransitionMutation();

  const stepIndex = getOrderStepIndex(order.status);
  const chip = ORDER_STATUS_CHIP[order.status];
  const actions = ACTIONS_BY_STATUS[order.status] ?? [];

  return (
    <Box sx={{ ...cardSurface, minWidth: 300 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {/* 클럽명은 강조 없이 메타로만 — 카드마다 색 태그가 늘어나 산만해지는 것 방지 */}
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          {formatDate(order.createdAt)} 주문 · {order.club.name}
        </Typo>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: chip.bg,
          }}
        >
          <Typo
            token="text_sb_12"
            color={chip.text}
            sx={{ whiteSpace: 'nowrap' }}
          >
            {ORDER_STATUS_LABEL[order.status]}
          </Typo>
        </Box>
      </Stack>
      <VerticalGap size={8} />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline' }}>
        <Typo token="text_b_18" color={colorChips.grayScale[800]}>
          {order.title}
        </Typo>
        <Typo
          token="text_m_14"
          color={colorChips.grayScale[500]}
          sx={{ whiteSpace: 'nowrap' }}
        >
          {order.copies}부
        </Typo>
      </Stack>
      <VerticalGap size={2} />
      {/* 주문번호 — 고객센터 문의 시 참조 */}
      <Typo token="text_r_12" color={colorChips.grayScale[400]}>
        주문번호 {order.publicId}
      </Typo>
      <VerticalGap size={12} />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Stack direction="row" spacing={0.5}>
          {order.books.map((book) => (
            <BookCover
              key={book.publicId}
              color={book.coverColor}
              emoji={book.coverEmoji}
              width={30}
              fontSize={14}
              borderRadius={1}
            />
          ))}
        </Stack>
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          『{order.books[0]?.title}』
          {order.books.length > 1 ? ` 외 ${order.books.length - 1}권` : ''} 수록
        </Typo>
      </Stack>

      {stepIndex !== null && (
        <>
          <VerticalGap size={16} />
          <Stepper activeStep={stepIndex} alternativeLabel>
            {ORDER_STEP_GROUPS.map((label, index) => (
              <Step key={label} completed={index < stepIndex}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </>
      )}

      <VerticalGap size={12} />
      <ButtonBase
        onClick={() => setHistoryOpen((prev) => !prev)}
        sx={{ borderRadius: 1, px: 0.5, py: 0.25, gap: 0.25 }}
      >
        <Typo token="text_m_12" color={colorChips.grayScale[500]}>
          진행 이력 {order.history.length}
        </Typo>
        <ExpandMoreRoundedIcon
          sx={{
            fontSize: 16,
            color: colorChips.grayScale[500],
            transform: historyOpen ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.15s',
          }}
        />
      </ButtonBase>
      <Collapse in={historyOpen}>
        <VerticalGap size={4} />
        <OrderHistoryList history={order.history} />
      </Collapse>

      {actions.length > 0 && (
        <>
          <VerticalGap size={16} />
          <Stack
            direction="row"
            spacing={1}
            sx={{ justifyContent: 'flex-end', flexWrap: 'wrap', gap: 1 }}
          >
            {actions.map((action) => (
              <CommonButton
                key={action.toStatus}
                label={action.label}
                size="small"
                buttonColor={action.buttonColor}
                buttonVariant={action.buttonVariant ?? 'filled'}
                onClick={() => setPendingAction(action)}
              />
            ))}
          </Stack>
        </>
      )}

      <OrderActionModal
        action={pendingAction}
        isLoading={transitionMutation.isPending}
        onClose={() => setPendingAction(null)}
        onSubmit={(issue) => {
          if (!pendingAction) return;
          transitionMutation.mutate(
            {
              orderPublicId: order.publicId,
              toStatus: pendingAction.toStatus,
              ...issue,
            },
            {
              onSuccess: () => {
                toast.success(pendingAction.successMessage);
                setPendingAction(null);
              },
            },
          );
        }}
      />
    </Box>
  );
};
