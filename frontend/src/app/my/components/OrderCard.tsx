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
import { OrderHistoryList } from '@/shared/components/order/OrderHistoryList';
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
import { describeOrderGuide } from '@/shared/utils/orderDelivery';
import { ACTIONS_BY_STATUS, type OrderAction } from './orderActions';
import { OrderActionModal } from './OrderActionModal';

/** 카드가 넘치지 않는 선 — 나머지는 '+N'으로 접는다 */
const MAX_COVERS = 6;

/** 마이페이지 주문 카드 — 사용자 언어 상태·진행 스텝·단계별 날짜·주문자 액션 */
export const OrderCard = ({ order }: { order: Order }) => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<OrderAction | null>(null);
  const transitionMutation = useMyOrderTransitionMutation();

  const stepIndex = getOrderStepIndex(order.status);
  const chip = ORDER_STATUS_CHIP[order.status];
  const actions = ACTIONS_BY_STATUS[order.status] ?? [];
  const guideNote = describeOrderGuide(order);

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
        {/*
         * 주문번호가 먼저 — 고객센터 문의·조회의 기준이라 카드에서 가장 먼저 찾는 값이다.
         * 클럽명은 강조 없이 메타로만 (카드마다 색 태그가 늘어나 산만해지는 것 방지)
         */}
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          {order.publicId} · {formatDate(order.createdAt)} 주문 ·{' '}
          {order.club.name}
        </Typo>
        <Box
          sx={{
            px: 1,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: chip.bg,
            border: chip.border ? `1px solid ${chip.border}` : 'none',
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
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
      >
        {/* 수록 책이 많으면 표지가 카드를 넘친다 — 앞 6권만 보여주고 나머지는 수로 */}
        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
          {order.books.slice(0, MAX_COVERS).map((book) => (
            <BookCover
              key={book.publicId}
              color={book.coverColor}
              emoji={book.coverEmoji}
              width={30}
              fontSize={14}
              borderRadius={1}
            />
          ))}
          {order.books.length > MAX_COVERS && (
            <Box
              sx={{
                width: 30,
                height: 40,
                borderRadius: 1,
                backgroundColor: colorChips.grayScale[200],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Typo token="text_sb_12" color={colorChips.grayScale[600]}>
                +{order.books.length - MAX_COVERS}
              </Typo>
            </Box>
          )}
        </Stack>
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          『{order.books[0]?.title}』
          {order.books.length > 1 ? ` 외 ${order.books.length - 1}권` : ''} 수록
        </Typo>
      </Stack>

      <VerticalGap size={8} />
      {/* 제작 사양과 금액 — 어떤 책으로 만들어지는지 (D-033) */}
      <Typo token="text_r_12" color={colorChips.grayScale[600]}>
        {order.bookSpec.name} · {order.pageCount}쪽 ·{' '}
        {order.totalAmount.toLocaleString()}원
      </Typo>

      {order.trackingNumber && (
        <>
          <VerticalGap size={4} />
          <Typo token="text_r_12" color={colorChips.grayScale[600]}>
            {order.trackingCarrier} {order.trackingNumber}
          </Typo>
        </>
      )}

      {guideNote && (
        <>
          <VerticalGap size={4} />
          <Typo token="text_m_12" color={colorChips.primary[700]}>
            {guideNote}
          </Typo>
        </>
      )}

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
