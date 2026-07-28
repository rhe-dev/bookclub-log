import { Box, Stack } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import {
  ORDER_ISSUE_REASON_LABEL,
  ORDER_STATUS_LOG_LABEL,
} from '@/shared/constants/orderStatus';
import { colorChips } from '@/shared/styles/colors';
import type { Order } from '@/shared/types/order';
import { formatDateTime } from '@/shared/utils/date';

/** 주문 진행 이력 타임라인 — 명사형 라벨 + 일시, 환불·재제작 요청은 사유 표시 */
export const OrderHistoryList = ({
  history,
}: {
  history: Order['history'];
}) => (
  <Stack
    spacing={0.5}
    sx={{
      borderLeft: `2px solid ${colorChips.grayScale[200]}`,
      pl: 1.5,
      ml: 0.5,
    }}
  >
    {history.map((entry, index) => (
      <Box key={`${entry.toStatus}-${index}`}>
        <Stack
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
        {entry.reason && (
          <Typo
            token="text_r_12"
            color={colorChips.grayScale[500]}
            sx={{ wordBreak: 'keep-all' }}
          >
            사유: {ORDER_ISSUE_REASON_LABEL[entry.reason]}
            {entry.reasonDetail ? ` — ${entry.reasonDetail}` : ''}
          </Typo>
        )}
      </Box>
    ))}
  </Stack>
);
