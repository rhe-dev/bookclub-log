import SubdirectoryArrowRightRoundedIcon from '@mui/icons-material/SubdirectoryArrowRightRounded';
import { Box, Stack } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import {
  ORDER_ISSUE_REASON_LABEL,
  ORDER_STATUS_LOG_LABEL,
} from '@/shared/constants/orderStatus';
import { colorChips } from '@/shared/styles/colors';
import type { Order } from '@/shared/types/order';
import { formatDateTime } from '@/shared/utils/date';

/** 상태 라벨 폭 고정 — 여러 줄의 일시가 세로로 나란히 보이게 (가장 긴 라벨 기준) */
const STATUS_LABEL_WIDTH = 64;

interface OrderHistoryListProps {
  history: Order['history'];
  /** 운영자 화면 전용 정보(처리자·운영자 메모)를 함께 노출할지 */
  adminView?: boolean;
}

/** 이력 한 줄에 딸린 부가 정보(사유·메모) — 라벨 대신 들여쓰기 아이콘으로 관계를 보여준다 */
const SubEntry = ({ children }: { children: React.ReactNode }) => (
  <Stack
    direction="row"
    spacing={0.5}
    // 일시 줄 아래에 걸리도록 라벨 폭 + 라벨-일시 간격만큼 들여쓴다
    sx={{ alignItems: 'flex-start', pl: `${STATUS_LABEL_WIDTH + 12}px` }}
  >
    <SubdirectoryArrowRightRoundedIcon
      sx={{ fontSize: 14, color: colorChips.grayScale[400], flexShrink: 0 }}
    />
    {children}
  </Stack>
);

/**
 * 주문 진행 이력 — 명사형 상태 라벨 + 일시(+행위자), 요청 사유·운영자 메모.
 * 마이페이지와 운영자 상세가 같은 문법으로 보이도록 한 곳에서 관리한다.
 */
export const OrderHistoryList = ({
  history,
  adminView = false,
}: OrderHistoryListProps) => (
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
          <Typo
            token="text_m_12"
            color={colorChips.grayScale[800]}
            sx={{ width: STATUS_LABEL_WIDTH, flexShrink: 0 }}
          >
            {ORDER_STATUS_LOG_LABEL[entry.toStatus]}
          </Typo>
          <Typo token="text_r_12" color={colorChips.grayScale[700]}>
            {formatDateTime(entry.changedAt)}
            {adminView
              ? ` · ${entry.actor === 'ADMIN' ? '운영자' : '주문자'}`
              : ''}
          </Typo>
        </Stack>
        {/* 운영자 메모는 내부 처리 기록 — 주문자 화면에는 노출하지 않는다 */}
        {adminView && entry.adminNote && (
          <SubEntry>
            <Typo
              token="text_r_12"
              color={colorChips.grayScale[500]}
              sx={{ wordBreak: 'keep-all' }}
            >
              {entry.adminNote}
            </Typo>
          </SubEntry>
        )}
        {entry.reason && (
          <SubEntry>
            <Typo
              token="text_r_12"
              color={colorChips.secondary[700]}
              sx={{ wordBreak: 'keep-all' }}
            >
              {ORDER_ISSUE_REASON_LABEL[entry.reason]}
              {entry.reasonDetail ? ` — ${entry.reasonDetail}` : ''}
            </Typo>
          </SubEntry>
        )}
      </Box>
    ))}
  </Stack>
);
