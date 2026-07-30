'use client';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { CommonButton } from '@/shared/components/ui/CommonButton';
import { Typo } from '@/shared/components/ui/Typo';
import { ROUTES } from '@/shared/constants/routes';
import { colorChips } from '@/shared/styles/colors';
import type { Order } from '@/shared/types/order';
import { describeDelivery } from '@/shared/utils/orderDelivery';

interface CompleteStepProps {
  order: Order;
}

/** 완료 — 주문 접수 안내 + 다음 행동 */
export const CompleteStep = ({ order }: CompleteStepProps) => {
  const router = useRouter();
  const deliveryNote = describeDelivery(order);

  return (
    <Stack spacing={2.5} sx={{ alignItems: 'center', py: 6 }}>
      <CheckCircleRoundedIcon
        sx={{ fontSize: 56, color: colorChips.primary[500] }}
      />
      <Stack spacing={0.75} sx={{ alignItems: 'center' }}>
        <Typo token="text_b_20">주문이 접수됐어요</Typo>
        <Typo
          token="text_r_14"
          color={colorChips.grayScale[600]}
          align="center"
          sx={{ wordBreak: 'keep-all' }}
        >
          『{order.title}』 {order.copies}부 · 수록 책 {order.books.length}권
          <br />
          {order.bookSpec.name} · {order.pageCount}쪽 ·{' '}
          {order.totalAmount.toLocaleString()}원
          <br />
          진행 상황은 마이페이지에서 단계별로 확인할 수 있어요.
        </Typo>
        {deliveryNote && (
          <Typo token="text_m_14" color={colorChips.primary[700]}>
            {deliveryNote}
          </Typo>
        )}
        <Typo token="text_r_12" color={colorChips.grayScale[500]}>
          주문번호 {order.publicId}
        </Typo>
      </Stack>
      <Stack direction="row" spacing={1}>
        <CommonButton
          label="책방으로"
          buttonColor="tertiary"
          onClick={() => router.push(ROUTES.bookshelf)}
        />
        <CommonButton
          label="마이페이지에서 확인"
          onClick={() => router.push(ROUTES.myPage)}
        />
      </Stack>
    </Stack>
  );
};
