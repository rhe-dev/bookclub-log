import { Box, Stack } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { colorChips } from '@/shared/styles/colors';
import { lineClamp } from '@/shared/styles/mixins';

interface CommentAnchorProps {
  page: number | null;
  quote: string | null;
  /** compact는 목록 카드용 — 인용을 한 줄로 줄인다 */
  variant?: 'default' | 'compact';
}

/**
 * 코멘트 앵커 — 페이지 칩 + 인용 블록.
 * 토론 스레드와 마이페이지 카드가 같은 문법으로 보이도록 한 곳에서 관리한다.
 */
export const CommentAnchor = ({
  page,
  quote,
  variant = 'default',
}: CommentAnchorProps) => {
  if (!page && !quote) return null;
  const compact = variant === 'compact';

  return (
    <Stack spacing={0.75}>
      {page && (
        <Box
          sx={{
            alignSelf: 'flex-start',
            px: 0.75,
            py: 0.25,
            borderRadius: 1,
            backgroundColor: colorChips.primary[100],
          }}
        >
          <Typo token="text_sb_12" color={colorChips.primary[700]}>
            p.{page}
          </Typo>
        </Box>
      )}
      {quote && (
        <Box
          sx={{
            borderLeft: `3px solid ${colorChips.secondary[300]}`,
            // 페이지 배경(grayScale 100)과 거의 같아 인용이 배경에 묻혔다 — 흰색으로 띄운다
            backgroundColor: colorChips.basic.white,
            borderRadius: 1,
            px: 1.5,
            py: compact ? 0.75 : 1,
          }}
        >
          <Typo
            token={compact ? 'text_r_12' : 'text_r_14'}
            color={colorChips.grayScale[700]}
            sx={compact ? lineClamp(1) : undefined}
          >
            “{quote}”
          </Typo>
        </Box>
      )}
    </Stack>
  );
};
