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
import { CommonModal } from '@/shared/components/ui/CommonModal';
import { Typo } from '@/shared/components/ui/Typo';
import { VerticalGap } from '@/shared/components/ui/VerticalGap';
import {
  getOrderStepIndex,
  ORDER_STATUS_CHIP,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_LOG_LABEL,
  ORDER_STEP_GROUPS,
} from '@/shared/constants/orderStatus';
import { toast } from '@/shared/stores/toastStore';
import { colorChips } from '@/shared/styles/colors';
import type { Order, OrderStatus } from '@/shared/types/order';
import { formatDate, formatDateTime } from '@/shared/utils/date';

type OrderAction = {
  toStatus: OrderStatus;
  label: string;
  confirmTitle: string;
  confirmBody: string;
  successMessage: string;
  buttonColor: 'primary' | 'error' | 'tertiary';
  buttonVariant?: 'filled' | 'outlined';
};

/** 상태별 주문자 액션 — 전이 맵(PLAN §5)의 USER 분기와 1:1 */
const ACTIONS_BY_STATUS: Partial<Record<OrderStatus, OrderAction[]>> = {
  RECEIVED: [
    {
      toStatus: 'CANCELED',
      label: '주문 취소',
      confirmTitle: '주문 취소',
      confirmBody:
        '이 주문을 취소할까요? 제작이 시작되기 전에만 취소할 수 있어요.',
      successMessage: '주문을 취소했어요.',
      buttonColor: 'error',
      buttonVariant: 'outlined',
    },
  ],
  CONFIRMED: [
    {
      toStatus: 'CANCELED',
      label: '주문 취소',
      confirmTitle: '주문 취소',
      confirmBody:
        '이 주문을 취소할까요? 제작이 시작되기 전에만 취소할 수 있어요.',
      successMessage: '주문을 취소했어요.',
      buttonColor: 'error',
      buttonVariant: 'outlined',
    },
  ],
  DELIVERED: [
    {
      toStatus: 'PURCHASE_CONFIRMED',
      label: '구매 확정',
      confirmTitle: '구매 확정',
      confirmBody: '문집을 잘 받으셨나요? 구매를 확정하면 주문이 마무리돼요.',
      successMessage: '구매를 확정했어요. 함께 읽은 기록이 책이 됐네요!',
      buttonColor: 'primary',
    },
    {
      toStatus: 'REFUND_REQUESTED',
      label: '환불 요청',
      confirmTitle: '환불 요청',
      confirmBody:
        '파본·인쇄 불량 등 하자가 있었나요? 문집은 주문 제작 상품이라 하자가 있을 때만 환불을 접수할 수 있어요.',
      successMessage: '환불을 접수했어요. 운영자 확인 후 처리돼요.',
      buttonColor: 'tertiary',
    },
    {
      toStatus: 'REMAKE_REQUESTED',
      label: '재제작 요청',
      confirmTitle: '재제작 요청',
      confirmBody:
        '파본·인쇄 불량 등 하자가 있었나요? 운영자가 확인하면 같은 내용으로 다시 제작해 드려요.',
      successMessage:
        '재제작을 접수했어요. 운영자 확인 후 제작이 다시 시작돼요.',
      buttonColor: 'tertiary',
    },
  ],
};

/** 마이페이지 주문 카드 — 사용자 언어 상태·진행 스텝·단계별 날짜·주문자 액션 */
export const OrderCard = ({ order }: { order: Order }) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<OrderAction | null>(null);
  const transitionMutation = useMyOrderTransitionMutation();

  const stepIndex = getOrderStepIndex(order.status);
  const chip = ORDER_STATUS_CHIP[order.status];
  const actions = ACTIONS_BY_STATUS[order.status] ?? [];

  const runAction = (action: OrderAction) => {
    transitionMutation.mutate(
      { orderPublicId: order.publicId, toStatus: action.toStatus },
      {
        onSuccess: () => {
          toast.success(action.successMessage);
          setPendingAction(null);
        },
      },
    );
  };

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${colorChips.grayScale[200]}`,
        backgroundColor: colorChips.basic.white,
        p: { xs: 2, md: 2.5 },
        minWidth: 300,
      }}
    >
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
        <Stack
          spacing={0.5}
          sx={{
            borderLeft: `2px solid ${colorChips.grayScale[200]}`,
            pl: 1.5,
            ml: 0.5,
          }}
        >
          {order.history.map((entry, index) => (
            <Stack
              key={`${entry.toStatus}-${index}`}
              direction="row"
              spacing={1}
              sx={{ alignItems: 'baseline', flexWrap: 'wrap' }}
            >
              <Typo token="text_m_12" color={colorChips.grayScale[700]}>
                {ORDER_STATUS_LOG_LABEL[entry.toStatus]}
              </Typo>
              <Typo token="text_r_12" color={colorChips.grayScale[400]}>
                {formatDateTime(entry.changedAt)}
              </Typo>
            </Stack>
          ))}
        </Stack>
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

      <CommonModal
        open={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        title={pendingAction?.confirmTitle}
        maxWidth="xs"
        actions={
          pendingAction && (
            <>
              <CommonButton
                label="닫기"
                buttonColor="tertiary"
                onClick={() => setPendingAction(null)}
              />
              <CommonButton
                label={pendingAction.label}
                buttonColor={
                  pendingAction.buttonColor === 'tertiary'
                    ? 'primary'
                    : pendingAction.buttonColor
                }
                isLoading={transitionMutation.isPending}
                onClick={() => runAction(pendingAction)}
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
          {pendingAction?.confirmBody}
        </Typo>
      </CommonModal>
    </Box>
  );
};
