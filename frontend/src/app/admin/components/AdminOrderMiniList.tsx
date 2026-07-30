'use client';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, ButtonBase, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';
import { Typo } from '@/shared/components/ui/Typo';
import {
  ORDER_STATUS_CHIP,
  ORDER_STATUS_LOG_LABEL,
} from '@/shared/constants/orderStatus';
import { ROUTES } from '@/shared/constants/routes';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';
import type { OrderStatus } from '@/shared/types/order';
import { formatDate } from '@/shared/utils/date';

interface MiniOrder {
  publicId: string;
  title: string;
  status: OrderStatus;
  copies: number;
  createdAt: string;
  /** 오른쪽에 곁들일 한 줄 — 회원 상세는 클럽명, 클럽 상세는 주문자명 */
  meta: string;
}

/** 회원·클럽 상세의 최근 주문 — 주문 상세로 넘어가는 진입점 */
export const AdminOrderMiniList = ({
  orders,
  emptyMessage,
}: {
  orders: MiniOrder[];
  emptyMessage: string;
}) => {
  const router = useRouter();

  if (orders.length === 0)
    return (
      <Typo token="text_r_14" color={colorChips.grayScale[500]}>
        {emptyMessage}
      </Typo>
    );

  return (
    <Stack
      sx={{
        borderRadius: 1.5,
        border: `1px solid ${colorChips.grayScale[200]}`,
        backgroundColor: colorChips.grayScale[100],
        overflow: 'hidden',
      }}
    >
      {orders.map((order, index) => {
        const chip = ORDER_STATUS_CHIP[order.status];
        return (
          <ButtonBase
            key={order.publicId}
            onClick={() => router.push(ROUTES.adminOrderDetail(order.publicId))}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 1,
              px: 1.5,
              py: 1.25,
              textAlign: 'left',
              borderTop:
                index === 0 ? 'none' : `1px solid ${colorChips.grayScale[200]}`,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typo
                token="text_m_14"
                color={colorChips.grayScale[800]}
                sx={lineClamp(1)}
              >
                {order.title}
              </Typo>
              <Typo token="text_r_12" color={colorChips.grayScale[500]}>
                {formatDate(order.createdAt)} · {order.meta} · {order.copies}부
              </Typo>
            </Box>
            <Box
              sx={{
                px: 1,
                py: 0.25,
                borderRadius: 1,
                backgroundColor: chip.bg,
                border: chip.border ? `1px solid ${chip.border}` : 'none',
                flexShrink: 0,
              }}
            >
              <Typo
                token="text_sb_12"
                color={chip.text}
                sx={{ whiteSpace: 'nowrap' }}
              >
                {ORDER_STATUS_LOG_LABEL[order.status]}
              </Typo>
            </Box>
            <ChevronRightRoundedIcon
              sx={{
                fontSize: 18,
                color: colorChips.grayScale[400],
                flexShrink: 0,
              }}
            />
          </ButtonBase>
        );
      })}
    </Stack>
  );
};
