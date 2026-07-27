import { Box } from '@mui/material';
import { Typo } from '@/shared/components/ui/Typo';
import { BOOK_STATUS_LABEL } from '@/shared/constants/bookStatus';
import { colorChips } from '@/shared/styles/colors';
import type { BookStatus } from '@/shared/types/book';

const TAG_COLORS: Record<BookStatus, { bg: string; text: string }> = {
  READING: { bg: colorChips.primary[100], text: colorChips.primary[700] },
  UPCOMING: {
    bg: colorChips.grayScale[200],
    text: colorChips.grayScale[700],
  },
  DONE: { bg: colorChips.secondary[100], text: colorChips.secondary[700] },
};

/** 책 상태 뱃지 — 사용자 언어 라벨 + 상태별 색 */
export const BookStatusTag = ({ status }: { status: BookStatus }) => {
  const { bg, text } = TAG_COLORS[status];
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1,
        py: 0.25,
        borderRadius: 1,
        backgroundColor: bg,
        width: 'fit-content',
        flexShrink: 0,
      }}
    >
      <Typo token="text_sb_12" color={text} sx={{ whiteSpace: 'nowrap' }}>
        {BOOK_STATUS_LABEL[status]}
      </Typo>
    </Box>
  );
};
