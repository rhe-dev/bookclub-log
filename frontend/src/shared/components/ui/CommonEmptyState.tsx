import { Stack } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';

interface CommonEmptyStateProps {
  message: string;
  /** 다음 행동 버튼 — QA 루브릭 ③(빈 상태에는 다음 행동) */
  action?: React.ReactNode;
  py?: number;
}

/** 빈 목록 안내 — 문구 + 다음 행동. ErrorView의 빈 상태 대응 컴포넌트 */
export const CommonEmptyState = ({
  message,
  action,
  py = 6,
}: CommonEmptyStateProps) => (
  <Stack spacing={2} sx={{ alignItems: 'center', py }}>
    <Typo
      token="text_r_14"
      color={colorChips.grayScale[500]}
      align="center"
      sx={{ wordBreak: 'keep-all' }}
    >
      {message}
    </Typo>
    {action}
  </Stack>
);
